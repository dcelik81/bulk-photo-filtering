<p align="center">
  <a href="README.md">EN</a>
  ·
  <a href="README.tr.md">TR</a>
  ·
  <a href="README.de.md">DE</a>
  ·
  <a href="README.es.md">ES</a>
</p>

# Massen-Fotofilterung

Aktualisieren Sie mehrere Bilder mit demselben Preset. Wenden Sie dieselben Einstellungen auf alle an.

## Beispiele

| Vorher | Nachher |
|--------|---------|
| ![Vorher](import/annie-spratt-Ng2UydNj4W8-unsplash.jpg) | ![Nachher](export/annie-spratt-Ng2UydNj4W8-unsplash.jpg) |
| ![Vorher](import/pascal-debrunner-Z2720kCJg6I-unsplash.jpg) | ![Nachher](export/pascal-debrunner-Z2720kCJg6I-unsplash.jpg) |

## Installation

Sie benötigen Node.js und npm von [nodejs.org](https://nodejs.org).

Um Node.js und npm zu installieren, laden Sie den Installer von der offiziellen Website herunter oder verwenden Sie einen Paketmanager:

```bash
# windows (mit winget)
winget install OpenJS.NodeJS

# macos (mit homebrew)
brew install node

# linux (mit apt für Debian/Ubuntu)
sudo apt install nodejs npm
```

### Nach der Installation

```bash
# Öffnen Sie ein neues Terminalfenster
# Überprüfen Sie, ob node und npm installiert sind
node -v
npm -v
```

## Wie benutzt man das?

1. Öffnen Sie ein Terminal im Projektordner
2. Führen Sie den Befehl `npm install` aus
3. Führen Sie den Befehl `npm run dev` aus, um die Desktop-Anwendung zu starten

## Skripte

### Dev

```bash
npm run dev
```

Startet die Anwendung im Entwicklungsmodus mit einer Echtzeit-Vorschau.

### Build

```bash
npm run build
```

Erstellt die Anwendung für Ihr Betriebssystem.
