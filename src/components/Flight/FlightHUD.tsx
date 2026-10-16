import React from 'react';
import { FlightState, CelestialBody } from '../../types';
import { getBodyById } from '../../data/solarSystem';
import { Play, Pause, FastForward, Globe, Shield, Zap, Wind, Anchor, RotateCcw } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface FlightHUDProps {
  flightState: FlightState;
  setFlightState: React.Dispatch<React.SetStateAction<FlightState>>;
  onToggleMap: () => void;
  onActivateStage: () => void;
  onResetFlight: () => void;
}

export const FlightHUD: React.FC<FlightHUDProps> = ({
  flightState,
  setFlightState,
  onToggleMap,
  onActivateStage,
  onResetFlight
}) => {
  const currentBody = getBodyById(flightState.currentBodyId);

  // Calculate altitude above surface
  const distance = Math.sqrt(flightState.x * flightState.x + flightState.y * flightState.y);
  const altitude = Math.max(0, distance - currentBody.radius);
  const speed = Math.sqrt(flightState.vx * flightState.vx + flightState.vy * flightState.vy);

  const handleThrottleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setFlightState(prev => ({ ...prev, throttle: val }));
  };

  const handleWarp = (warp: number) => {
    playClickSound();
    setFlightState(prev => ({ ...prev, timeWarp: warp }));
  };

  return (
    <>
      {/* Top Telemetry & Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none select-none z-20">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-6 text-xs text-slate-300 pointer-events-auto">
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Altitude</span>
            <span className="text-white font-mono font-bold text-sm">
              {altitude > 100000 ? (altitude / 1000).toFixed(1) + ' km' : altitude.toFixed(0) + ' m'}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Surface Speed</span>
            <span className="text-orange-400 font-mono font-bold text-sm">
              {speed > 1000 ? (speed / 1000).toFixed(2) + ' km/s' : speed.toFixed(1) + ' m/s'}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Body SOI</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">{currentBody.name}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Time Warp</span>
            <span className="text-cyan-400 font-mono font-bold text-sm">{flightState.timeWarp}x</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => { playClickSound(); onToggleMap(); }}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-white font-bold rounded-2xl shadow-xl transition"
          >
            <Globe className="w-5 h-5 text-orange-400" />
            <span>Map View</span>
          </button>

          <button
            onClick={() => { playClickSound(); onResetFlight(); }}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-red-400 font-bold rounded-2xl shadow-xl transition"
            title="Reset Flight"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Time Warp Controls */}
      <div className="absolute top-24 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-2xl shadow-xl flex flex-col gap-1.5 pointer-events-auto select-none z-20">
        {[1, 5, 10, 50, 100, 1000, 10000].map(warp => (
          <button
            key={warp}
            onClick={() => handleWarp(warp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
              flightState.timeWarp === warp
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {warp}x
          </button>
        ))}
      </div>

      {/* Bottom Flight Controls (Throttle & Staging) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-6 pointer-events-auto select-none z-20">
        {/* Throttle Slider */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-36 text-xs text-slate-300 font-bold">
            <span>Throttle</span>
            <span className="text-orange-400 font-mono">{(flightState.throttle * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={flightState.throttle}
            onChange={handleThrottleChange}
            className="w-36 accent-orange-500 cursor-pointer"
          />
          <div className="flex gap-1 w-full">
            <button
              onClick={() => { playClickSound(); setFlightState(prev => ({ ...prev, throttle: 0 })); }}
              className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg text-slate-300 transition"
            >
              0%
            </button>
            <button
              onClick={() => { playClickSound(); setFlightState(prev => ({ ...prev, throttle: 0.5 })); }}
              className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg text-slate-300 transition"
            >
              50%
            </button>
            <button
              onClick={() => { playClickSound(); setFlightState(prev => ({ ...prev, throttle: 1 })); }}
              className="flex-1 py-1 bg-orange-600 hover:bg-orange-500 text-[10px] font-bold rounded-lg text-white transition"
            >
              100%
            </button>
          </div>
        </div>

        {/* Action Buttons (SAS, Gear, Parachute) */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl flex items-center gap-2">
          <button
            onClick={() => { playClickSound(); setFlightState(prev => ({ ...prev, sas: !prev.sas })); }}
            className={`p-3 rounded-xl border transition ${
              flightState.sas
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-600/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle SAS (Stability Augmentation)"
          >
            <Zap className="w-5 h-5" />
          </button>

          <button
            onClick={() => { playClickSound(); setFlightState(prev => ({ ...prev, gearExtended: !prev.gearExtended })); }}
            className={`p-3 rounded-xl border transition ${
              flightState.gearExtended
                ? 'bg-blue-600/30 border-blue-500 text-blue-400 shadow-md shadow-blue-600/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Landing Gear"
          >
            <Anchor className="w-5 h-5" />
          </button>

          <button
            onClick={() => { playClickSound(); setFlightState(prev => ({ ...prev, parachuteDeployed: true })); }}
            className={`p-3 rounded-xl border transition ${
              flightState.parachuteDeployed
                ? 'bg-teal-600/30 border-teal-500 text-teal-400 shadow-md shadow-teal-600/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Deploy Parachute"
          >
            <Wind className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Activation Button */}
        <button
          onClick={() => { playClickSound(); onActivateStage(); }}
          className="px-8 py-5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-lg rounded-2xl shadow-2xl shadow-orange-600/50 transition transform active:scale-95 flex flex-col items-center"
        >
          <span>STAGE</span>
          <span className="text-[10px] font-mono opacity-80">Stage {flightState.activeStage}</span>
        </button>
      </div>

      {/* Crash / Success Overlays */}
      {flightState.crashed && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 text-center p-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 mb-4 shadow-xl">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Vessel Destroyed</h2>
          <p className="text-slate-300 text-sm max-w-md mb-6">Impact velocity was too high or vessel collided with terrain.</p>
          <button
            onClick={() => { playClickSound(); onResetFlight(); }}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition"
          >
            Rebuild Rocket
          </button>
        </div>
      )}

      {flightState.landed && altitude < 10 && (
        <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 text-center p-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
            <Globe className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Successful Landing!</h2>
          <p className="text-slate-300 text-sm max-w-md mb-6">You have safely touched down on the surface of {currentBody.name}.</p>
          <button
            onClick={() => { playClickSound(); onResetFlight(); }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition"
          >
            Return to Builder
          </button>
        </div>
      )}
    </>
  );
};
