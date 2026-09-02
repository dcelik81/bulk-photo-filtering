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
3. Masaüstü uygulamasını başlatmak için `npm run dev` komutunu çalıştırın

## Komutlar (Scripts)

### Geliştirme (Dev)

```bash
npm run dev
```

Uygulamayı geliştirme modunda gerçek zamanlı önizleme ile başlatır.

### Derleme (Build)

```bash
npm run build
```

Uygulamayı işletim sisteminiz için derler.
