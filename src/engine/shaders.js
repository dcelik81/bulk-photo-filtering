/**
 * GLSL shader kaynak kodları — WebGL2.
 * Vertex shader + Color fragment shader + Sharpen fragment shader.
 */

// ─── Vertex Shader (Paylaşımlı) ──────────────────────

export const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

// ─── Color Fragment Shader (Ana İşleme) ───────────────

export const COLOR_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform sampler2D u_curveLUT; // 256x1 RGBA: R=master, G=red, B=green, A=blue

// Basic
uniform float u_brightness;
uniform float u_gamma;
uniform float u_linearMult;
uniform float u_linearOffset;
uniform float u_saturation; // multiplicative (1.0 = no change)

// White Balance
uniform float u_temperature;
uniform float u_tint;

// Vibrance
uniform float u_vibrance;

// HSL (8 channels)
uniform float u_hslHue[8];
uniform float u_hslSat[8];
uniform float u_hslLum[8];

// Color Grading
uniform float u_cgShadowsHue;
uniform float u_cgShadowsSat;
uniform float u_cgShadowsLum;
uniform float u_cgMidtonesHue;
uniform float u_cgMidtonesSat;
uniform float u_cgMidtonesLum;
uniform float u_cgHighlightsHue;
uniform float u_cgHighlightsSat;
uniform float u_cgHighlightsLum;
uniform float u_cgGlobalHue;
uniform float u_cgGlobalSat;
uniform float u_cgGlobalLum;
uniform float u_cgBlending;
uniform float u_cgBalance;

// Point Color
uniform float u_pcEnabled;
uniform float u_pcTargetHue;
uniform float u_pcTargetSat;
uniform float u_pcTargetLum;
uniform float u_pcHueShift;
uniform float u_pcSatShift;
uniform float u_pcLumShift;
uniform float u_pcHueRange;
uniform float u_pcSatRange;
uniform float u_pcLumRange;

// B&W
uniform float u_bwEnabled;
uniform float u_bwMix[8];

// Calibration
uniform float u_calShadowsTint;
uniform float u_calRedHue;
uniform float u_calRedSat;
uniform float u_calGreenHue;
uniform float u_calGreenSat;
uniform float u_calBlueHue;
uniform float u_calBlueSat;

// Local Adjustments
uniform float u_localEnabled;
uniform float u_localMaskHue;
uniform float u_localMaskSat;
uniform float u_localMaskLum;
uniform float u_localMaskHueRange;
uniform float u_localMaskSatRange;
uniform float u_localMaskLumRange;
uniform float u_localHueRotation;
uniform float u_localSaturation;
uniform float u_localTemperature;
uniform float u_localTint;
uniform float u_showMask;

// ── Yardımcı Fonksiyonlar ──

float hueDist(float h1, float h2) {
  float d = abs(h1 - h2);
  return min(d, 1.0 - d);
}

vec3 rgb2hsl(vec3 c) {
  float cMax = max(c.r, max(c.g, c.b));
  float cMin = min(c.r, min(c.g, c.b));
  float delta = cMax - cMin;
  float l = (cMax + cMin) * 0.5;
  float s = 0.0;
  float h = 0.0;

  if (delta > 0.001) {
    s = l < 0.5 ? delta / (cMax + cMin) : delta / (2.0 - cMax - cMin);
    if (cMax == c.r) {
      h = (c.g - c.b) / delta + (c.g < c.b ? 6.0 : 0.0);
    } else if (cMax == c.g) {
      h = (c.b - c.r) / delta + 2.0;
    } else {
      h = (c.r - c.g) / delta + 4.0;
    }
    h /= 6.0;
  }
  return vec3(h, s, l);
}

float _hue2rgb(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  if (hsl.y < 0.001) return vec3(hsl.z);
  float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
  float p = 2.0 * hsl.z - q;
  return vec3(
    _hue2rgb(p, q, hsl.x + 1.0 / 3.0),
    _hue2rgb(p, q, hsl.x),
    _hue2rgb(p, q, hsl.x - 1.0 / 3.0)
  );
}

// ── Ana İşleme ──

void main() {
  vec4 texel = texture(u_image, v_texCoord);
  vec3 color = texel.rgb;

  // ─── 1. Brightness ───
  color *= u_brightness;

  // ─── 2. Linear (Contrast) ───
  color = color * u_linearMult + u_linearOffset / 255.0;
  color = clamp(color, 0.0, 1.0);

  // ─── 3. Gamma ───
  color = pow(color, vec3(1.0 / max(u_gamma, 0.01)));

  // ─── 4. White Balance ───
  {
    float tf = u_temperature / 100.0;
    float ti = u_tint / 100.0;
    color.r *= 1.0 + tf * 0.3;
    color.b *= 1.0 - tf * 0.3;
    color.g *= 1.0 - ti * 0.2;
    color.r *= 1.0 + ti * 0.1;
    color.b *= 1.0 + ti * 0.1;
    color = clamp(color, 0.0, 1.0);
  }

  // ─── 5. Vibrance ───
  {
    float avg = (color.r + color.g + color.b) / 3.0;
    float curSat = max(color.r, max(color.g, color.b)) - min(color.r, min(color.g, color.b));
    float vibF = u_vibrance / 100.0 * (1.0 - curSat);
    color = mix(vec3(avg), color, 1.0 + vibF);
    color = clamp(color, 0.0, 1.0);
  }

  // ─── 6. Saturation (multiplicative) ───
  {
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, u_saturation);
    color = clamp(color, 0.0, 1.0);
  }

  // ─── 7. Calibration ───
  {
    vec3 calHsl = rgb2hsl(color);
    float shadowInf = 1.0 - smoothstep(0.0, 0.3, calHsl.z);
    calHsl.x = fract(calHsl.x + shadowInf * u_calShadowsTint / 100.0 * 0.05);
    color = hsl2rgb(calHsl);

    float redInf = max(0.0, color.r - max(color.g, color.b));
    color.r += redInf * u_calRedHue / 100.0 * 0.2;
    color.r *= 1.0 + redInf * u_calRedSat / 100.0 * 0.3;

    float greenInf = max(0.0, color.g - max(color.r, color.b));
    color.g += greenInf * u_calGreenHue / 100.0 * 0.2;
    color.g *= 1.0 + greenInf * u_calGreenSat / 100.0 * 0.3;

    float blueInf = max(0.0, color.b - max(color.r, color.g));
    color.b += blueInf * u_calBlueHue / 100.0 * 0.2;
    color.b *= 1.0 + blueInf * u_calBlueSat / 100.0 * 0.3;

    color = clamp(color, 0.0, 1.0);
  }

  // ─── 8. Tone Curves (LUT) ───
  {
    // Per-channel curves
    float newR = texture(u_curveLUT, vec2(color.r, 0.5)).g;
    float newG = texture(u_curveLUT, vec2(color.g, 0.5)).b;
    float newB = texture(u_curveLUT, vec2(color.b, 0.5)).a;
    // Master curve
    color.r = texture(u_curveLUT, vec2(newR, 0.5)).r;
    color.g = texture(u_curveLUT, vec2(newG, 0.5)).r;
    color.b = texture(u_curveLUT, vec2(newB, 0.5)).r;
  }

  // ─── 9. HSL Adjustments ───
  {
    vec3 hsl = rgb2hsl(color);
    float centers[8] = float[8](
      0.0, 0.0833, 0.1667, 0.3333, 0.5, 0.6667, 0.75, 0.8333
    );

    float totalW = 0.0;
    float hS = 0.0, sS = 0.0, lS = 0.0;

    for (int i = 0; i < 8; i++) {
      float w = 1.0 - smoothstep(0.0, 0.08, hueDist(hsl.x, centers[i]));
      totalW += w;
      hS += w * u_hslHue[i];
      sS += w * u_hslSat[i];
      lS += w * u_hslLum[i];
    }

    if (totalW > 0.001) {
      hS /= totalW;
      sS /= totalW;
      lS /= totalW;
    }

    hsl.x = fract(hsl.x + hS / 360.0);
    hsl.y = clamp(hsl.y * (1.0 + sS / 100.0), 0.0, 1.0);
    hsl.z = clamp(hsl.z + lS / 200.0, 0.0, 1.0);

    color = hsl2rgb(hsl);
    color = clamp(color, 0.0, 1.0);
  }

  // ─── 10. Color Grading ───
  {
    float cgLum = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float bo = u_cgBalance / 200.0;

    float shadowW  = 1.0 - smoothstep(0.0, 0.33 + bo, cgLum);
    float highW    = smoothstep(0.67 + bo, 1.0, cgLum);
    float midW     = max(0.0, 1.0 - shadowW - highW);
    float blend    = u_cgBlending / 100.0;

    // Shadows
    if (u_cgShadowsSat > 0.001) {
      vec3 tint = hsl2rgb(vec3(u_cgShadowsHue / 360.0, 1.0, 0.5));
      float str = shadowW * blend * u_cgShadowsSat / 100.0;
      color = mix(color, color * tint * 2.0, str * 0.5);
      color += shadowW * u_cgShadowsLum / 400.0;
    }
    // Midtones
    if (u_cgMidtonesSat > 0.001) {
      vec3 tint = hsl2rgb(vec3(u_cgMidtonesHue / 360.0, 1.0, 0.5));
      float str = midW * blend * u_cgMidtonesSat / 100.0;
      color = mix(color, color * tint * 2.0, str * 0.5);
      color += midW * u_cgMidtonesLum / 400.0;
    }
    // Highlights
    if (u_cgHighlightsSat > 0.001) {
      vec3 tint = hsl2rgb(vec3(u_cgHighlightsHue / 360.0, 1.0, 0.5));
      float str = highW * blend * u_cgHighlightsSat / 100.0;
      color = mix(color, color * tint * 2.0, str * 0.5);
      color += highW * u_cgHighlightsLum / 400.0;
    }
    // Global
    if (u_cgGlobalSat > 0.001) {
      vec3 tint = hsl2rgb(vec3(u_cgGlobalHue / 360.0, 1.0, 0.5));
      float str = blend * u_cgGlobalSat / 100.0;
      color = mix(color, color * tint * 2.0, str * 0.5);
      color += u_cgGlobalLum / 400.0;
    }
    color = clamp(color, 0.0, 1.0);
  }

  // ─── 11. Point Color ───
  if (u_pcEnabled > 0.5) {
    vec3 pcHsl = rgb2hsl(color);

    float hW = 1.0 - smoothstep(0.0, max(u_pcHueRange / 360.0, 0.001), hueDist(pcHsl.x, u_pcTargetHue / 360.0));
    float sW = 1.0 - smoothstep(0.0, max(u_pcSatRange / 100.0, 0.001), abs(pcHsl.y - u_pcTargetSat / 100.0));
    float lW = 1.0 - smoothstep(0.0, max(u_pcLumRange / 100.0, 0.001), abs(pcHsl.z - u_pcTargetLum / 100.0));
    float pcW = hW * sW * lW;

    pcHsl.x = fract(pcHsl.x + pcW * u_pcHueShift / 360.0);
    pcHsl.y = clamp(pcHsl.y + pcW * u_pcSatShift / 100.0, 0.0, 1.0);
    pcHsl.z = clamp(pcHsl.z + pcW * u_pcLumShift / 200.0, 0.0, 1.0);

    color = hsl2rgb(pcHsl);
    color = clamp(color, 0.0, 1.0);
  }

  // ─── 12. B&W Mix ───
  if (u_bwEnabled > 0.5) {
    vec3 bwHsl = rgb2hsl(color);
    float centers[8] = float[8](
      0.0, 0.0833, 0.1667, 0.3333, 0.5, 0.6667, 0.75, 0.8333
    );

    float totalW = 0.0;
    float mixV = 0.0;
    for (int i = 0; i < 8; i++) {
      float w = 1.0 - smoothstep(0.0, 0.08, hueDist(bwHsl.x, centers[i]));
      w *= bwHsl.y;
      totalW += w;
      mixV += w * u_bwMix[i] / 100.0;
    }

    float baseLum = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float bwLum = baseLum;
    if (totalW > 0.001) {
      bwLum = baseLum + (mixV / totalW - 0.4) * 0.5;
    }
    color = vec3(clamp(bwLum, 0.0, 1.0));
  }

  // ─── 13. Local Adjustments ───
  if (u_localEnabled > 0.5) {
    vec3 lHsl = rgb2hsl(color);

    float hW = 1.0 - smoothstep(0.0, max(u_localMaskHueRange / 360.0, 0.001), hueDist(lHsl.x, u_localMaskHue / 360.0));
    float sW = 1.0 - smoothstep(0.0, max(u_localMaskSatRange / 100.0, 0.001), abs(lHsl.y - u_localMaskSat / 100.0));
    float lW = 1.0 - smoothstep(0.0, max(u_localMaskLumRange / 100.0, 0.001), abs(lHsl.z - u_localMaskLum / 100.0));
    float mW = hW * sW * lW;

    if (u_showMask > 0.5) {
      color = mix(color, vec3(1.0, 0.0, 0.0), mW * 0.7);
    } else {
      lHsl.x = fract(lHsl.x + mW * u_localHueRotation / 360.0);
      lHsl.y = clamp(lHsl.y * (1.0 + mW * u_localSaturation / 100.0), 0.0, 1.0);
      vec3 localC = hsl2rgb(lHsl);

      float lt = u_localTemperature / 100.0 * mW;
      float lti = u_localTint / 100.0 * mW;
      localC.r *= 1.0 + lt * 0.3;
      localC.b *= 1.0 - lt * 0.3;
      localC.g *= 1.0 - lti * 0.2;

      color = mix(color, clamp(localC, 0.0, 1.0), mW);
    }
  }

  fragColor = vec4(color, texel.a);
}
`;

// ─── Sharpen Fragment Shader (2. Pass) ────────────────

export const SHARPEN_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
out vec4 fragColor;

uniform sampler2D u_image;
uniform vec2 u_texelSize;
uniform float u_sharpenSigma;

void main() {
  vec4 center = texture(u_image, v_texCoord);

  if (u_sharpenSigma < 0.01) {
    fragColor = center;
    return;
  }

  // 5×5 Gaussian blur (unsharp mask)
  vec4 blur = vec4(0.0);
  float total = 0.0;

  for (int x = -2; x <= 2; x++) {
    for (int y = -2; y <= 2; y++) {
      float dist = float(x * x + y * y);
      float w = exp(-dist / (2.0 * u_sharpenSigma * u_sharpenSigma));
      blur += texture(u_image, v_texCoord + vec2(float(x), float(y)) * u_texelSize) * w;
      total += w;
    }
  }
  blur /= total;

  // Unsharp mask
  float amount = min(u_sharpenSigma * 1.5, 4.0);
  fragColor = clamp(center + (center - blur) * amount, 0.0, 1.0);
}
`;
