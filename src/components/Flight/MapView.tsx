import React, { useRef, useEffect } from 'react';
import { FlightState } from '../../types';
import { SOLAR_SYSTEM, getBodyById } from '../../data/solarSystem';
import { Globe, ArrowLeft } from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface MapViewProps {
  flightState: FlightState;
  setFlightState: React.Dispatch<React.SetStateAction<FlightState>>;
  onCloseMap: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  flightState,
  onCloseMap
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentBody = getBodyById(flightState.currentBodyId);

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
    let angleOffset = 0;

    const render = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = 0.0000008; // scale factor for solar system distances

      angleOffset += 0.005 * flightState.timeWarp;

      // Draw Orbits & Bodies
      SOLAR_SYSTEM.forEach((body, idx) => {
        const x = centerX + Math.cos(idx + angleOffset * body.orbitSpeed) * (body.distance * scale);
        const y = centerY + Math.sin(idx + angleOffset * body.orbitSpeed) * (body.distance * scale);

        if (body.distance > 0) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, body.distance * scale, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = body.color;
        ctx.beginPath();
        const radius = Math.max(4, Math.log10(body.radius) * 2);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(body.name, x + radius + 6, y + 4);
      });

      // Draw Rocket Position relative to current body
      const bodyX = centerX;
      const bodyY = centerY;
      const rx = bodyX + (flightState.x * 0.0001);
      const ry = bodyY - (flightState.y * 0.0001);

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(rx, ry, 5, 0, Math.PI * 2);
      ctx.fill();

      // Rocket trajectory prediction orbit ellipse
      ctx.strokeStyle = '#f97316';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(bodyX, bodyY, 150, 100, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [flightState]);

  return (
    <div className="relative flex-1 h-full bg-slate-950 overflow-hidden flex flex-col select-none">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <button
          onClick={() => { playClickSound(); onCloseMap(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-2xl shadow-xl transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Resume Flight</span>
        </button>
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-white text-sm font-bold">
          <Globe className="w-5 h-5 text-orange-400" />
          <span>Solar System Map • Focused on {currentBody.name}</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
