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

// Filtre ayarları — referans fotoğraftaki gibi sıcak/turuncu-sarı ton
const FILTER = {
    tintR: 255,
    tintG: 178,
    tintB: 80,
    tintOpacity: 0.15, // 0-1 arası, tonun gücü
    saturation: 0.8,
    brightness: 0.7,
    contrast: 1.5,
    gamma: 1.05,
    sharpen: {
        sigma: 1.2, // keskinlik yarıçapı — yüksek değer daha geniş/güçlü keskinlik
        m1: 1.0, // düz alanlardaki keskinlik miktarı
        m2: 2.0, // kenarlardaki keskinlik miktarı
    },
};

async function applyWarmFilter(inputPath, outputPath) {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Sıcak renk katmanı oluştur (tint overlay)
    const tintOverlay = await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: {
                r: FILTER.tintR,
                g: FILTER.tintG,
                b: FILTER.tintB,
                alpha: FILTER.tintOpacity,
            },
        },
    })
        .png()
        .toBuffer();

    const composites = [{ input: tintOverlay, blend: "over" }];

    let pipeline = image
        .modulate({
            brightness: FILTER.brightness,
            saturation: FILTER.saturation,
        })
        .linear(FILTER.contrast, -(128 * FILTER.contrast) + 128) // kontrast
        .gamma(FILTER.gamma);

    if (FILTER.sharpen) {
        pipeline = pipeline.sharpen({
            sigma: FILTER.sharpen.sigma,
            m1: FILTER.sharpen.m1,
            m2: FILTER.sharpen.m2,
        });
    }

    await pipeline.composite(composites).toFile(outputPath);
}

async function main() {
    const inputDir = process.argv[2] || "import";
    const outputDir = "export";

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
            await applyWarmFilter(inputPath, outputPath);
            console.log(`✓ ${file.name}`);
        } catch (err) {
            console.error(`✗ ${file.name} işlenemedi:`, err.message);
        }
    }

    console.log(`\nTamamlandı. Sonuçlar: ${outputDir}`);
}

main().catch((err) => {
    console.error("Hata:", err);
    process.exit(1);
});
