<p align="center">
  <a href="README.md">EN</a>
  ·
  <a href="README.tr.md">TR</a>
  ·
  <a href="README.de.md">DE</a>
  ·
  <a href="README.es.md">ES</a>
</p>

# Filtrado de Fotos en Masa

Actualice múltiples imágenes usando el mismo ajuste preestablecido (preset). Aplique la misma configuración.

## Ejemplos

| Antes | Después |
|-------|---------|
| ![Antes](import/annie-spratt-Ng2UydNj4W8-unsplash.jpg) | ![Después](export/annie-spratt-Ng2UydNj4W8-unsplash.jpg) |
| ![Antes](import/pascal-debrunner-Z2720kCJg6I-unsplash.jpg) | ![Después](export/pascal-debrunner-Z2720kCJg6I-unsplash.jpg) |

## Instalación

Necesita Node.js y npm de [nodejs.org](https://nodejs.org).

Para instalar Node.js y npm, descargue el instalador del sitio web oficial o use un gestor de paquetes:

```bash
# windows (usando winget)
winget install OpenJS.NodeJS

# macos (usando homebrew)
brew install node

# linux (usando apt para Debian/Ubuntu)
sudo apt install nodejs npm
```

### Después de la instalación

```bash
# Abra una nueva ventana de terminal
# Compruebe si node y npm están instalados
node -v
npm -v
```

## ¿Cómo utilizarlo?

1. Abra una terminal en la carpeta del proyecto
2. Ejecute el comando `npm install`
3. Mueva sus imágenes a la carpeta `import/`
4. Actualice el archivo `preset.json` según sus necesidades
5. Ejecute el comando `npm start`
6. Espere los resultados
7. Compruebe la carpeta `export/`

## Scripts

### Start

```bash
npm start
```

Edita las imágenes de la carpeta `import/`. Aplica los filtros del archivo `preset.json`. Exporta a la carpeta `export/`.

### Clean

```bash
npm run clean
```

Elimina los archivos de las carpetas `import/` y `export/`.
