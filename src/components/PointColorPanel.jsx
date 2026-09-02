import React from 'react';
import PanelSection from './PanelSection';
import SliderControl from './SliderControl';

export default function PointColorPanel({ settings, onChange }) {
  return (
    <PanelSection title="Point Color">
      {/* Etkin/Devre Dışı Toggle */}
      <label className="flex items-center gap-2 text-xs text-zinc-300 mb-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={settings.pcEnabled}
          onChange={(e) => onChange('pcEnabled', e.target.checked)}
          className="accent-indigo-500"
        />
        Enable Point Color
      </label>

      <div className={settings.pcEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
        {/* Hedef Renk */}
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Target Color</p>
        <div className="space-y-3 mb-4">
          <SliderControl
            label="Target Hue" min={0} max={360} step={1}
            value={settings.pcTargetHue}
            onChange={(v) => onChange('pcTargetHue', v)}
            defaultValue={0}
            gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
            decimals={0}
          />
          <SliderControl
            label="Target Saturation" min={0} max={100} step={1}
            value={settings.pcTargetSat}
            onChange={(v) => onChange('pcTargetSat', v)}
            defaultValue={50} decimals={0}
          />
          <SliderControl
            label="Target Luminance" min={0} max={100} step={1}
            value={settings.pcTargetLum}
            onChange={(v) => onChange('pcTargetLum', v)}
            defaultValue={50} decimals={0}
          />
        </div>

        {/* Kaydırma */}
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Shift</p>
        <div className="space-y-3 mb-4">
          <SliderControl
            label="Hue Shift" min={-180} max={180} step={1}
            value={settings.pcHueShift}
            onChange={(v) => onChange('pcHueShift', v)}
            defaultValue={0} decimals={0}
          />
          <SliderControl
            label="Saturation Shift" min={-100} max={100} step={1}
            value={settings.pcSatShift}
            onChange={(v) => onChange('pcSatShift', v)}
            defaultValue={0} decimals={0}
          />
          <SliderControl
            label="Luminance Shift" min={-100} max={100} step={1}
            value={settings.pcLumShift}
            onChange={(v) => onChange('pcLumShift', v)}
            defaultValue={0} decimals={0}
          />
        </div>

        {/* Aralık Kontrolleri */}
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Range</p>
        <div className="space-y-3">
          <SliderControl
            label="Hue Range" min={1} max={180} step={1}
            value={settings.pcHueRange}
            onChange={(v) => onChange('pcHueRange', v)}
            defaultValue={30} decimals={0}
          />
          <SliderControl
            label="Saturation Range" min={1} max={100} step={1}
            value={settings.pcSatRange}
            onChange={(v) => onChange('pcSatRange', v)}
            defaultValue={50} decimals={0}
          />
          <SliderControl
            label="Luminance Range" min={1} max={100} step={1}
            value={settings.pcLumRange}
            onChange={(v) => onChange('pcLumRange', v)}
            defaultValue={50} decimals={0}
          />
        </div>
      </div>
    </PanelSection>
  );
}
