(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    data: $("data"),
    logo: $("logo"),
    drop: $("drop"),
    dropText: $("drop-text"),
    removeLogo: $("remove-logo"),
    logoSize: $("logo-size"),
    logoSizeOut: $("logo-size-out"),
    logoMargin: $("logo-margin"),
    logoMarginOut: $("logo-margin-out"),
    logoBg: $("logo-bg"),
    dotColor: $("dot-color"),
    bgColor: $("bg-color"),
    bgTransparent: $("bg-transparent"),
    cornerColor: $("corner-color"),
    dotStyle: $("dot-style"),
    cornerStyle: $("corner-style"),
    size: $("size"),
    sizeOut: $("size-out"),
    filename: $("filename"),
    qr: $("qr"),
    hint: $("hint"),
    logoGroup: $("logo").closest(".group"),
  };

  const PREVIEW_SIZE = 380;
  let logoDataUrl = null;
  let cornerColorTouched = false;

  function cornerDotType(cornerStyle) {
    return cornerStyle === "square" ? "square" : "dot";
  }

  function buildOptions(size) {
    const hasLogo = Boolean(logoDataUrl);
    const transparent = els.bgTransparent.checked;
    return {
      width: size,
      height: size,
      type: "canvas",
      data: els.data.value.trim() || " ",
      margin: Math.round(size * 0.04),
      image: hasLogo ? logoDataUrl : undefined,
      qrOptions: {
        // H tolera ~30% de daño: necesario para que el logo no rompa la lectura.
        errorCorrectionLevel: hasLogo ? "H" : "M",
      },
      dotsOptions: { color: els.dotColor.value, type: els.dotStyle.value },
      cornersSquareOptions: { color: els.cornerColor.value, type: els.cornerStyle.value },
      cornersDotOptions: { color: els.cornerColor.value, type: cornerDotType(els.cornerStyle.value) },
      backgroundOptions: { color: transparent ? "rgba(0,0,0,0)" : els.bgColor.value },
      imageOptions: {
        crossOrigin: "anonymous",
        hideBackgroundDots: els.logoBg.checked,
        imageSize: Number(els.logoSize.value) / 100,
        margin: Math.round(Number(els.logoMargin.value) * (size / PREVIEW_SIZE)),
      },
    };
  }

  const qr = new QRCodeStyling(buildOptions(PREVIEW_SIZE));
  qr.append(els.qr);

  function updateHint() {
    const msgs = [];
    if (!els.data.value.trim()) msgs.push("Escribí un texto o URL para generar el QR.");
    if (logoDataUrl && Number(els.logoSize.value) > 33) {
      msgs.push("Logo grande: probá escanearlo antes de usarlo.");
    }
    if (contrastRatio(els.dotColor.value, els.bgTransparent.checked ? "#ffffff" : els.bgColor.value) < 3) {
      msgs.push("Poco contraste entre puntos y fondo: puede costar leerlo.");
    }
    els.hint.textContent = msgs.join(" ");
    els.hint.classList.toggle("warn", msgs.length > 0);
  }

  function render() {
    els.logoSizeOut.textContent = `${els.logoSize.value}%`;
    els.logoMarginOut.textContent = `${els.logoMargin.value}px`;
    els.sizeOut.textContent = `${els.size.value} px`;
    els.bgColor.disabled = els.bgTransparent.checked;
    els.logoGroup.classList.toggle("no-logo", !logoDataUrl);
    qr.update(buildOptions(PREVIEW_SIZE));
    updateHint();
  }

  // ---- Logo ----
  function loadLogo(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      logoDataUrl = reader.result;
      els.dropText.textContent = file.name;
      els.removeLogo.hidden = false;
      render();
    };
    reader.readAsDataURL(file);
  }

  els.logo.addEventListener("change", (e) => loadLogo(e.target.files[0]));
  els.removeLogo.addEventListener("click", () => {
    logoDataUrl = null;
    els.logo.value = "";
    els.dropText.textContent = "Elegí o arrastrá una imagen";
    els.removeLogo.hidden = true;
    render();
  });

  ["dragenter", "dragover"].forEach((ev) =>
    els.drop.addEventListener(ev, (e) => { e.preventDefault(); els.drop.classList.add("over"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    els.drop.addEventListener(ev, (e) => { e.preventDefault(); els.drop.classList.remove("over"); })
  );
  els.drop.addEventListener("drop", (e) => loadLogo(e.dataTransfer.files[0]));

  // ---- Controles ----
  // El color de esquinas sigue al de los puntos hasta que el usuario lo cambie a mano.
  els.cornerColor.addEventListener("input", () => { cornerColorTouched = true; });
  els.dotColor.addEventListener("input", () => {
    if (!cornerColorTouched) els.cornerColor.value = els.dotColor.value;
  });

  [
    els.data, els.logoSize, els.logoMargin, els.logoBg, els.dotColor, els.bgColor,
    els.bgTransparent, els.cornerColor, els.dotStyle, els.cornerStyle, els.size,
  ].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  // ---- Descarga ----
  document.querySelectorAll("[data-ext]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ext = btn.dataset.ext;
      const size = Number(els.size.value);
      const opts = buildOptions(size);
      if (ext === "svg") opts.type = "svg";
      // JPG no soporta transparencia: usar blanco si estaba transparente.
      if (ext === "jpeg" && els.bgTransparent.checked) opts.backgroundOptions.color = "#ffffff";
      const out = new QRCodeStyling(opts);
      const name = (els.filename.value.trim() || "codigo-qr").replace(/[\\/:*?"<>|]+/g, "-");
      out.download({ name, extension: ext });
    });
  });

  // ---- Contraste (WCAG) ----
  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
  function contrastRatio(a, b) {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  }

  render();
})();
