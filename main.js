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
    tintR: 255,
    tintG: 178,
    tintB: 80,
    tintOpacity: 0.15,
    saturation: 0.8,
    brightness: 0.7,
    contrast: 1.5,
    gamma: 1.05,
    sharpen: {
        sigma: 1.2,
        m1: 1.0,
        m2: 2.0,
    },
    hue: 0,
    lightness: 0,
    blur: 0,
    median: 0,
    grayscale: false,
    negate: false,
    normalize: false,
    threshold: 0,
    clahe: false,
};

async function applyFilter(inputPath, outputPath, filterConfig) {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Renk katmanı oluştur (tint overlay) - eger tint ayarlari varsa
    let composites = [];
    if (filterConfig.tintOpacity > 0) {
        const tintOverlay = await sharp({
            create: {
                width,
                height,
                channels: 4,
                background: {
                    r: filterConfig.tintR || 0,
                    g: filterConfig.tintG || 0,
                    b: filterConfig.tintB || 0,
                    alpha: filterConfig.tintOpacity,
                },
            },
        })
            .png()
            .toBuffer();
        composites.push({ input: tintOverlay, blend: "over" });
    }

    let pipeline = image;

    const modulateOptions = {};
    if (filterConfig.brightness !== undefined) modulateOptions.brightness = filterConfig.brightness;
    if (filterConfig.saturation !== undefined) modulateOptions.saturation = filterConfig.saturation;
    if (filterConfig.hue !== undefined && filterConfig.hue !== 0) modulateOptions.hue = filterConfig.hue;
    if (filterConfig.lightness !== undefined && filterConfig.lightness !== 0) modulateOptions.lightness = filterConfig.lightness;
    
    if (Object.keys(modulateOptions).length > 0) {
        pipeline = pipeline.modulate(modulateOptions);
    }

    if (filterConfig.contrast !== undefined) {
        pipeline = pipeline.linear(filterConfig.contrast, -(128 * filterConfig.contrast) + 128); // kontrast
    }

    if (filterConfig.gamma !== undefined) {
        pipeline = pipeline.gamma(filterConfig.gamma);
    }

    if (filterConfig.grayscale) {
        pipeline = pipeline.grayscale();
    }

    if (filterConfig.negate) {
        pipeline = pipeline.negate();
    }

    if (filterConfig.normalize) {
        pipeline = pipeline.normalize();
    }

    if (filterConfig.clahe) {
        pipeline = pipeline.clahe(filterConfig.clahe);
    }

    if (filterConfig.median && filterConfig.median > 0) {
        pipeline = pipeline.median(filterConfig.median);
    }

    if (filterConfig.blur && filterConfig.blur > 0) {
        pipeline = pipeline.blur(filterConfig.blur);
    }

    if (filterConfig.sharpen) {
        pipeline = pipeline.sharpen({
            sigma: filterConfig.sharpen.sigma,
            m1: filterConfig.sharpen.m1,
            m2: filterConfig.sharpen.m2,
        });
    }

    if (filterConfig.threshold && filterConfig.threshold > 0) {
        pipeline = pipeline.threshold(filterConfig.threshold);
    }

    if (composites.length > 0) {
        pipeline = pipeline.composite(composites);
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

    console.log(`\nTamamlandı. Sonuçlar: ${outputDir}`);
}

main().catch((err) => {
    console.error("Hata:", err);
    process.exit(1);
});
