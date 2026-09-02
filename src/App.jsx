import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FolderOpen, Save, Image as ImageIcon, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function App() {
  const [dirPath, setDirPath] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

  const [settings, setSettings] = useState({
    brightness: 0.9,
    saturation: 1.35,
    gamma: 1.0,
    linear_mult: 1.1,
    linear_offset: -12.8,
    sharpen_sigma: 1.0,
  });

  const getSharpConfig = (s) => ({
    modulate: { brightness: parseFloat(s.brightness), saturation: parseFloat(s.saturation) },
    linear: [parseFloat(s.linear_mult), parseFloat(s.linear_offset)],
    gamma: parseFloat(s.gamma),
    sharpen: parseFloat(s.sharpen_sigma) > 0 ? { sigma: parseFloat(s.sharpen_sigma), m1: 1.0, m2: 2.0 } : false
  });

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

  // Debounce ref
  const timeoutRef = useRef(null);

  const fetchPreview = useCallback(async (image, currentSettings) => {
    if (!image) return;
    setLoadingPreview(true);
    try {
      const config = getSharpConfig(currentSettings);
      const url = await window.electronAPI.getPreview(image.path, config);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  const previousImageRef = useRef(null);

  useEffect(() => {
    if (currentImage) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const isImageChange = previousImageRef.current !== currentImage.path;
      previousImageRef.current = currentImage.path;

      if (isImageChange) {
        fetchPreview(currentImage, settings);
      } else {
        timeoutRef.current = setTimeout(() => {
          fetchPreview(currentImage, settings);
        }, 100);
      }
    }
  }, [currentImage, settings, fetchPreview]);

  useEffect(() => {
    window.electronAPI.onExportProgress((progress) => {
      setExportProgress(progress);
    });
    return () => {
      window.electronAPI.removeExportProgress();
    };
  }, []);

  const handleSettingChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleExportAll = async () => {
    if (!dirPath) return;
    setIsExporting(true);
    try {
      const outputDir = dirPath + '_exported';
      const config = getSharpConfig(settings);
      const result = await window.electronAPI.exportAll(dirPath, outputDir, config);
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

  return (
    <div className="flex h-screen bg-background text-zinc-100 flex-col font-sans">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-surface drag-area shrink-0">
        <div className="flex items-center gap-2 no-drag">
          <ImageIcon className="w-5 h-5 text-indigo-400" />
          <h1 className="font-semibold tracking-wide text-sm">Fotoedit</h1>
        </div>
        <div className="flex items-center gap-3 no-drag">
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
            {isExporting ? <Download className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
            Export All
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview Area */}
        <main className="flex-1 flex flex-col relative bg-[#111] overflow-hidden min-h-0">
          <div className="flex-1 relative flex items-center justify-center p-4 min-h-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain drop-shadow-2xl transition-opacity duration-300"
                style={{ opacity: loadingPreview ? 0.7 : 1 }}
              />
            ) : (
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
                  className={`w-16 h-16 shrink-0 bg-zinc-800 rounded overflow-hidden cursor-pointer border-2 transition-all ${idx === selectedIndex ? 'border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-transparent hover:border-zinc-500'
                    }`}
                >
                  {/* In a real app we'd load small thumbnails, but for simplicity we'll just show an icon or name. 
                       We could also just use an electron protocol or base64. Let's just show file name snippet for now. */}
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400 break-all p-1 text-center bg-zinc-900">
                    {img.name.slice(0, 10)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar - Controls */}
        <aside className="w-80 bg-surface border-l border-border flex flex-col overflow-y-auto shrink-0">
          <div className="p-5 border-b border-border">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Color Adjustments</h2>

            <div className="space-y-6">
              <SliderControl label="Brightness" min="0.1" max="3" step="0.05" value={settings.brightness} onChange={(v) => handleSettingChange('brightness', v)} />
              <SliderControl label="Saturation" min="0.0" max="3" step="0.05" value={settings.saturation} onChange={(v) => handleSettingChange('saturation', v)} />
              <SliderControl label="Gamma" min="0.1" max="3" step="0.1" value={settings.gamma} onChange={(v) => handleSettingChange('gamma', v)} />
              <SliderControl label="Linear (Contrast)" min="0.1" max="3" step="0.1" value={settings.linear_mult} onChange={(v) => handleSettingChange('linear_mult', v)} />
              <SliderControl label="Linear Offset" min="-50" max="50" step="1" value={settings.linear_offset} onChange={(v) => handleSettingChange('linear_offset', v)} />
            </div>
          </div>

          <div className="p-5">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Detail</h2>

            <div className="space-y-6">
              <SliderControl label="Sharpen (Sigma)" min="0" max="5" step="0.1" value={settings.sharpen_sigma} onChange={(v) => handleSettingChange('sharpen_sigma', v)} />
            </div>
          </div>
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
                style={{ width: `${exportProgress.total ? (exportProgress.current / exportProgress.total) * 100 : 0}%` }}
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

function SliderControl({ label, min, max, step, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-300">{label}</span>
        <span className="text-indigo-400 font-mono">{Number(value).toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
