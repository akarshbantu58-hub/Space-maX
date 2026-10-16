import React from 'react';
import { PlacedPart } from '../../types';
import { PARTS_CATALOG } from '../../data/partsCatalog';
import { Layers, Trash2, Plus } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface StagingPanelProps {
  parts: PlacedPart[];
  onUpdatePartStage: (instanceId: string, newStage: number) => void;
}

export const StagingPanel: React.FC<StagingPanelProps> = ({ parts, onUpdatePartStage }) => {
  // Group parts by stage
  const stagesMap = new Map<number, PlacedPart[]>();
  parts.forEach(p => {
    const stage = p.stage ?? 1;
    if (!stagesMap.has(stage)) {
      stagesMap.set(stage, []);
    }
    stagesMap.get(stage)?.push(p);
  });

  const sortedStages = Array.from(stagesMap.keys()).sort((a, b) => b - a);

  const getPartDef = (defId: string) => PARTS_CATALOG.find(p => p.id === defId);

  return (
    <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none shadow-xl z-20">
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-400" />
          <h2 className="font-bold text-sm text-slate-200 tracking-wider uppercase">Staging Sequence</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">{sortedStages.length} Stages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sortedStages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No parts placed yet. Add parts to configure staging.
          </div>
        ) : (
          sortedStages.map((stageNum, index) => {
            const stageParts = stagesMap.get(stageNum) || [];
            return (
              <div key={stageNum} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                  <span className="font-bold text-xs text-orange-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-[10px]">
                      {sortedStages.length - index}
                    </span>
                    Stage {stageNum}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {stageParts.map(part => {
                    const def = getPartDef(part.definitionId);
                    if (!def) return null;
                    return (
                      <div key={part.instanceId} className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                        <span className="text-slate-200 truncate font-medium">{def.name}</span>
                        <div className="flex items-center gap-1">
                          {stageNum > 1 && (
                            <button
                              onClick={() => { playClickSound(); onUpdatePartStage(part.instanceId, stageNum - 1); }}
                              className="text-slate-400 hover:text-white px-1 text-[10px] bg-slate-800 rounded"
                              title="Move down stage"
                            >
                              ▼
                            </button>
                          )}
                          <button
                            onClick={() => { playClickSound(); onUpdatePartStage(part.instanceId, stageNum + 1); }}
                            className="text-slate-400 hover:text-white px-1 text-[10px] bg-slate-800 rounded"
                            title="Move up stage"
                          >
                            ▲
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
