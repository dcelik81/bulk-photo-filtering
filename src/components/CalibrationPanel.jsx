import React from 'react';
import PanelSection from './PanelSection';
import SliderControl from './SliderControl';

export default function CalibrationPanel({ settings, onChange }) {
  return (
    <PanelSection title="Calibration">
      {/* Shadows Tint */}
      <SliderControl
        label="Shadows Tint"
        min={-100} max={100} step={1}
        value={settings.calShadowsTint}
        onChange={(v) => onChange('calShadowsTint', v)}
        defaultValue={0}
        gradient="linear-gradient(to right, #6bf07a, #888 50%, #d96bf0)"
        decimals={0}
      />

      {/* Red Primary */}
      <div className="mt-4">
        <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 font-semibold">Red Primary</p>
        <div className="space-y-3">
          <SliderControl
            label="Hue" min={-100} max={100} step={1}
            value={settings.calRedHue}
            onChange={(v) => onChange('calRedHue', v)}
            defaultValue={0} color="#ef4444" decimals={0}
          />
          <SliderControl
            label="Saturation" min={-100} max={100} step={1}
            value={settings.calRedSat}
            onChange={(v) => onChange('calRedSat', v)}
            defaultValue={0} color="#ef4444" decimals={0}
          />
        </div>
      </div>

      {/* Green Primary */}
      <div className="mt-4">
        <p className="text-[10px] text-green-400 uppercase tracking-wider mb-2 font-semibold">Green Primary</p>
        <div className="space-y-3">
          <SliderControl
            label="Hue" min={-100} max={100} step={1}
            value={settings.calGreenHue}
            onChange={(v) => onChange('calGreenHue', v)}
            defaultValue={0} color="#22c55e" decimals={0}
          />
          <SliderControl
            label="Saturation" min={-100} max={100} step={1}
            value={settings.calGreenSat}
            onChange={(v) => onChange('calGreenSat', v)}
            defaultValue={0} color="#22c55e" decimals={0}
          />
        </div>
      </div>

      {/* Blue Primary */}
      <div className="mt-4">
        <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-2 font-semibold">Blue Primary</p>
        <div className="space-y-3">
          <SliderControl
            label="Hue" min={-100} max={100} step={1}
            value={settings.calBlueHue}
            onChange={(v) => onChange('calBlueHue', v)}
            defaultValue={0} color="#3b82f6" decimals={0}
          />
          <SliderControl
            label="Saturation" min={-100} max={100} step={1}
            value={settings.calBlueSat}
            onChange={(v) => onChange('calBlueSat', v)}
            defaultValue={0} color="#3b82f6" decimals={0}
          />
        </div>
      </div>
    </PanelSection>
  );
}
