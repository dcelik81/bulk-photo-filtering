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
3. Execute `npm run dev` to start the desktop application

## Scripts

### Dev

```bash
npm run dev
```

Starts the application in development mode with a real-time preview.

### Build

```bash
npm run build
```

Builds the application for your operating system.

