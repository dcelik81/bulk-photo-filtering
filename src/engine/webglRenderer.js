/**
 * WebGL2 tabanlı görüntü işleme renderer.
 * İki geçişli pipeline: (1) renk işleme → FBO, (2) sharpen → canvas.
 */

import { VERTEX_SHADER, COLOR_FRAGMENT_SHADER, SHARPEN_FRAGMENT_SHADER } from './shaders';
import { generateCurveLUTData } from '../functions/colorMath';

export class WebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });

    if (!this.gl) throw new Error('WebGL2 desteklenmiyor');

    this.imageLoaded = false;
    this.imageTexture = null;
    this.curveLUTTexture = null;
    this.fbo = null;
    this.fboTexture = null;
    this.fboWidth = 0;
    this.fboHeight = 0;

    this._initShaders();
    this._initBuffers();
    this._initCurveLUT();
  }

  // ─── Shader Derleme ──────────────────────────

  _compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader derleme hatası: ${log}`);
    }
    return shader;
  }

  _createProgram(vsSrc, fsSrc) {
    const gl = this.gl;
    const vs = this._compileShader(gl.VERTEX_SHADER, vsSrc);
    const fs = this._compileShader(gl.FRAGMENT_SHADER, fsSrc);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program bağlama hatası: ${log}`);
    }

    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return program;
  }

  _initShaders() {
    this.colorProgram = this._createProgram(VERTEX_SHADER, COLOR_FRAGMENT_SHADER);
    this.sharpenProgram = this._createProgram(VERTEX_SHADER, SHARPEN_FRAGMENT_SHADER);

    // Cache uniform locations
    this._colorUniforms = {};
    this._sharpenUniforms = {};
  }

  _getUniform(program, name, cache) {
    if (!(name in cache)) {
      cache[name] = this.gl.getUniformLocation(program, name);
    }
    return cache[name];
  }

  // ─── Quad Buffer ─────────────────────────────

  _initBuffers() {
    const gl = this.gl;

    // Full-screen quad (position + texCoord interleaved)
    const data = new Float32Array([
      // pos       texCoord
      -1, -1,      0, 0,     // sol-alt
       1, -1,      1, 0,     // sağ-alt
      -1,  1,      0, 1,     // sol-üst
       1,  1,      1, 1,     // sağ-üst
    ]);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // a_position
    const posLoc = 0;
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);

    // a_texCoord
    const tcLoc = 1;
    gl.enableVertexAttribArray(tcLoc);
    gl.vertexAttribPointer(tcLoc, 2, gl.FLOAT, false, 16, 8);

    // Attributes are now bound using layout(location = X) in shaders

    gl.bindVertexArray(null);
  }

  // ─── Curve LUT Texture ──────────────────────

  _initCurveLUT() {
    const gl = this.gl;
    this.curveLUTTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.curveLUTTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Identity LUT
    const data = new Uint8Array(256 * 4);
    for (let i = 0; i < 256; i++) {
      data[i * 4 + 0] = i; // R = master (identity)
      data[i * 4 + 1] = i; // G = red (identity)
      data[i * 4 + 2] = i; // B = green (identity)
      data[i * 4 + 3] = i; // A = blue (identity)
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }

  updateCurveLUT(settings) {
    const gl = this.gl;
    const data = generateCurveLUTData(settings);
    gl.bindTexture(gl.TEXTURE_2D, this.curveLUTTexture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }

  // ─── Framebuffer (Pass 1 hedefi) ────────────

  _ensureFBO(width, height) {
    const gl = this.gl;

    if (this.fboWidth === width && this.fboHeight === height && this.fbo) return;

    // Eski kaynakları temizle
    if (this.fbo) {
      gl.deleteFramebuffer(this.fbo);
      gl.deleteTexture(this.fboTexture);
    }

    this.fboTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.fboTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.fboTexture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.fboWidth = width;
    this.fboHeight = height;
  }

  // ─── Görüntü Yükleme ───────────────────────

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const gl = this.gl;

        this.canvas.width = img.width;
        this.canvas.height = img.height;

        if (this.imageTexture) gl.deleteTexture(this.imageTexture);

        this.imageTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this._ensureFBO(img.width, img.height);
        this.imageLoaded = true;
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // ─── Uniform Güncelleme ─────────────────────

  updateSettings(settings) {
    this._pendingSettings = settings;
  }

  _applyColorUniforms(settings) {
    const gl = this.gl;
    const u = (name) => this._getUniform(this.colorProgram, name, this._colorUniforms);

    // Basic
    gl.uniform1f(u('u_brightness'), settings.brightness);
    gl.uniform1f(u('u_gamma'), settings.gamma);
    gl.uniform1f(u('u_linearMult'), settings.linearMult);
    gl.uniform1f(u('u_linearOffset'), settings.linearOffset);
    gl.uniform1f(u('u_saturation'), settings.saturation);

    // White Balance
    gl.uniform1f(u('u_temperature'), settings.temperature);
    gl.uniform1f(u('u_tint'), settings.tint);

    // Vibrance
    gl.uniform1f(u('u_vibrance'), settings.vibrance);

    // HSL
    const hslHue = [
      settings.hslHueRed, settings.hslHueOrange, settings.hslHueYellow, settings.hslHueGreen,
      settings.hslHueAqua, settings.hslHueBlue, settings.hslHuePurple, settings.hslHueMagenta,
    ];
    const hslSat = [
      settings.hslSatRed, settings.hslSatOrange, settings.hslSatYellow, settings.hslSatGreen,
      settings.hslSatAqua, settings.hslSatBlue, settings.hslSatPurple, settings.hslSatMagenta,
    ];
    const hslLum = [
      settings.hslLumRed, settings.hslLumOrange, settings.hslLumYellow, settings.hslLumGreen,
      settings.hslLumAqua, settings.hslLumBlue, settings.hslLumPurple, settings.hslLumMagenta,
    ];
    gl.uniform1fv(u('u_hslHue[0]'), hslHue);
    gl.uniform1fv(u('u_hslSat[0]'), hslSat);
    gl.uniform1fv(u('u_hslLum[0]'), hslLum);

    // Color Grading
    gl.uniform1f(u('u_cgShadowsHue'), settings.cgShadowsHue);
    gl.uniform1f(u('u_cgShadowsSat'), settings.cgShadowsSat);
    gl.uniform1f(u('u_cgShadowsLum'), settings.cgShadowsLum);
    gl.uniform1f(u('u_cgMidtonesHue'), settings.cgMidtonesHue);
    gl.uniform1f(u('u_cgMidtonesSat'), settings.cgMidtonesSat);
    gl.uniform1f(u('u_cgMidtonesLum'), settings.cgMidtonesLum);
    gl.uniform1f(u('u_cgHighlightsHue'), settings.cgHighlightsHue);
    gl.uniform1f(u('u_cgHighlightsSat'), settings.cgHighlightsSat);
    gl.uniform1f(u('u_cgHighlightsLum'), settings.cgHighlightsLum);
    gl.uniform1f(u('u_cgGlobalHue'), settings.cgGlobalHue);
    gl.uniform1f(u('u_cgGlobalSat'), settings.cgGlobalSat);
    gl.uniform1f(u('u_cgGlobalLum'), settings.cgGlobalLum);
    gl.uniform1f(u('u_cgBlending'), settings.cgBlending);
    gl.uniform1f(u('u_cgBalance'), settings.cgBalance);

    // Point Color
    gl.uniform1f(u('u_pcEnabled'), settings.pcEnabled ? 1.0 : 0.0);
    gl.uniform1f(u('u_pcTargetHue'), settings.pcTargetHue);
    gl.uniform1f(u('u_pcTargetSat'), settings.pcTargetSat);
    gl.uniform1f(u('u_pcTargetLum'), settings.pcTargetLum);
    gl.uniform1f(u('u_pcHueShift'), settings.pcHueShift);
    gl.uniform1f(u('u_pcSatShift'), settings.pcSatShift);
    gl.uniform1f(u('u_pcLumShift'), settings.pcLumShift);
    gl.uniform1f(u('u_pcHueRange'), settings.pcHueRange);
    gl.uniform1f(u('u_pcSatRange'), settings.pcSatRange);
    gl.uniform1f(u('u_pcLumRange'), settings.pcLumRange);

    // B&W
    gl.uniform1f(u('u_bwEnabled'), settings.bwEnabled ? 1.0 : 0.0);
    const bwMix = [
      settings.bwRed, settings.bwOrange, settings.bwYellow, settings.bwGreen,
      settings.bwAqua, settings.bwBlue, settings.bwPurple, settings.bwMagenta,
    ];
    gl.uniform1fv(u('u_bwMix[0]'), bwMix);

    // Calibration
    gl.uniform1f(u('u_calShadowsTint'), settings.calShadowsTint);
    gl.uniform1f(u('u_calRedHue'), settings.calRedHue);
    gl.uniform1f(u('u_calRedSat'), settings.calRedSat);
    gl.uniform1f(u('u_calGreenHue'), settings.calGreenHue);
    gl.uniform1f(u('u_calGreenSat'), settings.calGreenSat);
    gl.uniform1f(u('u_calBlueHue'), settings.calBlueHue);
    gl.uniform1f(u('u_calBlueSat'), settings.calBlueSat);

    // Local Adjustments
    gl.uniform1f(u('u_localEnabled'), settings.localEnabled ? 1.0 : 0.0);
    gl.uniform1f(u('u_localMaskHue'), settings.localMaskHue);
    gl.uniform1f(u('u_localMaskSat'), settings.localMaskSat);
    gl.uniform1f(u('u_localMaskLum'), settings.localMaskLum);
    gl.uniform1f(u('u_localMaskHueRange'), settings.localMaskHueRange);
    gl.uniform1f(u('u_localMaskSatRange'), settings.localMaskSatRange);
    gl.uniform1f(u('u_localMaskLumRange'), settings.localMaskLumRange);
    gl.uniform1f(u('u_localHueRotation'), settings.localHueRotation);
    gl.uniform1f(u('u_localSaturation'), settings.localSaturation);
    gl.uniform1f(u('u_localTemperature'), settings.localTemperature);
    gl.uniform1f(u('u_localTint'), settings.localTint);
    gl.uniform1f(u('u_showMask'), settings.localShowMask ? 1.0 : 0.0);

    // Texture units
    gl.uniform1i(u('u_image'), 0);
    gl.uniform1i(u('u_curveLUT'), 1);
  }

  // ─── Render ─────────────────────────────────

  render() {
    if (!this.imageLoaded || !this._pendingSettings) return;

    const gl = this.gl;
    const settings = this._pendingSettings;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Curve LUT güncelle
    this.updateCurveLUT(settings);

    // ── Pass 1: Renk İşleme → FBO ──
    this._ensureFBO(w, h);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, w, h);

    gl.useProgram(this.colorProgram);
    this._applyColorUniforms(settings);

    // Texture bağla
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.curveLUTTexture);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // ── Pass 2: Sharpen → Canvas ──
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);

    gl.useProgram(this.sharpenProgram);
    const su = (name) => this._getUniform(this.sharpenProgram, name, this._sharpenUniforms);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fboTexture);
    gl.uniform1i(su('u_image'), 0);
    gl.uniform2f(su('u_texelSize'), 1.0 / w, 1.0 / h);
    gl.uniform1f(su('u_sharpenSigma'), settings.sharpenSigma);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  // ─── Temizlik ───────────────────────────────

  dispose() {
    const gl = this.gl;
    if (!gl) return;

    if (this.imageTexture) gl.deleteTexture(this.imageTexture);
    if (this.curveLUTTexture) gl.deleteTexture(this.curveLUTTexture);
    if (this.fboTexture) gl.deleteTexture(this.fboTexture);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);

    gl.deleteProgram(this.colorProgram);
    gl.deleteProgram(this.sharpenProgram);

    this.imageLoaded = false;
  }
}
