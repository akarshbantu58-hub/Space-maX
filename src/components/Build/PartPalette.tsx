import React, { useState } from 'react';
import { PartDefinition, PartCategory } from '../../types';
import { PARTS_CATALOG } from '../../data/partsCatalog';
import { Flame, Fuel, User, Cpu, Triangle, Navigation, Split, Columns, Grid, Wind, Anchor, Sun, Move } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface PartPaletteProps {
  onSelectPart: (part: PartDefinition) => void;
}

const CATEGORIES: { id: PartCategory; label: string }[] = [
  { id: 'engines', label: 'Engines' },
  { id: 'fuel', label: 'Fuel Tanks' },
  { id: 'command', label: 'Command' },
  { id: 'aerodynamics', label: 'Aero' },
  { id: 'structural', label: 'Structural' },
  { id: 'utility', label: 'Utility' }
];

export const PartPalette: React.FC<PartPaletteProps> = ({ onSelectPart }) => {
  const [activeCategory, setActiveCategory] = useState<PartCategory>('engines');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Fuel': return <Fuel className="w-5 h-5 text-amber-400" />;
      case 'User': return <User className="w-5 h-5 text-blue-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Triangle': return <Triangle className="w-5 h-5 text-slate-300" />;
      case 'Navigation': return <Navigation className="w-5 h-5 text-indigo-400" />;
      case 'Split': return <Split className="w-5 h-5 text-emerald-400" />;
      case 'Columns': return <Columns className="w-5 h-5 text-emerald-400" />;
      case 'Grid': return <Grid className="w-5 h-5 text-slate-400" />;
      case 'Wind': return <Wind className="w-5 h-5 text-teal-400" />;
      case 'Anchor': return <Anchor className="w-5 h-5 text-blue-300" />;
      case 'Sun': return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'Move': return <Move className="w-5 h-5 text-purple-400" />;
      default: return <Flame className="w-5 h-5 text-orange-400" />;
    }
  };

  const filteredParts = PARTS_CATALOG.filter(p => p.category === activeCategory);

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none shadow-xl z-20">
      <div className="p-3 border-b border-slate-800">
        <h2 className="font-bold text-sm text-slate-200 tracking-wider uppercase">Parts Catalog</h2>
      </div>

      <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/60 border-b border-slate-800">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { playClickSound(); setActiveCategory(cat.id); }}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
              activeCategory === cat.id
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredParts.map(part => (
          <div
            key={part.id}
            onClick={() => { playClickSound(); onSelectPart(part); }}
            className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-orange-500/60 rounded-xl p-3 cursor-pointer transition-all shadow-sm hover:shadow-orange-500/10 flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              {getIcon(part.iconName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-sm text-slate-100 truncate">{part.name}</h3>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-900 text-orange-400 border border-slate-700">
                  {part.mass}t
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{part.description}</p>
              
              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                {part.thrust && <span>Thrust: {part.thrust}kN</span>}
                {part.fuelCapacity && <span>Fuel: {part.fuelCapacity}t</span>}
                {part.isp && <span>ISP: {part.isp}s</span>}
                <span>Size: {part.width}x{part.height}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
