import React, { useCallback } from 'react';

/**
 * Yeniden kullanılabilir slider bileşeni.
 *
 * @param {string}  label       - Etiket
 * @param {number}  min         - Minimum değer
 * @param {number}  max         - Maksimum değer
 * @param {number}  step        - Adım büyüklüğü
 * @param {number}  value       - Geçerli değer
 * @param {Function} onChange   - (yeniDeğer) => void
 * @param {number}  [defaultValue] - Çift tıkla sıfırlama değeri
 * @param {string}  [color]     - Etiket rengi (HSL paneli için)
 * @param {string}  [gradient]  - Slider arka planı için CSS gradient
 * @param {number}  [decimals]  - Gösterilecek ondalık sayısı (varsayılan 2)
 */
export default function SliderControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
  defaultValue,
  color,
  gradient,
  decimals = 2,
}) {
  const handleDoubleClick = useCallback(() => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    }
  }, [onChange, defaultValue]);

  const sliderStyle = gradient
    ? { background: gradient }
    : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span
          className="text-zinc-300 select-none"
          style={color ? { color } : undefined}
        >
          {label}
        </span>
        <span className="text-indigo-400 font-mono tabular-nums">
          {Number(value).toFixed(decimals)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onDoubleClick={handleDoubleClick}
        style={sliderStyle}
        className="slider-control"
      />
    </div>
  );
}
