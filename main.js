import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const SUPPORTED_EXT = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".tiff",
    ".avif",
]);

const DEFAULT_FILTER = {
    modulate: {
        brightness: 1.05,
        saturation: 1.35
    },
    linear: [1.1, -12.8],
    gamma: 1.0,
    sharpen: {
        sigma: 1.0,
        m1: 1.0,
        m2: 2.0
    }
};

async function applyFilter(inputPath, outputPath, filterConfig) {
    let pipeline = sharp(inputPath);

    for (const [key, value] of Object.entries(filterConfig)) {
        if (typeof pipeline[key] === "function") {
            // Eğer özellik kapatılmışsa (false veya 0 gibi), pas geç
            if (value === false || value === 0) {
                continue;
            }

            // Değere göre sharp fonksiyonunu çalıştır
            if (value === true) {
                pipeline = pipeline[key]();
            } else if (Array.isArray(value)) {
                pipeline = pipeline[key](...value);
            } else {
                pipeline = pipeline[key](value);
            }
        }
    }

    await pipeline.toFile(outputPath);
}

async function main() {
    const inputDir = process.argv[2] || "import";
    const presetPath = process.argv[3] || "preset.json";
    const outputDir = "export";

    let filterConfig = DEFAULT_FILTER;
    try {
        const presetData = await fs.readFile(presetPath, "utf-8");
        filterConfig = { ...DEFAULT_FILTER, ...JSON.parse(presetData) };
        console.log(`"${presetPath}" preset dosyası yüklendi.`);
    } catch (err) {
        if (process.argv[3]) {
            console.error(`Hata: Belirtilen preset dosyası okunamadı (${presetPath}).`);
            process.exit(1);
        }
        console.log(`Varsayılan preset kullanılıyor (Özel ayarlar için '${presetPath}' oluşturabilirsiniz).`);
    }

    await fs.mkdir(outputDir, { recursive: true });

    const entries = await fs.readdir(inputDir, { withFileTypes: true });
    const files = entries.filter(
        (e) =>
            e.isFile() && SUPPORTED_EXT.has(path.extname(e.name).toLowerCase()),
    );

    if (files.length === 0) {
        console.log(
            `"${inputDir}" içinde desteklenen bir fotoğraf bulunamadı.`,
        );
        return;
    }

    console.log(`${files.length} fotoğraf bulundu. İşleniyor...`);

    for (const file of files) {
        const inputPath = path.join(inputDir, file.name);
        const outputPath = path.join(outputDir, file.name);
        try {
            await applyFilter(inputPath, outputPath, filterConfig);
            console.log(`✓ ${file.name}`);
        } catch (err) {
            console.error(`✗ ${file.name} işlenemedi:`, err.message);
        }
    }

    console.log(`\nTamamlandı. Sonuçlar ${outputDir} klasöründe.`);
}

main().catch((err) => {
    console.error("Hata:", err);
    process.exit(1);
});
