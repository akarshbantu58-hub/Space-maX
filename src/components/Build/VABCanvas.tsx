import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlacedPart, PartDefinition } from '../../types';
import { PARTS_CATALOG } from '../../data/partsCatalog';
import { RotateCw, Trash2, Copy, Move } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface VABCanvasProps {
  parts: PlacedPart[];
  setParts: React.Dispatch<React.SetStateAction<PlacedPart[]>>;
  selectedPartDef: PartDefinition | null;
  setSelectedPartDef: (def: PartDefinition | null) => void;
}

export const VABCanvas: React.FC<VABCanvasProps> = ({
  parts,
  setParts,
  selectedPartDef,
  setSelectedPartDef
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 100 });
  const [zoom, setZoom] = useState(25); // pixels per grid unit (1 unit = 0.5m)
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDraggingPart, setIsDraggingPart] = useState(false);
  const [draggedPartId, setDraggedPartId] = useState<string | null>(null);

  const getPartDef = (defId: string) => PARTS_CATALOG.find(p => p.id === defId);

  // Handle Canvas Pan & Zoom
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.shiftKey)) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = canvas.width / 2 + pan.x;
    const centerY = canvas.height / 2 + pan.y;

    // Check if clicked on a placed part
    const clickedPart = [...parts].reverse().find(p => {
      const def = getPartDef(p.definitionId);
      if (!def) return false;
      const w = def.width * zoom;
      const h = def.height * zoom;
      const px = centerX + p.x * zoom - w / 2;
      const py = centerY - p.y * zoom - h;
      return mouseX >= px && mouseX <= px + w && mouseY >= py && mouseY <= py + h;
    });

    if (clickedPart) {
      setSelectedInstanceId(clickedPart.instanceId);
      setIsDraggingPart(true);
      setDragStart({ x: mouseX, y: mouseY });
    } else if (selectedPartDef) {
      // Spawn new part at mouse grid position
      const gridX = Math.round((mouseX - centerX) / zoom);
      const gridY = Math.round((centerY - mouseY) / zoom);
      const newPart: PlacedPart = {
        instanceId: 'part_' + Math.random().toString(36).substr(2, 9),
        definitionId: selectedPartDef.id,
        x: gridX,
        y: Math.max(0, gridY),
        rotation: 0,
        fuel: selectedPartDef.fuelCapacity || 0,
        stage: 1
      };
      playClickSound();
      setParts(prev => [...prev, newPart]);
      setSelectedInstanceId(newPart.instanceId);
      setSelectedPartDef(null);
    } else {
      setSelectedInstanceId(null);
      // Empty-space drags pan the build area on both touchscreens and desktop.
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingCanvas) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    } else if (isDraggingPart && selectedInstanceId) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const dx = Math.round((mouseX - dragStart.x) / zoom);
      const dy = Math.round((dragStart.y - mouseY) / zoom);

      if (dx !== 0 || dy !== 0) {
        setParts(prev => prev.map(p => {
          if (p.instanceId === selectedInstanceId) {
            return { ...p, x: p.x + dx, y: Math.max(0, p.y + dy) };
          }
          return p;
        }));
        setDragStart({ x: mouseX, y: mouseY });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDraggingCanvas(false);
    setIsDraggingPart(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.min(Math.max(10, prev + (e.deltaY < 0 ? 3 : -3)), 60));
  };

  const rotateSelected = useCallback(() => {
    if (!selectedInstanceId) return;
    playClickSound();
    setParts(prev => prev.map(p => {
      if (p.instanceId === selectedInstanceId) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  }, [selectedInstanceId, setParts]);

  const deleteSelected = useCallback(() => {
    if (!selectedInstanceId) return;
    playClickSound();
    setParts(prev => prev.filter(p => p.instanceId !== selectedInstanceId));
    setSelectedInstanceId(null);
  }, [selectedInstanceId, setParts]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        rotateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateSelected, deleteSelected]);

  // Render Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;
    const render = () => {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2 + pan.x;
      const centerY = canvas.height / 2 + pan.y;

      // Draw VAB Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = zoom;

      const startX = centerX % gridSize;
      const startY = centerY % gridSize;

      ctx.beginPath();
      for (let x = startX; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Draw Center Axis
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, canvas.height);
      ctx.stroke();

      // Draw Placed Parts
      parts.forEach(p => {
        const def = getPartDef(p.definitionId);
        if (!def) return;

        const w = def.width * zoom;
        const h = def.height * zoom;
        const px = centerX + p.x * zoom - w / 2;
        const py = centerY - p.y * zoom - h;

        ctx.save();
        ctx.translate(px + w / 2, py + h / 2);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.translate(-w / 2, -h / 2);

        // Part Fill
        ctx.fillStyle = p.instanceId === selectedInstanceId ? '#f97316' : '#334155';
        ctx.strokeStyle = p.instanceId === selectedInstanceId ? '#fb923c' : '#475569';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // Part details drawing
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(10, zoom * 0.4)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.name.split(' ')[0], w / 2, h / 2);

        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [parts, pan, zoom, selectedInstanceId]);

  // Calculate rocket stats
  const totalMass = parts.reduce((sum, p) => {
    const def = getPartDef(p.definitionId);
    return sum + (def ? def.mass + (p.fuel || 0) : 0);
  }, 0);

  const totalThrust = parts.reduce((sum, p) => {
    const def = getPartDef(p.definitionId);
    return sum + (def?.thrust || 0);
  }, 0);

  const twr = totalMass > 0 ? (totalThrust / (totalMass * 9.81)).toFixed(2) : '0.00';

  return (
    <div className="relative flex-1 h-full bg-slate-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-6 text-xs text-slate-300 pointer-events-none select-none">
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[10px]">Total Mass</span>
          <span className="text-white font-mono font-bold text-sm">{totalMass.toFixed(1)} t</span>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[10px]">Total Thrust</span>
          <span className="text-orange-400 font-mono font-bold text-sm">{totalThrust} kN</span>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[10px]">TWR (Sea Level)</span>
          <span className="text-emerald-400 font-mono font-bold text-sm">{twr}</span>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div>
          <span className="text-slate-500 block uppercase font-bold text-[10px]">Parts Count</span>
          <span className="text-white font-mono font-bold text-sm">{parts.length}</span>
        </div>
      </div>

      {/* Selected Part Quick Tools */}
      {selectedInstanceId && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-2xl shadow-xl flex items-center gap-2 select-none animate-slideUp">
          <button
            onClick={rotateSelected}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <RotateCw className="w-4 h-4" />
            <span>Rotate (R)</span>
          </button>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-semibold rounded-xl transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete (Del)</span>
          </button>
        </div>
      )}

      {selectedPartDef && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-orange-600/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce select-none">
          <span>Click on canvas to place {selectedPartDef.name}</span>
          <button onClick={() => setSelectedPartDef(null)} className="bg-black/30 hover:bg-black/50 px-2 py-1 rounded-lg">Cancel</button>
        </div>
      )}
    </div>
  );
};
