import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Açılır/kapanır panel sarmalayıcı.
 *
 * @param {string}  title        - Panel başlığı
 * @param {boolean} [defaultOpen] - Varsayılan olarak açık mı
 * @param {React.ReactNode} children - Panel içeriği
 */
export default function PanelSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors"
      >
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
          {title}
        </h2>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}
