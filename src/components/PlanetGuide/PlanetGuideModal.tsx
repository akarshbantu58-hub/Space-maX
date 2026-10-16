import React from 'react';
import { SOLAR_SYSTEM } from '../../data/solarSystem';
import { BookOpen, Globe, X } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface PlanetGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanetGuideModal: React.FC<PlanetGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-400" />
            <h2 className="font-bold text-base text-white">Solar System Encyclopedia</h2>
          </div>
          <button onClick={() => { playClickSound(); onClose(); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOLAR_SYSTEM.map(body => (
            <div
              key={body.id}
              className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: body.color }} />
                    <h3 className="font-bold text-base text-white">{body.name}</h3>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                    {body.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{body.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/60 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Radius</span>
                  <span className="text-white">{(body.radius / 1000).toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Surface Gravity</span>
                  <span className="text-orange-400">{body.surfaceGravity} m/s²</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Atmosphere</span>
                  <span className="text-cyan-400">{body.atmosphereHeight > 0 ? `${(body.atmosphereHeight / 1000).toFixed(0)} km` : 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Distance</span>
                  <span className="text-emerald-400">{body.distance > 0 ? (body.distance / 1000000000).toFixed(1) + ' Gm' : 'Center'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
