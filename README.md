# Bulk Photo Filtering

Update multiple images using the same preset. Apply the same settings.

## Installation

You need bun package manager from [bun.sh](https://bun.sh)

```bash
# windows
powershell -c "irm bun.sh/install.ps1|iex"

# macos / linux
curl -fsSL https://bun.sh/install | bash
```

### Post installation

```bash
# Open a new terminal window
# Check if bun is installed
bun -v
```

## How to use?

1. Open a terminal in project folder
2. Execute `bun i` command
3. Move your images into `import/` folder
4. Update `preset.json` file according to your needs
5. Execute `bun start` command
6. Wait for the results
7. Check `export/` folder

## Scripts

### Start

```bash
bun start
```

Edit the images from `import/` folder. Apply the filters from `preset.json` file. Export to `export/` folder.

### Clean

```bash
bun run clean
```

Remove the files in `import/` and `export/` folders.

