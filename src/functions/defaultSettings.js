/**
 * Tüm düzenleme panelleri için varsayılan ayarlar.
 * Her yeni panel grubunun varsayılan değerleri "identity" olmalıdır
 * (yani fotoğrafta hiçbir değişiklik yapmamalıdır).
 */
export const DEFAULT_SETTINGS = {
  // ─── Basic (Mevcut) ─────────────────────────
  brightness: 0.9,
  saturation: 1.35,
  gamma: 1.0,
  linearMult: 1.1,
  linearOffset: -12.8,
  sharpenSigma: 1.0,

  // ─── White Balance ──────────────────────────
  temperature: 0,   // -100 (mavi) … +100 (sarı)
  tint: 0,          // -100 (yeşil) … +100 (magenta)

  // ─── Global Color ───────────────────────────
  vibrance: 0,      // -100 … +100

  // ─── Tone Curves ────────────────────────────
  curveRGB:   [{ x: 0, y: 0 }, { x: 0.25, y: 0.25 }, { x: 0.75, y: 0.75 }, { x: 1, y: 1 }],
  curveRed:   [{ x: 0, y: 0 }, { x: 0.25, y: 0.25 }, { x: 0.75, y: 0.75 }, { x: 1, y: 1 }],
  curveGreen: [{ x: 0, y: 0 }, { x: 0.25, y: 0.25 }, { x: 0.75, y: 0.75 }, { x: 1, y: 1 }],
  curveBlue:  [{ x: 0, y: 0 }, { x: 0.25, y: 0.25 }, { x: 0.75, y: 0.75 }, { x: 1, y: 1 }],

  // ─── HSL — Hue (8 kanal, -180 … +180) ──────
  hslHueRed: 0,     hslHueOrange: 0,  hslHueYellow: 0,  hslHueGreen: 0,
  hslHueAqua: 0,    hslHueBlue: 0,    hslHuePurple: 0,  hslHueMagenta: 0,

  // ─── HSL — Saturation (8 kanal, -100 … +100)
  hslSatRed: 0,     hslSatOrange: 0,  hslSatYellow: 0,  hslSatGreen: 0,
  hslSatAqua: 0,    hslSatBlue: 0,    hslSatPurple: 0,  hslSatMagenta: 0,

  // ─── HSL — Luminance (8 kanal, -100 … +100)
  hslLumRed: 0,     hslLumOrange: 0,  hslLumYellow: 0,  hslLumGreen: 0,
  hslLumAqua: 0,    hslLumBlue: 0,    hslLumPurple: 0,  hslLumMagenta: 0,

  // ─── Color Grading ─────────────────────────
  cgShadowsHue: 0,     cgShadowsSat: 0,     cgShadowsLum: 0,
  cgMidtonesHue: 0,    cgMidtonesSat: 0,    cgMidtonesLum: 0,
  cgHighlightsHue: 0,  cgHighlightsSat: 0,  cgHighlightsLum: 0,
  cgGlobalHue: 0,      cgGlobalSat: 0,      cgGlobalLum: 0,
  cgBlending: 50,   // 0 … 100
  cgBalance: 0,     // -100 … +100

  // ─── Point Color ────────────────────────────
  pcEnabled: false,
  pcTargetHue: 0,    pcTargetSat: 50,   pcTargetLum: 50,
  pcHueShift: 0,     pcSatShift: 0,     pcLumShift: 0,
  pcHueRange: 30,    pcSatRange: 50,    pcLumRange: 50,

  // ─── B&W Mix ────────────────────────────────
  bwEnabled: false,
  bwRed: 30,   bwOrange: 50,  bwYellow: 60,  bwGreen: 40,
  bwAqua: 50,  bwBlue: 20,    bwPurple: 30,  bwMagenta: 25,

  // ─── Calibration ────────────────────────────
  calShadowsTint: 0,  // -100 (yeşil) … +100 (magenta)
  calRedHue: 0,    calRedSat: 0,
  calGreenHue: 0,  calGreenSat: 0,
  calBlueHue: 0,   calBlueSat: 0,

  // ─── Local Adjustments (Masking) ────────────
  localEnabled: false,
  localMaskHue: 0,       localMaskSat: 100,    localMaskLum: 50,
  localMaskHueRange: 30, localMaskSatRange: 50, localMaskLumRange: 50,
  localHueRotation: 0,   // 0 … 360
  localSaturation: 0,    // -100 … +100
  localTemperature: 0,   // -100 … +100
  localTint: 0,          // -100 … +100
  localShowMask: false,
};

/** 8 HSL kanalının merkez tonları (0-1 aralığında, 0°-360° karşılığı) */
export const HSL_CHANNEL_CENTERS = [
  0.0,       // Red       (0°)
  30 / 360,  // Orange    (30°)
  60 / 360,  // Yellow    (60°)
  120 / 360, // Green     (120°)
  180 / 360, // Aqua      (180°)
  240 / 360, // Blue      (240°)
  270 / 360, // Purple    (270°)
  300 / 360, // Magenta   (300°)
];

/** 8 HSL kanal isimleri */
export const HSL_CHANNEL_NAMES = [
  'Red', 'Orange', 'Yellow', 'Green', 'Aqua', 'Blue', 'Purple', 'Magenta',
];

/** Her HSL kanalı için renk kodu (UI slider arkaplanları için) */
export const HSL_CHANNEL_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Aqua
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Magenta
];
