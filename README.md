# CORRE, NEGAN — página oficial del juego

Landing page estática (HTML + CSS + JS, sin frameworks) para publicar en GitHub Pages.
El juego de Unity WebGL se carga dentro de la sección «Jugar ahora».

```
index.html          ← la página
css/style.css
js/main.js
assets/             ← hero.jpg, negan.webp, freddy.webp, og.jpg, favicon.svg
juego/              ← AQUÍ va el build de Unity WebGL (index.html + Build/ + TemplateData/)
.nojekyll
```

## 1. Exportar el juego desde Unity
1. Copia `WebGLBuild.cs` (te lo paso como archivo aparte) a `Assets/Editor/` de tu proyecto Unity.
2. Menú **Dino Runner > Exportar WebGL (para la pagina web)** y elige una carpeta de salida.
   (Necesitas el módulo *WebGL Build Support* en Unity Hub.)
3. Copia TODO el contenido de esa carpeta dentro de `juego/` (reemplaza el `index.html` de ejemplo).

## 2. Subir a GitHub
```bash
cd corre-negan-web
git init
git add .
git commit -m "Pagina oficial de CORRE, NEGAN"
git branch -M main
git remote add origin https://github.com/patrick145-maker/corre-negan.git
git push -u origin main
```
(Antes crea el repositorio vacío `corre-negan` en GitHub, público, sin README.)

## 3. Activar GitHub Pages
Repositorio > **Settings > Pages** > *Build and deployment* > Source: **Deploy from a branch** >
Branch: **main** / **/(root)** > Save.
En 1–2 minutos queda en: `https://patrick145-maker.github.io/corre-negan/`

## Límites de GitHub a tener en cuenta
- Un archivo no puede pasar de **100 MB** (el `.data` del build es el que más pesa).
- No uses Git LFS: GitHub Pages no sirve esos archivos.
- La subida desde el navegador acepta máximo 25 MB por archivo: usa `git` o GitHub Desktop.
- Si el `.data` pesa mucho, baja los polígonos de Freddy en Blender (Modifier **Decimate**, ratio 0.05–0.1) y vuelve a exportar.

## Personalizar
- Nombre del juego: busca y reemplaza `CORRE, NEGAN` en `index.html`.
- Textos de la historia: sección `#historia` de `index.html`.
- Imágenes: cambia `assets/hero.jpg` por una captura de tu juego si prefieres.
