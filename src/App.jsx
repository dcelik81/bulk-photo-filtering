import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FolderOpen, Save, Image as ImageIcon, Download, RotateCcw } from 'lucide-react';
import { DEFAULT_SETTINGS } from './functions/defaultSettings';
import { useImageProcessor } from './hooks/useImageProcessor';

// Panel bileşenleri
import PanelSection from './components/PanelSection';
import SliderControl from './components/SliderControl';
import WhiteBalancePanel from './components/WhiteBalancePanel';
import ToneCurvePanel from './components/ToneCurvePanel';
import HSLPanel from './components/HSLPanel';
import ColorGradingPanel from './components/ColorGradingPanel';
import PointColorPanel from './components/PointColorPanel';
import BWMixerPanel from './components/BWMixerPanel';
import CalibrationPanel from './components/CalibrationPanel';
import LocalAdjustPanel from './components/LocalAdjustPanel';

export default function App() {
  const [dirPath, setDirPath] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rawImageUrl, setRawImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });

  // WebGL Canvas
  const canvasRef = useRef(null);
  useImageProcessor(canvasRef, rawImageUrl, settings);

  // ─── Klasör Seçimi ──────────────────────────

  const handleSelectDir = async () => {
    const p = await window.electronAPI.selectDirectory();
    if (p) {
      setDirPath(p);
      const imgs = await window.electronAPI.getImages(p);
      setImages(imgs);
      setSelectedIndex(0);
    }
  };

  const currentImage = images[selectedIndex];

  // ─── Ham Görüntü Yükleme ───────────────────

  useEffect(() => {
    if (!currentImage) {
      setRawImageUrl(null);
      return;
    }

    setLoadingImage(true);
    window.electronAPI
      .getRawPreview(currentImage.path)
      .then((url) => {
        setRawImageUrl(url);
      })
      .catch((err) => {
        console.error('Raw preview error:', err);
      })
      .finally(() => {
        setLoadingImage(false);
      });
  }, [currentImage]);

  // ─── Export Progress Listener ───────────────

  useEffect(() => {
    window.electronAPI.onExportProgress((progress) => {
      setExportProgress(progress);
    });
    return () => {
      window.electronAPI.removeExportProgress();
    };
  }, []);

  // ─── Ayar Değişikliği ──────────────────────

  const handleSettingChange = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ─── Tümünü Sıfırla ────────────────────────

  const handleResetAll = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  // ─── Export ─────────────────────────────────

  const handleExportAll = async () => {
    if (!dirPath) return;
    setIsExporting(true);
    try {
      const outputDir = dirPath + '_exported';
      const result = await window.electronAPI.exportAll(dirPath, outputDir, settings);
      if (result.success) {
        alert(`${result.count} images exported successfully to ${outputDir}!`);
      } else {
        alert('Export failed: ' + result.error);
      }
    } catch (e) {
      console.error(e);
      alert('Error: ' + e.message);
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  // ─── Render ─────────────────────────────────

  return (
    <div className="flex h-screen bg-background text-zinc-100 flex-col font-sans">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-surface drag-area shrink-0">
        <div className="flex items-center gap-2 no-drag">
          <ImageIcon className="w-5 h-5 text-indigo-400" />
          <h1 className="font-semibold tracking-wide text-sm">Bulk Photo Filtering</h1>
        </div>
        <div className="flex items-center gap-3 no-drag">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors"
            title="Reset All Settings"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSelectDir}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-sm transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Open Folder
          </button>
          <button
            onClick={handleExportAll}
            disabled={images.length === 0 || isExporting}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
          >
            {isExporting ? (
              <Download className="w-4 h-4 animate-bounce" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Export All
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview Area */}
        <main className="flex-1 flex flex-col relative bg-[#111] overflow-hidden min-h-0">
          <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full drop-shadow-2xl transition-opacity duration-300 preview-canvas"
              style={{
                opacity: loadingImage ? 0.5 : 1,
                display: rawImageUrl ? 'block' : 'none'
              }}
            />
            {!rawImageUrl && (
              <div className="text-zinc-500 text-sm flex flex-col items-center gap-3">
                <ImageIcon className="w-12 h-12 opacity-50" />
                <p>No image selected. Open a folder to begin.</p>
              </div>
            )}
          </div>

          {/* Filmstrip */}
          {images.length > 0 && (
            <div className="h-24 bg-surface border-t border-border flex items-center px-2 overflow-x-auto gap-2 shrink-0">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-16 h-16 shrink-0 bg-zinc-800 rounded overflow-hidden cursor-pointer border-2 transition-all ${
                    idx === selectedIndex
                      ? 'border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                      : 'border-transparent hover:border-zinc-500'
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 break-all p-1 text-center bg-zinc-900">
                    {img.name.slice(0, 10)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar - Controls */}
        <aside className="w-80 bg-surface border-l border-border flex flex-col overflow-y-auto shrink-0 sidebar-scroll">
          {/* 1. Basic Adjustments */}
          <PanelSection title="Basic" defaultOpen={true}>
            <SliderControl
              label="Brightness" min={0.1} max={3} step={0.05}
              value={settings.brightness}
              onChange={(v) => handleSettingChange('brightness', v)}
              defaultValue={0.9}
            />
            <SliderControl
              label="Saturation" min={0.0} max={3} step={0.05}
              value={settings.saturation}
              onChange={(v) => handleSettingChange('saturation', v)}
              defaultValue={1.35}
            />
            <SliderControl
              label="Gamma" min={0.1} max={3} step={0.1}
              value={settings.gamma}
              onChange={(v) => handleSettingChange('gamma', v)}
              defaultValue={1.0}
            />
            <SliderControl
              label="Linear (Contrast)" min={0.1} max={3} step={0.1}
              value={settings.linearMult}
              onChange={(v) => handleSettingChange('linearMult', v)}
              defaultValue={1.1}
            />
            <SliderControl
              label="Linear Offset" min={-50} max={50} step={1}
              value={settings.linearOffset}
              onChange={(v) => handleSettingChange('linearOffset', v)}
              defaultValue={-12.8} decimals={1}
            />
            <SliderControl
              label="Sharpen (Sigma)" min={0} max={5} step={0.1}
              value={settings.sharpenSigma}
              onChange={(v) => handleSettingChange('sharpenSigma', v)}
              defaultValue={1.0}
            />
          </PanelSection>

          {/* 2. White Balance */}
          <WhiteBalancePanel settings={settings} onChange={handleSettingChange} />

          {/* 3. Global Color */}
          <PanelSection title="Global Color">
            <SliderControl
              label="Vibrance" min={-100} max={100} step={1}
              value={settings.vibrance}
              onChange={(v) => handleSettingChange('vibrance', v)}
              defaultValue={0} decimals={0}
            />
          </PanelSection>

          {/* 4. Tone Curve */}
          <ToneCurvePanel settings={settings} onChange={handleSettingChange} />

          {/* 5. HSL / Color */}
          <HSLPanel settings={settings} onChange={handleSettingChange} />

          {/* 6. Color Grading */}
          <ColorGradingPanel settings={settings} onChange={handleSettingChange} />

          {/* 7. Point Color */}
          <PointColorPanel settings={settings} onChange={handleSettingChange} />

          {/* 8. B&W Mix */}
          <BWMixerPanel settings={settings} onChange={handleSettingChange} />

          {/* 9. Calibration */}
          <CalibrationPanel settings={settings} onChange={handleSettingChange} />

          {/* 10. Local Adjustments */}
          <LocalAdjustPanel settings={settings} onChange={handleSettingChange} />
        </aside>
      </div>

      {/* Export Overlay */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border p-6 rounded-xl shadow-2xl w-96 flex flex-col items-center">
            <Download className="w-10 h-10 text-indigo-400 animate-bounce mb-4" />
            <h3 className="text-lg font-semibold mb-2">Exporting Images</h3>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-2 transition-all duration-300"
                style={{
                  width: `${
                    exportProgress.total
                      ? (exportProgress.current / exportProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-sm text-zinc-400">
              {exportProgress.current} / {exportProgress.total} processed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
