# Generador QR

Página estática para crear códigos QR, con o sin una imagen en el centro. Todo se procesa en el navegador: no hay servidor ni se guarda nada.

## Funciones

- QR a partir de texto o URL, con vista previa en vivo
- Imagen central opcional (elegir o arrastrar), con tamaño, espacio y fondo limpio ajustables
- Colores de puntos, fondo y esquinas, y fondo transparente
- Formas de puntos y esquinas
- Descarga en PNG, SVG o JPG, de 256 a 2048 px
- Aviso si el logo es muy grande o si hay poco contraste

Cuando hay logo se usa corrección de errores nivel **H** (~30%), para que el código se siga leyendo.

## Archivos

- `index.html`: estructura
- `styles.css`: estilos (incluye modo oscuro y diseño para celular)
- `app.js`: lógica; usa [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) desde CDN

## Publicar en GitHub Pages

1. Creá un repositorio y subí estos archivos a la raíz.
2. Andá a **Settings → Pages**.
3. En *Source* elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guardá.
4. En uno o dos minutos queda en `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

## Probar en local

Abrí `index.html` directamente en el navegador, o levantá un servidor simple:

```bash
npx serve .
```
