import React from 'react';
import PanelSection from './PanelSection';
import SliderControl from './SliderControl';
import { HSL_CHANNEL_NAMES, HSL_CHANNEL_COLORS } from '../functions/defaultSettings';

const BW_DEFAULTS = { Red: 30, Orange: 50, Yellow: 60, Green: 40, Aqua: 50, Blue: 20, Purple: 30, Magenta: 25 };

export default function BWMixerPanel({ settings, onChange }) {
  const handleAutoMix = () => {
    HSL_CHANNEL_NAMES.forEach((name) => {
      onChange(`bw${name}`, BW_DEFAULTS[name]);
    });
  };

  return (
    <PanelSection title="B&W Mix">
      {/* B&W Toggle */}
      <label className="flex items-center gap-2 text-xs text-zinc-300 mb-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={settings.bwEnabled}
          onChange={(e) => onChange('bwEnabled', e.target.checked)}
          className="accent-indigo-500"
        />
        Enable Black & White
      </label>

      <div className={settings.bwEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
        <div className="space-y-3">
          {HSL_CHANNEL_NAMES.map((name, i) => (
            <SliderControl
              key={name}
              label={name}
              min={-200} max={300} step={1}
              value={settings[`bw${name}`]}
              onChange={(v) => onChange(`bw${name}`, v)}
              defaultValue={BW_DEFAULTS[name]}
              color={HSL_CHANNEL_COLORS[i]}
              decimals={0}
            />
          ))}
        </div>

        <button
          onClick={handleAutoMix}
          className="w-full mt-3 text-xs text-zinc-500 hover:text-zinc-300 py-1.5 rounded hover:bg-zinc-800/50 transition-colors"
        >
          Auto Mix
        </button>
      </div>
    </PanelSection>
  );
}
