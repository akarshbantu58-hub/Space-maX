import React from 'react';
import { Mission } from '../../types';
import { MISSIONS_LIST } from '../../data/missions';
import { Award, CheckCircle, Circle, X } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAltitude: number;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  maxAltitude
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-400" />
            <h2 className="font-bold text-base text-white">Missions & Achievements</h2>
          </div>
          <button onClick={() => { playClickSound(); onClose(); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {MISSIONS_LIST.map(mission => {
            const isCompleted = mission.check({} as any, maxAltitude, 0, []);
            return (
              <div
                key={mission.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-slate-800/60 border-slate-700/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                      {mission.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{mission.description}</p>
                    <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-orange-400 border border-slate-700">
                      Reward: {mission.reward}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                  isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? 'Completed' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
