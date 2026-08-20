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

## Instalación

Necesita el gestor de paquetes bun de [bun.sh](https://bun.sh).

```bash
# windows
powershell -c "irm bun.sh/install.ps1|iex"

# macos / linux
curl -fsSL https://bun.sh/install | bash
```

### Después de la instalación

```bash
# Abra una nueva ventana de terminal
# Compruebe si bun está instalado
bun -v
```

## ¿Cómo utilizarlo?

1. Abra una terminal en la carpeta del proyecto
2. Ejecute el comando `bun i`
3. Mueva sus imágenes a la carpeta `import/`
4. Actualice el archivo `preset.json` según sus necesidades
5. Ejecute el comando `bun start`
6. Espere los resultados
7. Compruebe la carpeta `export/`

## Scripts

### Start

```bash
bun start
```

Edita las imágenes de la carpeta `import/`. Aplica los filtros del archivo `preset.json`. Exporta a la carpeta `export/`.

### Clean

```bash
bun run clean
```

Elimina los archivos de las carpetas `import/` y `export/`.
