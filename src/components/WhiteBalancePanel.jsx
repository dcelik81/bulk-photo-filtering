import React from 'react';
import PanelSection from './PanelSection';
import SliderControl from './SliderControl';

export default function WhiteBalancePanel({ settings, onChange }) {
  return (
    <PanelSection title="White Balance">
      <SliderControl
        label="Temperature"
        min={-100} max={100} step={1}
        value={settings.temperature}
        onChange={(v) => onChange('temperature', v)}
        defaultValue={0}
        gradient="linear-gradient(to right, #6bb7f0, #f5f5f5 50%, #f0b86b)"
        decimals={0}
      />
      <SliderControl
        label="Tint"
        min={-100} max={100} step={1}
        value={settings.tint}
        onChange={(v) => onChange('tint', v)}
        defaultValue={0}
        gradient="linear-gradient(to right, #6bf07a, #f5f5f5 50%, #d96bf0)"
        decimals={0}
      />
    </PanelSection>
  );
}
