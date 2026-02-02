import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store';

export const Tooltip: React.FC = () => {
  const { hoveredLayer } = useAppStore();
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltipRef.current) {
        // Offset the tooltip so it doesn't block the cursor
        const x = e.clientX + 16;
        const y = e.clientY + 16;
        tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!hoveredLayer) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed top-0 left-0 z-50 pointer-events-none"
      style={{ willChange: 'transform' }}
    >
      <div className="bg-prism-panel/90 backdrop-blur-md border border-prism-border px-3 py-2 rounded shadow-xl min-w-[120px]">
        <div className="text-[10px] font-bold text-prism-accent uppercase tracking-wider mb-0.5">
          {hoveredLayer.type}
        </div>
        <div className="text-sm font-serif text-slate-100 whitespace-nowrap">
          {hoveredLayer.name}
        </div>
      </div>
    </div>
  );
};