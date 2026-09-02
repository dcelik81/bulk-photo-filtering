/**
 * CPU tabanlı piksel işleme — Export pipeline için.
 * WebGL shader'daki aynı renk düzenleme algoritmasını JavaScript'te uygular.
 */
'use strict';

// ─── Yardımcı Fonksiyonlar ────────────────────

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hueDist(h1, h2) {
  const d = Math.abs(h1 - h2);
  return Math.min(d, 1 - d);
}

// ─── RGB ↔ HSL ────────────────────────────────

function rgb2hsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) * 0.5;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h, s, l];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hsl2rgb(h, s, l) {
  if (s < 0.001) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

function fract(v) {
  return v - Math.floor(v);
}

// ─── Curve LUT ────────────────────────────────

function interpolateCurve(points, x) {
  if (x <= points[0].x) return points[0].y;
  if (x >= points[points.length - 1].x) return points[points.length - 1].y;

  let i = 0;
  while (i < points.length - 1 && points[i + 1].x < x) i++;

  const p0 = points[Math.max(0, i - 1)];
  const p1 = points[i];
  const p2 = points[Math.min(points.length - 1, i + 1)];
  const p3 = points[Math.min(points.length - 1, i + 2)];

  const dx = p2.x - p1.x;
  if (dx < 0.001) return p1.y;

  const t = (x - p1.x) / dx;
  const t2 = t * t;
  const t3 = t2 * t;

  const v = 0.5 * (
    2 * p1.y +
    (-p0.y + p2.y) * t +
    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
  );

  return clamp(v, 0, 1);
}

function generateCurveLUT(controlPoints) {
  const sorted = [...controlPoints].sort((a, b) => a.x - b.x);
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = interpolateCurve(sorted, i / 255);
  }
  return lut;
}

// ─── Sabit Değerler ───────────────────────────

const CENTERS = [0.0, 30 / 360, 60 / 360, 120 / 360, 180 / 360, 240 / 360, 270 / 360, 300 / 360];

// ─── Ana İşleme Fonksiyonu ────────────────────

/**
 * Piksel buffer'ını tüm renk ayarlarıyla işler. (Event loop'u bloklamamak için async)
 * @param {Buffer} buffer - Raw piksel verisi (RGB veya RGBA)
 * @param {number} width
 * @param {number} height
 * @param {number} channels - 3 (RGB) veya 4 (RGBA)
 * @param {object} settings - Tam ayarlar nesnesi
 * @returns {Promise<Buffer>} İşlenmiş piksel verisi
 */
async function processPixelBuffer(buffer, width, height, channels, settings) {
  // Pre-compute LUT'lar
  const masterLUT = generateCurveLUT(settings.curveRGB || [{ x: 0, y: 0 }, { x: 1, y: 1 }]);
  const redLUT = generateCurveLUT(settings.curveRed || [{ x: 0, y: 0 }, { x: 1, y: 1 }]);
  const greenLUT = generateCurveLUT(settings.curveGreen || [{ x: 0, y: 0 }, { x: 1, y: 1 }]);
  const blueLUT = generateCurveLUT(settings.curveBlue || [{ x: 0, y: 0 }, { x: 1, y: 1 }]);

  // HSL dizileri
  const hslHue = [
    settings.hslHueRed || 0, settings.hslHueOrange || 0, settings.hslHueYellow || 0, settings.hslHueGreen || 0,
    settings.hslHueAqua || 0, settings.hslHueBlue || 0, settings.hslHuePurple || 0, settings.hslHueMagenta || 0,
  ];
  const hslSat = [
    settings.hslSatRed || 0, settings.hslSatOrange || 0, settings.hslSatYellow || 0, settings.hslSatGreen || 0,
    settings.hslSatAqua || 0, settings.hslSatBlue || 0, settings.hslSatPurple || 0, settings.hslSatMagenta || 0,
  ];
  const hslLum = [
    settings.hslLumRed || 0, settings.hslLumOrange || 0, settings.hslLumYellow || 0, settings.hslLumGreen || 0,
    settings.hslLumAqua || 0, settings.hslLumBlue || 0, settings.hslLumPurple || 0, settings.hslLumMagenta || 0,
  ];

  // B&W mix dizisi
  const bwMix = [
    settings.bwRed || 30, settings.bwOrange || 50, settings.bwYellow || 60, settings.bwGreen || 40,
    settings.bwAqua || 50, settings.bwBlue || 20, settings.bwPurple || 30, settings.bwMagenta || 25,
  ];

  const pixelCount = width * height;
  const brightness = settings.brightness ?? 1.0;
  const gamma = Math.max(settings.gamma ?? 1.0, 0.01);
  const linearMult = settings.linearMult ?? 1.0;
  const linearOffset = settings.linearOffset ?? 0;
  const saturation = settings.saturation ?? 1.0;
  const temperature = settings.temperature ?? 0;
  const tint = settings.tint ?? 0;
  const vibrance = settings.vibrance ?? 0;

  for (let i = 0; i < pixelCount; i++) {
    const idx = i * channels;
    let r = buffer[idx] / 255;
    let g = buffer[idx + 1] / 255;
    let b = buffer[idx + 2] / 255;

    // 1. Brightness
    r *= brightness;
    g *= brightness;
    b *= brightness;

    // 2. Linear
    r = r * linearMult + linearOffset / 255;
    g = g * linearMult + linearOffset / 255;
    b = b * linearMult + linearOffset / 255;
    r = clamp(r, 0, 1);
    g = clamp(g, 0, 1);
    b = clamp(b, 0, 1);

    // 3. Gamma
    r = Math.pow(r, 1 / gamma);
    g = Math.pow(g, 1 / gamma);
    b = Math.pow(b, 1 / gamma);

    // 4. White Balance
    {
      const tf = temperature / 100;
      const ti = tint / 100;
      r *= 1 + tf * 0.3;
      b *= 1 - tf * 0.3;
      g *= 1 - ti * 0.2;
      r *= 1 + ti * 0.1;
      b *= 1 + ti * 0.1;
      r = clamp(r, 0, 1);
      g = clamp(g, 0, 1);
      b = clamp(b, 0, 1);
    }

    // 5. Vibrance
    {
      const avg = (r + g + b) / 3;
      const curSat = Math.max(r, g, b) - Math.min(r, g, b);
      const vibF = vibrance / 100 * (1 - curSat);
      const mix = 1 + vibF;
      r = avg + (r - avg) * mix;
      g = avg + (g - avg) * mix;
      b = avg + (b - avg) * mix;
      r = clamp(r, 0, 1);
      g = clamp(g, 0, 1);
      b = clamp(b, 0, 1);
    }

    // 6. Saturation
    {
      const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;
      r = luma + (r - luma) * saturation;
      g = luma + (g - luma) * saturation;
      b = luma + (b - luma) * saturation;
      r = clamp(r, 0, 1);
      g = clamp(g, 0, 1);
      b = clamp(b, 0, 1);
    }

    // 7. Calibration
    {
      const calShadowsTint = settings.calShadowsTint || 0;
      const calRedHue = settings.calRedHue || 0;
      const calRedSat = settings.calRedSat || 0;
      const calGreenHue = settings.calGreenHue || 0;
      const calGreenSat = settings.calGreenSat || 0;
      const calBlueHue = settings.calBlueHue || 0;
      const calBlueSat = settings.calBlueSat || 0;

      let [ch, cs, cl] = rgb2hsl(r, g, b);
      const shadowInf = 1 - smoothstep(0, 0.3, cl);
      ch = fract(ch + shadowInf * calShadowsTint / 100 * 0.05);
      [r, g, b] = hsl2rgb(ch, cs, cl);

      const redInf = Math.max(0, r - Math.max(g, b));
      r += redInf * calRedHue / 100 * 0.2;
      r *= 1 + redInf * calRedSat / 100 * 0.3;

      const greenInf = Math.max(0, g - Math.max(r, b));
      g += greenInf * calGreenHue / 100 * 0.2;
      g *= 1 + greenInf * calGreenSat / 100 * 0.3;

      const blueInf = Math.max(0, b - Math.max(r, g));
      b += blueInf * calBlueHue / 100 * 0.2;
      b *= 1 + blueInf * calBlueSat / 100 * 0.3;

      r = clamp(r, 0, 1);
      g = clamp(g, 0, 1);
      b = clamp(b, 0, 1);
    }

    // 8. Tone Curves
    {
      let newR = redLUT[Math.round(clamp(r, 0, 1) * 255)];
      let newG = greenLUT[Math.round(clamp(g, 0, 1) * 255)];
      let newB = blueLUT[Math.round(clamp(b, 0, 1) * 255)];
      r = masterLUT[Math.round(clamp(newR, 0, 1) * 255)];
      g = masterLUT[Math.round(clamp(newG, 0, 1) * 255)];
      b = masterLUT[Math.round(clamp(newB, 0, 1) * 255)];
    }

    // 9. HSL Adjustments
    {
      let [h, s, l] = rgb2hsl(r, g, b);
      let totalW = 0, hS = 0, sS = 0, lS = 0;
      for (let j = 0; j < 8; j++) {
        const w = 1 - smoothstep(0, 0.08, hueDist(h, CENTERS[j]));
        totalW += w;
        hS += w * hslHue[j];
        sS += w * hslSat[j];
        lS += w * hslLum[j];
      }
      if (totalW > 0.001) { hS /= totalW; sS /= totalW; lS /= totalW; }
      h = fract(h + hS / 360);
      s = clamp(s * (1 + sS / 100), 0, 1);
      l = clamp(l + lS / 200, 0, 1);
      [r, g, b] = hsl2rgb(h, s, l);
      r = clamp(r, 0, 1); g = clamp(g, 0, 1); b = clamp(b, 0, 1);
    }

    // 10. Color Grading
    {
      const cgBlending = (settings.cgBlending ?? 50) / 100;
      const cgBalance = (settings.cgBalance ?? 0) / 200;
      const cgLum = r * 0.2126 + g * 0.7152 + b * 0.0722;

      const shadowW = 1 - smoothstep(0, 0.33 + cgBalance, cgLum);
      const highW = smoothstep(0.67 + cgBalance, 1, cgLum);
      const midW = Math.max(0, 1 - shadowW - highW);

      const applyGrading = (hue, sat, lum, weight) => {
        if (sat > 0.001) {
          const [tr, tg, tb] = hsl2rgb(hue / 360, 1, 0.5);
          const str = weight * cgBlending * sat / 100;
          const mix = 1 - str * 0.5;
          r = r * mix + r * tr * 2 * str * 0.5;
          g = g * mix + g * tg * 2 * str * 0.5;
          b = b * mix + b * tb * 2 * str * 0.5;
          r += weight * lum / 400;
          g += weight * lum / 400;
          b += weight * lum / 400;
        }
      };

      applyGrading(settings.cgShadowsHue || 0, settings.cgShadowsSat || 0, settings.cgShadowsLum || 0, shadowW);
      applyGrading(settings.cgMidtonesHue || 0, settings.cgMidtonesSat || 0, settings.cgMidtonesLum || 0, midW);
      applyGrading(settings.cgHighlightsHue || 0, settings.cgHighlightsSat || 0, settings.cgHighlightsLum || 0, highW);
      applyGrading(settings.cgGlobalHue || 0, settings.cgGlobalSat || 0, settings.cgGlobalLum || 0, 1);

      r = clamp(r, 0, 1); g = clamp(g, 0, 1); b = clamp(b, 0, 1);
    }

    // 11. Point Color
    if (settings.pcEnabled) {
      let [ph, ps, pl] = rgb2hsl(r, g, b);
      const hW = 1 - smoothstep(0, Math.max((settings.pcHueRange || 30) / 360, 0.001), hueDist(ph, (settings.pcTargetHue || 0) / 360));
      const sW = 1 - smoothstep(0, Math.max((settings.pcSatRange || 50) / 100, 0.001), Math.abs(ps - (settings.pcTargetSat || 50) / 100));
      const lW = 1 - smoothstep(0, Math.max((settings.pcLumRange || 50) / 100, 0.001), Math.abs(pl - (settings.pcTargetLum || 50) / 100));
      const pcW = hW * sW * lW;

      ph = fract(ph + pcW * (settings.pcHueShift || 0) / 360);
      ps = clamp(ps + pcW * (settings.pcSatShift || 0) / 100, 0, 1);
      pl = clamp(pl + pcW * (settings.pcLumShift || 0) / 200, 0, 1);
      [r, g, b] = hsl2rgb(ph, ps, pl);
      r = clamp(r, 0, 1); g = clamp(g, 0, 1); b = clamp(b, 0, 1);
    }

    // 12. B&W Mix
    if (settings.bwEnabled) {
      let [bh, bs] = rgb2hsl(r, g, b);
      let totalW = 0, mixV = 0;
      for (let j = 0; j < 8; j++) {
        let w = 1 - smoothstep(0, 0.08, hueDist(bh, CENTERS[j]));
        w *= bs;
        totalW += w;
        mixV += w * bwMix[j] / 100;
      }
      const baseLum = r * 0.2126 + g * 0.7152 + b * 0.0722;
      let bwLum = baseLum;
      if (totalW > 0.001) {
        bwLum = baseLum + (mixV / totalW - 0.4) * 0.5;
      }
      r = g = b = clamp(bwLum, 0, 1);
    }

    // 13. Local Adjustments (mask gösterme yok - export'ta anlamsız)
    if (settings.localEnabled) {
      let [lh, ls, ll] = rgb2hsl(r, g, b);
      const hW = 1 - smoothstep(0, Math.max((settings.localMaskHueRange || 30) / 360, 0.001), hueDist(lh, (settings.localMaskHue || 0) / 360));
      const sW = 1 - smoothstep(0, Math.max((settings.localMaskSatRange || 50) / 100, 0.001), Math.abs(ls - (settings.localMaskSat || 100) / 100));
      const lW = 1 - smoothstep(0, Math.max((settings.localMaskLumRange || 50) / 100, 0.001), Math.abs(ll - (settings.localMaskLum || 50) / 100));
      const mW = hW * sW * lW;

      lh = fract(lh + mW * (settings.localHueRotation || 0) / 360);
      ls = clamp(ls * (1 + mW * (settings.localSaturation || 0) / 100), 0, 1);
      let [lr, lg, lb] = hsl2rgb(lh, ls, ll);

      const lt = (settings.localTemperature || 0) / 100 * mW;
      const lti = (settings.localTint || 0) / 100 * mW;
      lr *= 1 + lt * 0.3;
      lb *= 1 - lt * 0.3;
      lg *= 1 - lti * 0.2;

      r = r * (1 - mW) + clamp(lr, 0, 1) * mW;
      g = g * (1 - mW) + clamp(lg, 0, 1) * mW;
      b = b * (1 - mW) + clamp(lb, 0, 1) * mW;
    }

    // Sonucu yaz
    buffer[idx] = clamp(Math.round(r * 255), 0, 255);
    buffer[idx + 1] = clamp(Math.round(g * 255), 0, 255);
    buffer[idx + 2] = clamp(Math.round(b * 255), 0, 255);

    // Ağır işlemlerde UI'ın donmasını engellemek için event loop'un işlemesine izin ver
    if (i % 500000 === 0 && i > 0) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }

  return buffer;
}

module.exports = { processPixelBuffer };
