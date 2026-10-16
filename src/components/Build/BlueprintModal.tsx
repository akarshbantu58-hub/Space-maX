import React, { useState, useEffect } from 'react';
import { Blueprint } from '../../types';
import { PRESET_BLUEPRINTS } from '../../data/presets';
import { FolderOpen, Save, Trash2, X, Rocket } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlueprintName: string;
  onSaveBlueprint: (name: string) => void;
  onLoadBlueprint: (blueprint: Blueprint) => void;
}

export const BlueprintModal: React.FC<BlueprintModalProps> = ({
  isOpen,
  onClose,
  currentBlueprintName,
  onSaveBlueprint,
  onLoadBlueprint
}) => {
  const [saveName, setSaveName] = useState(currentBlueprintName || 'My Rocket');
  const [savedBlueprints, setSavedBlueprints] = useState<Blueprint[]>([]);

  useEffect(() => {
    const loaded = localStorage.getItem('sfs_blueprints');
    if (loaded) {
      try {
        setSavedBlueprints(JSON.parse(loaded));
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    playClickSound();
    onSaveBlueprint(saveName);
    const loaded = localStorage.getItem('sfs_blueprints');
    if (loaded) {
      try {
        setSavedBlueprints(JSON.parse(loaded));
      } catch {}
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const updated = savedBlueprints.filter(b => b.id !== id);
    setSavedBlueprints(updated);
    localStorage.setItem('sfs_blueprints', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-orange-400" />
            <h2 className="font-bold text-base text-white">Rocket Blueprints</h2>
          </div>
          <button onClick={() => { playClickSound(); onClose(); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Save Current Rocket</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                placeholder="Blueprint Name"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Preset Blueprints</h3>
            <div className="grid grid-cols-1 gap-3">
              {PRESET_BLUEPRINTS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => { playClickSound(); onLoadBlueprint(preset); onClose(); }}
                  className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-orange-500 rounded-xl p-4 cursor-pointer transition flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 group-hover:scale-105 transition">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{preset.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{preset.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-600/20 text-orange-400 border border-orange-500/30 group-hover:bg-orange-600 group-hover:text-white transition">
                    Load
                  </span>
                </div>
              ))}
            </div>
          </div>

          {savedBlueprints.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Saved Blueprints</h3>
              <div className="grid grid-cols-1 gap-3">
                {savedBlueprints.map(bp => (
                  <div
                    key={bp.id}
                    onClick={() => { playClickSound(); onLoadBlueprint(bp); onClose(); }}
                    className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-orange-500 rounded-xl p-4 cursor-pointer transition flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:scale-105 transition">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{bp.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{bp.parts.length} parts • Saved {new Date(bp.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(bp.id, e)}
                        className="p-2 text-red-400 hover:bg-red-950/60 rounded-lg transition"
                        title="Delete Blueprint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 group-hover:border-orange-500 transition">
                        Load
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
