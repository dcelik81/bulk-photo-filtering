/**
 * Renk dönüşüm ve hesaplama yardımcıları.
 * Hem WebGL LUT oluşturma hem de CPU piksel işleme için kullanılır.
 */

// ─── RGB ↔ HSL Dönüşümleri ────────────────────────────

export function rgbToHsl(r, g, b) {
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

export function hslToRgb(h, s, l) {
  if (s === 0) return [l, l, l];

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    hue2rgb(p, q, h + 1 / 3),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1 / 3),
  ];
}

// ─── Yardımcı Fonksiyonlar ────────────────────────────

/** Hue mesafesi (wrap-around ile) */
export function hueDist(h1, h2) {
  const d = Math.abs(h1 - h2);
  return Math.min(d, 1 - d);
}

/** Clamp */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Smoothstep */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// ─── Catmull-Rom Spline İnterpolasyonu ────────────────

/**
 * Kontrol noktalarından Catmull-Rom spline ile değer interpolasyonu.
 * @param {Array<{x:number, y:number}>} points - Sıralı kontrol noktaları
 * @param {number} x - Giriş değeri (0-1)
 * @returns {number} Çıkış değeri (0-1 clamp edilmiş)
 */
function interpolateCurve(points, x) {
  if (x <= points[0].x) return points[0].y;
  if (x >= points[points.length - 1].x) return points[points.length - 1].y;

  // Segmenti bul
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

  // Catmull-Rom spline
  const v =
    0.5 *
    (2 * p1.y +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

  return clamp(v, 0, 1);
}

/**
 * Kontrol noktalarından 256 elemanlı lookup table oluşturur.
 * @param {Array<{x:number, y:number}>} controlPoints
 * @returns {Float32Array} 256 elemanlı LUT (0-1 aralığında)
 */
export function generateCurveLUT(controlPoints) {
  const sorted = [...controlPoints].sort((a, b) => a.x - b.x);
  const lut = new Float32Array(256);

  for (let i = 0; i < 256; i++) {
    lut[i] = interpolateCurve(sorted, i / 255);
  }

  return lut;
}

/**
 * 4 tone curve'ü tek bir RGBA texture verisi olarak paketler.
 * R = Master RGB, G = Red, B = Green, A = Blue
 *
 * @param {object} settings - curveRGB, curveRed, curveGreen, curveBlue alanları
 * @returns {Uint8Array} 256×1 RGBA piksel verisi (256 × 4 = 1024 byte)
 */
export function generateCurveLUTData(settings) {
  const masterLUT = generateCurveLUT(settings.curveRGB);
  const redLUT = generateCurveLUT(settings.curveRed);
  const greenLUT = generateCurveLUT(settings.curveGreen);
  const blueLUT = generateCurveLUT(settings.curveBlue);

  const data = new Uint8Array(256 * 4);

  for (let i = 0; i < 256; i++) {
    data[i * 4 + 0] = Math.round(masterLUT[i] * 255); // R = master
    data[i * 4 + 1] = Math.round(redLUT[i] * 255);    // G = red channel
    data[i * 4 + 2] = Math.round(greenLUT[i] * 255);   // B = green channel
    data[i * 4 + 3] = Math.round(blueLUT[i] * 255);    // A = blue channel
  }

  return data;
}
