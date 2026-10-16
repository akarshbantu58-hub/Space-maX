import React from 'react';
import { GameMode } from '../types';
import { Rocket, Wrench, Globe, BookOpen, Award, FolderOpen, Play, Trash2, Volume2, VolumeX } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface HeaderProps {
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
  onLaunch: () => void;
  onClear: () => void;
  onOpenBlueprints: () => void;
  hasRocket: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  setMode,
  onLaunch,
  onClear,
  onOpenBlueprints,
  hasRocket,
  soundEnabled,
  setSoundEnabled
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-4 select-none z-30 relative shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Rocket className="w-6 h-6 text-white transform -rotate-45" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            Spaceflight Simulator 2D
          </h1>
          <p className="text-xs text-slate-400">Orbital Sandbox & Rocket Builder</p>
        </div>
      </div>

      <div className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 gap-1">
        <button
          onClick={() => { playClickSound(); setMode('build'); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            currentMode === 'build'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Build</span>
        </button>

        <button
          onClick={() => { playClickSound(); setMode('flight'); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            currentMode === 'flight'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Flight</span>
        </button>

        <button
          onClick={() => { playClickSound(); setMode('map'); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            currentMode === 'map'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Map View</span>
        </button>

        <button
          onClick={() => { playClickSound(); setMode('presets'); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            currentMode === 'presets'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Presets</span>
        </button>

        <button
          onClick={() => { playClickSound(); setMode('missions'); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            currentMode === 'missions'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Missions</span>
        </button>

        <button
          onClick={() => { playClickSound(); setMode('guide'); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            currentMode === 'guide'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Planets</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => { playClickSound(); setSoundEnabled(!soundEnabled); }}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {currentMode === 'build' && (
          <>
            <button
              onClick={() => { playClickSound(); onOpenBlueprints(); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Blueprints</span>
            </button>

            <button
              onClick={() => { playClickSound(); onClear(); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-sm font-medium rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>

            <button
              onClick={() => { playClickSound(); onLaunch(); }}
              disabled={!hasRocket}
              className={`flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 transition transform active:scale-95 ${
                !hasRocket ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>LAUNCH</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
