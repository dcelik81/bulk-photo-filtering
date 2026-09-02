import React from 'react';
import PanelSection from './PanelSection';
import SliderControl from './SliderControl';

export default function LocalAdjustPanel({ settings, onChange }) {
  return (
    <PanelSection title="Local Adjustments (Masking)">
      {/* Etkin/Devre Dışı Toggle */}
      <label className="flex items-center gap-2 text-xs text-zinc-300 mb-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={settings.localEnabled}
          onChange={(e) => onChange('localEnabled', e.target.checked)}
          className="accent-indigo-500"
        />
        Enable Local Adjustments
      </label>

      <div className={settings.localEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
        {/* Maske Rengi */}
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Color Range Mask</p>
        <div className="space-y-3 mb-4">
          <SliderControl
            label="Mask Hue" min={0} max={360} step={1}
            value={settings.localMaskHue}
            onChange={(v) => onChange('localMaskHue', v)}
            defaultValue={0}
            gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
            decimals={0}
          />
          <SliderControl
            label="Mask Saturation" min={0} max={100} step={1}
            value={settings.localMaskSat}
            onChange={(v) => onChange('localMaskSat', v)}
            defaultValue={100} decimals={0}
          />
          <SliderControl
            label="Mask Luminance" min={0} max={100} step={1}
            value={settings.localMaskLum}
            onChange={(v) => onChange('localMaskLum', v)}
            defaultValue={50} decimals={0}
          />
        </div>

        {/* Maske Aralığı */}
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Mask Range</p>
        <div className="space-y-3 mb-4">
          <SliderControl
            label="Hue Range" min={1} max={180} step={1}
            value={settings.localMaskHueRange}
            onChange={(v) => onChange('localMaskHueRange', v)}
            defaultValue={30} decimals={0}
          />
          <SliderControl
            label="Saturation Range" min={1} max={100} step={1}
            value={settings.localMaskSatRange}
            onChange={(v) => onChange('localMaskSatRange', v)}
            defaultValue={50} decimals={0}
          />
          <SliderControl
            label="Luminance Range" min={1} max={100} step={1}
            value={settings.localMaskLumRange}
            onChange={(v) => onChange('localMaskLumRange', v)}
            defaultValue={50} decimals={0}
          />
        </div>

        {/* Maske Görünürlüğü */}
        <label className="flex items-center gap-2 text-xs text-zinc-300 mb-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.localShowMask}
            onChange={(e) => onChange('localShowMask', e.target.checked)}
            className="accent-red-500"
          />
          Show Mask Overlay
        </label>

        {/* Lokal Ayarlar */}
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Adjustments</p>
        <div className="space-y-3">
          <SliderControl
            label="Hue Rotation" min={0} max={360} step={1}
            value={settings.localHueRotation}
            onChange={(v) => onChange('localHueRotation', v)}
            defaultValue={0}
            gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
            decimals={0}
          />
          <SliderControl
            label="Saturation" min={-100} max={100} step={1}
            value={settings.localSaturation}
            onChange={(v) => onChange('localSaturation', v)}
            defaultValue={0} decimals={0}
          />
          <SliderControl
            label="Temperature" min={-100} max={100} step={1}
            value={settings.localTemperature}
            onChange={(v) => onChange('localTemperature', v)}
            defaultValue={0}
            gradient="linear-gradient(to right, #6bb7f0, #f5f5f5 50%, #f0b86b)"
            decimals={0}
          />
          <SliderControl
            label="Tint" min={-100} max={100} step={1}
            value={settings.localTint}
            onChange={(v) => onChange('localTint', v)}
            defaultValue={0}
            gradient="linear-gradient(to right, #6bf07a, #f5f5f5 50%, #d96bf0)"
            decimals={0}
          />
        </div>
      </div>
    </PanelSection>
  );
}
