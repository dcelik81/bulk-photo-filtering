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

## Kurulum

[bun.sh](https://bun.sh) üzerinden `bun` paket yöneticisine ihtiyacınız var.

```bash
# windows
powershell -c "irm bun.sh/install.ps1|iex"

# macos / linux
curl -fsSL https://bun.sh/install | bash
```

### Kurulum sonrası

```bash
# Yeni bir terminal penceresi açın
# bun'ın başarılı kurulup kurulmadığını kontrol edin
bun -v
```

## Nasıl kullanılır?

1. Proje klasöründe bir terminal açın
2. `bun i` komutunu çalıştırın
3. Görsellerinizi `import/` klasörüne taşıyın
4. `preset.json` dosyasını ihtiyaçlarınıza göre güncelleyin
5. `bun start` komutunu çalıştırın
6. İşlemin bitmesini bekleyin
7. Çıktılar için `export/` klasörünü kontrol edin

## Komutlar (Scripts)

### Başlat (Start)

```bash
bun start
```

`import/` klasöründeki fotoğrafları düzenler. `preset.json` dosyasındaki ayarları ve filtreleri uygular. İşlenen dosyaları `export/` klasörüne kaydeder.

### Temizle (Clean)

```bash
bun run clean
```

`import/` ve `export/` klasörlerindeki tüm dosyaları siler.
