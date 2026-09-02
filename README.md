<p align="center">
  <a href="README.md">EN</a>
  ·
  <a href="README.tr.md">TR</a>
  ·
  <a href="README.de.md">DE</a>
  ·
  <a href="README.es.md">ES</a>
</p>

# Bulk Photo Filtering

Update multiple images using the same preset. Apply the same settings.

## Examples

| Before | After |
|--------|-------|
| ![Before](import/annie-spratt-Ng2UydNj4W8-unsplash.jpg) | ![After](export/annie-spratt-Ng2UydNj4W8-unsplash.jpg) |
| ![Before](import/pascal-debrunner-Z2720kCJg6I-unsplash.jpg) | ![After](export/pascal-debrunner-Z2720kCJg6I-unsplash.jpg) |

## Installation

You need Node.js and npm from [nodejs.org](https://nodejs.org)

To install Node.js and npm, download the installer from the official website or use a package manager:

```bash
# windows (using winget)
winget install OpenJS.NodeJS

# macos (using homebrew)
brew install node

# linux (using apt for Debian/Ubuntu)
sudo apt install nodejs npm
```

### Post installation

```bash
# Open a new terminal window
# Check if node and npm are installed
node -v
npm -v
```

## How to use?

1. Open a terminal in project folder
2. Execute `npm install` command
3. Move your images into `import/` folder
4. Update `preset.json` file according to your needs
5. Execute `npm start` command
6. Wait for the results
7. Check `export/` folder

## Scripts

### Start

```bash
npm start
```

Edit the images from `import/` folder. Apply the filters from `preset.json` file. Export to `export/` folder.

### Clean

```bash
npm run clean
```

Remove the files in `import/` and `export/` folders.

