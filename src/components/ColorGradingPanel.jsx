import React, { useState } from 'react';
import PanelSection from './PanelSection';
import SliderControl from './SliderControl';

const SECTIONS = [
  { key: 'Shadows', prefix: 'cgShadows', icon: '🌑' },
  { key: 'Midtones', prefix: 'cgMidtones', icon: '🌗' },
  { key: 'Highlights', prefix: 'cgHighlights', icon: '🌕' },
  { key: 'Global', prefix: 'cgGlobal', icon: '🌐' },
];

export default function ColorGradingPanel({ settings, onChange }) {
  const [activeSection, setActiveSection] = useState(0);
  const section = SECTIONS[activeSection];

  return (
    <PanelSection title="Color Grading">
      {/* Bölüm Seçici */}
      <div className="flex gap-1 mb-3">
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(i)}
            className={`flex-1 text-xs py-1.5 rounded transition-colors font-medium ${
              i === activeSection
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            <span className="mr-1">{s.icon}</span>
            {s.key}
          </button>
        ))}
      </div>

      {/* Hue / Saturation / Luminance */}
      <div className="space-y-3">
        <SliderControl
          label="Hue"
          min={0} max={360} step={1}
          value={settings[`${section.prefix}Hue`]}
          onChange={(v) => onChange(`${section.prefix}Hue`, v)}
          defaultValue={0}
          gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
          decimals={0}
        />
        <SliderControl
          label="Saturation"
          min={0} max={100} step={1}
          value={settings[`${section.prefix}Sat`]}
          onChange={(v) => onChange(`${section.prefix}Sat`, v)}
          defaultValue={0}
          decimals={0}
        />
        <SliderControl
          label="Luminance"
          min={-100} max={100} step={1}
          value={settings[`${section.prefix}Lum`]}
          onChange={(v) => onChange(`${section.prefix}Lum`, v)}
          defaultValue={0}
          decimals={0}
        />
      </div>

      {/* Blending & Balance (her zaman görünür) */}
      <div className="mt-4 pt-4 border-t border-zinc-700/50 space-y-3">
        <SliderControl
          label="Blending"
          min={0} max={100} step={1}
          value={settings.cgBlending}
          onChange={(v) => onChange('cgBlending', v)}
          defaultValue={50}
          decimals={0}
        />
        <SliderControl
          label="Balance"
          min={-100} max={100} step={1}
          value={settings.cgBalance}
          onChange={(v) => onChange('cgBalance', v)}
          defaultValue={0}
          decimals={0}
        />
      </div>
    </PanelSection>
  );
}
