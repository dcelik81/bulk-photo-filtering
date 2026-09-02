import React, { useState } from 'react';
import PanelSection from './PanelSection';
import SliderControl from './SliderControl';
import { HSL_CHANNEL_NAMES, HSL_CHANNEL_COLORS } from '../functions/defaultSettings';

const TABS = [
  { key: 'Hue', prefix: 'hslHue', min: -180, max: 180, step: 1 },
  { key: 'Saturation', prefix: 'hslSat', min: -100, max: 100, step: 1 },
  { key: 'Luminance', prefix: 'hslLum', min: -100, max: 100, step: 1 },
];

export default function HSLPanel({ settings, onChange }) {
  const [activeTab, setActiveTab] = useState(0);
  const tab = TABS[activeTab];

  return (
    <PanelSection title="HSL / Color">
      {/* Tab Seçici */}
      <div className="flex gap-1 mb-3">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(i)}
            className={`flex-1 text-xs py-1.5 rounded transition-colors font-medium ${
              i === activeTab
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            {t.key}
          </button>
        ))}
      </div>

      {/* 8 Renk Kanalı */}
      <div className="space-y-3">
        {HSL_CHANNEL_NAMES.map((name, i) => {
          const settingKey = `${tab.prefix}${name}`;
          return (
            <SliderControl
              key={settingKey}
              label={name}
              min={tab.min}
              max={tab.max}
              step={tab.step}
              value={settings[settingKey]}
              onChange={(v) => onChange(settingKey, v)}
              defaultValue={0}
              color={HSL_CHANNEL_COLORS[i]}
              decimals={0}
            />
          );
        })}
      </div>
    </PanelSection>
  );
}
