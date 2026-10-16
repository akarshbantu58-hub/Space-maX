import React, { useState } from 'react';
import { GameMode, PlacedPart, PartDefinition, FlightState, Blueprint } from './types';
import { PRESET_BLUEPRINTS } from './data/presets';
import { Header } from './components/Header';
import { VABCanvas } from './components/Build/VABCanvas';
import { PartPalette } from './components/Build/PartPalette';
import { StagingPanel } from './components/Build/StagingPanel';
import { BlueprintModal } from './components/Build/BlueprintModal';
import { FlightCanvas } from './components/Flight/FlightCanvas';
import { FlightHUD } from './components/Flight/FlightHUD';
import { MapView } from './components/Flight/MapView';
import { MissionsModal } from './components/Missions/MissionsModal';
import { PlanetGuideModal } from './components/PlanetGuide/PlanetGuideModal';
import { playStageSound } from './utils/audio';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('build');
  const [parts, setParts] = useState<PlacedPart[]>(PRESET_BLUEPRINTS[0].parts);
  const [selectedPartDef, setSelectedPartDef] = useState<PartDefinition | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentBlueprintName, setCurrentBlueprintName] = useState<string>('My Rocket');
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState<boolean>(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  const [flightState, setFlightState] = useState<FlightState>({
    x: 0,
    y: 6371000, // Earth radius
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    throttle: 0,
    rcs: false,
    sas: true,
    gearExtended: true,
    solarPanelsExtended: false,
    parachuteDeployed: false,
    parachuteCut: false,
    currentBodyId: 'earth',
    timeWarp: 1,
    landed: true,
    crashed: false,
    destroyed: false,
    flightTime: 0,
    maxAltitude: 0,
    maxSpeed: 0,
    activeStage: 1
  });

  const handleLaunch = () => {
    // Reset flight state for launch from Earth surface
    const earthRadius = 6371000;
    setFlightState({
      x: 0,
      y: earthRadius,
      vx: 0,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      throttle: 0,
      rcs: false,
      sas: true,
      gearExtended: true,
      solarPanelsExtended: false,
      parachuteDeployed: false,
      parachuteCut: false,
      currentBodyId: 'earth',
      timeWarp: 1,
      landed: true,
      crashed: false,
      destroyed: false,
      flightTime: 0,
      maxAltitude: 0,
      maxSpeed: 0,
      activeStage: Math.max(...parts.map(p => p.stage || 1), 1)
    });
    setCurrentMode('flight');
  };

  const handleResetFlight = () => {
    setCurrentMode('build');
  };

  const handleActivateStage = () => {
    playStageSound();
    // Remove parts in active stage or trigger stage event
    setParts(prev => prev.filter(p => (p.stage || 1) !== flightState.activeStage));
    setFlightState(prev => ({
      ...prev,
      activeStage: Math.max(1, prev.activeStage - 1)
    }));
  };

  const handleClear = () => {
    setParts([]);
  };

  const handleSaveBlueprint = (name: string) => {
    setCurrentBlueprintName(name);
    const newBlueprint: Blueprint = {
      id: 'bp_' + Math.random().toString(36).substr(2, 9),
      name,
      description: 'Custom rocket blueprint',
      parts,
      createdAt: Date.now()
    };
    const existing = localStorage.getItem('sfs_blueprints');
    const list: Blueprint[] = existing ? JSON.parse(existing) : [];
    list.push(newBlueprint);
    localStorage.setItem('sfs_blueprints', JSON.stringify(list));
    setIsBlueprintModalOpen(false);
  };

  const handleLoadBlueprint = (blueprint: Blueprint) => {
    setCurrentBlueprintName(blueprint.name);
    setParts(blueprint.parts);
  };

  const handleUpdatePartStage = (instanceId: string, newStage: number) => {
    setParts(prev => prev.map(p => p.instanceId === instanceId ? { ...p, stage: newStage } : p));
  };

  // Sync mode changes from header buttons
  const handleSetMode = (mode: GameMode) => {
    if (mode === 'missions') {
      setIsMissionsModalOpen(true);
    } else if (mode === 'guide') {
      setIsGuideModalOpen(true);
    } else if (mode === 'presets') {
      setIsBlueprintModalOpen(true);
    } else {
      setCurrentMode(mode);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      <Header
        currentMode={currentMode}
        setMode={handleSetMode}
        onLaunch={handleLaunch}
        onClear={handleClear}
        onOpenBlueprints={() => setIsBlueprintModalOpen(true)}
        hasRocket={parts.length > 0}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      <main className="flex-1 flex overflow-hidden relative">
        {currentMode === 'build' && (
          <>
            <PartPalette onSelectPart={setSelectedPartDef} />
            <VABCanvas
              parts={parts}
              setParts={setParts}
              selectedPartDef={selectedPartDef}
              setSelectedPartDef={setSelectedPartDef}
            />
            <StagingPanel
              parts={parts}
              onUpdatePartStage={handleUpdatePartStage}
            />
          </>
        )}

        {currentMode === 'flight' && (
          <>
            <FlightCanvas
              flightState={flightState}
              setFlightState={setFlightState}
              parts={parts}
            />
            <FlightHUD
              flightState={flightState}
              setFlightState={setFlightState}
              onToggleMap={() => setCurrentMode('map')}
              onActivateStage={handleActivateStage}
              onResetFlight={handleResetFlight}
            />
          </>
        )}

        {currentMode === 'map' && (
          <MapView
            flightState={flightState}
            setFlightState={setFlightState}
            onCloseMap={() => setCurrentMode('flight')}
          />
        )}
      </main>

      <BlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        currentBlueprintName={currentBlueprintName}
        onSaveBlueprint={handleSaveBlueprint}
        onLoadBlueprint={handleLoadBlueprint}
      />

      <MissionsModal
        isOpen={isMissionsModalOpen}
        onClose={() => setIsMissionsModalOpen(false)}
        maxAltitude={flightState.maxAltitude}
      />

      <PlanetGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
