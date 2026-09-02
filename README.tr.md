<p align="center">
  <a href="README.md">EN</a>
  ·
  <a href="README.tr.md">TR</a>
  ·
  <a href="README.de.md">DE</a>
  ·
  <a href="README.es.md">ES</a>
</p>

# Toplu Fotoğraf Filtreleme

Aynı önayarı (preset) kullanarak birden fazla görseli güncelleyin. Tümüne aynı ayarları uygulayın.

## Örnekler

| Önce | Sonra |
|------|-------|
| ![Önce](import/annie-spratt-Ng2UydNj4W8-unsplash.jpg) | ![Sonra](export/annie-spratt-Ng2UydNj4W8-unsplash.jpg) |
| ![Önce](import/pascal-debrunner-Z2720kCJg6I-unsplash.jpg) | ![Sonra](export/pascal-debrunner-Z2720kCJg6I-unsplash.jpg) |

## Kurulum

[nodejs.org](https://nodejs.org) üzerinden Node.js ve npm'e ihtiyacınız var.

Node.js ve npm'i kurmak için resmi web sitesinden yükleyiciyi indirebilir veya bir paket yöneticisi kullanabilirsiniz:

```bash
# windows (winget kullanarak)
winget install OpenJS.NodeJS

# macos (homebrew kullanarak)
brew install node

# linux (Debian/Ubuntu için apt kullanarak)
sudo apt install nodejs npm
```

### Kurulum sonrası

```bash
# Yeni bir terminal penceresi açın
# node ve npm'in başarılı kurulup kurulmadığını kontrol edin
node -v
npm -v
```

## Nasıl kullanılır?

1. Proje klasöründe bir terminal açın
2. `npm install` komutunu çalıştırın
3. Görsellerinizi `import/` klasörüne taşıyın
4. `preset.json` dosyasını ihtiyaçlarınıza göre güncelleyin
5. `npm start` komutunu çalıştırın
6. İşlemin bitmesini bekleyin
7. Çıktılar için `export/` klasörünü kontrol edin

## Komutlar (Scripts)

### Başlat (Start)

```bash
npm start
```

`import/` klasöründeki fotoğrafları düzenler. `preset.json` dosyasındaki ayarları ve filtreleri uygular. İşlenen dosyaları `export/` klasörüne kaydeder.

### Temizle (Clean)

```bash
npm run clean
```

`import/` ve `export/` klasörlerindeki tüm dosyaları siler.
