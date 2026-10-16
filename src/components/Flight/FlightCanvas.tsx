import React, { useRef, useEffect, useState } from 'react';
import { FlightState, PlacedPart } from '../../types';
import { getBodyById, G } from '../../data/solarSystem';
import { PARTS_CATALOG } from '../../data/partsCatalog';
import { updateThrusterSound, playExplosionSound, playSuccessSound } from '../../utils/audio';

interface FlightCanvasProps {
  flightState: FlightState;
  setFlightState: React.Dispatch<React.SetStateAction<FlightState>>;
  setPartsForFuel?: React.Dispatch<React.SetStateAction<PlacedPart[]>>;
  parts: PlacedPart[];
}

export const FlightCanvas: React.FC<FlightCanvasProps> = ({
  flightState,
  setFlightState,
  parts,
  setPartsForFuel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [launchStatus, setLaunchStatus] = useState('READY');
  const stateRef = useRef(flightState);
  stateRef.current = flightState;

  const getPartDef = (defId: string) => PARTS_CATALOG.find(p => p.id === defId);

  // Physics loop
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const updatePhysics = (currentTime: number) => {
      const dtReal = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const state = stateRef.current;
      if (state.crashed || state.destroyed) {
        setLaunchStatus(state.destroyed ? 'VEHICLE LOST' : 'FLIGHT TERMINATED');
        updateThrusterSound(false, 0);
        animationId = requestAnimationFrame(updatePhysics);
        return;
      }

      const dt = Math.min(0.05, dtReal) * state.timeWarp;
      const currentBody = getBodyById(state.currentBodyId);
      if (state.landed) setLaunchStatus('PAD / SURFACE');
      else if (state.crashed) setLaunchStatus('IMPACT');
      else setLaunchStatus(Math.sqrt(state.x * state.x + state.y * state.y) - currentBody.radius > currentBody.atmosphereHeight ? 'SPACE FLIGHT' : 'ATMOSPHERIC FLIGHT');

      // Part mass and fuel are stored in metric tons; physics forces use SI units.
      // Convert the complete vehicle mass to kilograms before calculating acceleration.
      const totalMassKg = Math.max(100, parts.reduce((sum, p) => {
        const def = getPartDef(p.definitionId);
        return sum + (def ? def.mass + (p.fuel || 0) : 0);
      }, 0) * 1000);

      // Distance from body center
      const r = Math.sqrt(state.x * state.x + state.y * state.y);
      const altitude = r - currentBody.radius;

      // Gravity acceleration (Newton's law of universal gravitation)
      const gMag = (G * currentBody.mass) / (r * r);
      const axGrav = -gMag * (state.x / r);
      const ayGrav = -gMag * (state.y / r);

      // Thrust acceleration
      let axThrust = 0;
      let ayThrust = 0;
      const activeThrust = parts.reduce((sum, p) => {
        const def = getPartDef(p.definitionId);
        // Only engines assigned to the currently active stage can produce thrust.
        return sum + (def?.category === 'engines' && (p.stage || 1) <= state.activeStage ? (def?.thrust || 0) : 0);
      }, 0);

      // Consume propellant from fuel tanks while engines are firing.
      const firing = state.throttle > 0 && activeThrust > 0 && !state.landed;
      const totalFuel = parts.reduce((sum, p) => {
        const def = getPartDef(p.definitionId);
        return sum + (def?.category === 'fuel' ? Math.max(0, p.fuel || 0) : 0);
      }, 0);
      const effectiveThrust = totalFuel <= 0 ? 0 : activeThrust;


      if (firing && effectiveThrust > 0 && totalFuel > 0) {
        const thrustForce = effectiveThrust * 1000 * state.throttle; // Newtons
        const accel = thrustForce / totalMassKg;
        // Direction vector from rocket angle (pointing up relative to planet surface or heading)
        axThrust = Math.sin(state.angle) * accel;
        ayThrust = Math.cos(state.angle) * accel;
        updateThrusterSound(true, state.throttle);
      } else {
        updateThrusterSound(false, 0);
      }

      // Atmospheric drag
      let axDrag = 0;
      let ayDrag = 0;
      if (currentBody.atmosphereHeight > 0 && altitude < currentBody.atmosphereHeight) {
        const densityFactor = Math.max(0, 1 - altitude / currentBody.atmosphereHeight);
        const airDensity = currentBody.atmosphereDensity * densityFactor;
        const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
        const dragCoeff = state.parachuteDeployed ? 25.0 : 0.5;
        const dragForce = 0.5 * airDensity * speed * speed * dragCoeff;
        const dragAccel = dragForce / totalMassKg;
        if (speed > 0) {
          axDrag = -dragAccel * (state.vx / speed);
          ayDrag = -dragAccel * (state.vy / speed);
        }
      }

      // Total acceleration
      const ax = axGrav + axThrust + axDrag;
      const ay = ayGrav + ayThrust + ayDrag;

      // Integrate velocity and position
      let newVx = state.vx + ax * dt;
      let newVy = state.vy + ay * dt;
      let newX = state.x + newVx * dt;
      let newY = state.y + newVy * dt;

      // Surface collision check
      const newR = Math.sqrt(newX * newX + newY * newY);
      const newAlt = newR - currentBody.radius;

      let landed: boolean = state.landed;
      let crashed: boolean = state.crashed;

      if (newAlt <= 0) {
        const impactSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
        if (impactSpeed > 15 || !state.gearExtended) {
          crashed = true;
          playExplosionSound();
        } else {
          landed = true;
          newVx = 0;
          newVy = 0;
          // Snap to surface
          newX = (currentBody.radius) * (newX / newR);
          newY = (currentBody.radius) * (newY / newR);
          playSuccessSound();
        }
      }

      setFlightState(prev => {
        let fuelRemainingToBurn = firing ? Math.min(totalFuel, activeThrust * 1000 * state.throttle * dt / (Math.max(1, parts.reduce((sum, p) => { const d = getPartDef(p.definitionId); return sum + (d?.category === 'engines' ? (d.isp || 250) * 9.80665 : 0); }, 0)))) : 0;
        const updatedParts = parts.map(p => {
          const def = getPartDef(p.definitionId);
          if (def?.category !== 'fuel' || fuelRemainingToBurn <= 0) return p;
          const burn = Math.min(Math.max(0, p.fuel || 0), fuelRemainingToBurn);
          fuelRemainingToBurn -= burn;
          return { ...p, fuel: Math.max(0, (p.fuel || 0) - burn) };
        });
        if (firing && totalFuel > 0 && updatedParts.some((p, i) => p.fuel !== parts[i]?.fuel)) setPartsForFuel?.(updatedParts);
        return ({
        ...prev,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        landed,
        crashed,
        maxAltitude: Math.max(prev.maxAltitude, newAlt),
        maxSpeed: Math.max(prev.maxSpeed, Math.sqrt(newVx * newVx + newVy * newVy)),
        flightTime: prev.flightTime + dtReal
      }); });

      animationId = requestAnimationFrame(updatePhysics);
    };

    animationId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationId);
  }, [parts, setFlightState]);

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
      const state = stateRef.current;
      const currentBody = getBodyById(state.currentBodyId);

      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 150;
      const zoom = 0.5; // pixels per meter scaling for flight view

      // Flight telemetry overlay.
      ctx.save();
      ctx.fillStyle = 'rgba(3, 7, 18, 0.78)'; ctx.fillRect(14, 14, 205, 76);
      ctx.strokeStyle = 'rgba(34,211,238,.55)'; ctx.strokeRect(14, 14, 205, 76);
      ctx.fillStyle = '#67e8f9'; ctx.font = 'bold 12px monospace'; ctx.fillText('SPACEMAX / FLIGHT', 25, 33);
      ctx.fillStyle = '#e2e8f0'; ctx.font = '11px monospace'; ctx.fillText(launchStatus, 25, 51);
      ctx.fillText('STAGE ' + state.activeStage + '  THR ' + Math.round(state.throttle * 100) + '%', 25, 69);
      ctx.fillText('T+' + state.flightTime.toFixed(1) + 's', 25, 83);
      ctx.restore();

      // Draw Planet Horizon & Body
      ctx.save();
      ctx.translate(centerX, centerY);

      // Distance of rocket from planet center in meters
      const r = Math.sqrt(state.x * state.x + state.y * state.y);
      const rocketScreenX = (state.x / r) * (currentBody.radius * zoom) - (state.x / r) * (r * zoom);
      const rocketScreenY = -(state.y / r) * (currentBody.radius * zoom) + (state.y / r) * (r * zoom);

      // Planet circle
      ctx.beginPath();
      ctx.arc(0, (r * zoom), currentBody.radius * zoom, 0, Math.PI * 2);
      ctx.fillStyle = currentBody.color;
      ctx.fill();

      // Rocket rendering
      ctx.save();
      ctx.translate(0, - (r - currentBody.radius) * zoom - 100);
      ctx.rotate(state.angle);

      // Draw rocket body parts
      parts.forEach(p => {
        const def = getPartDef(p.definitionId);
        if (!def) return;
        const w = def.width * 8;
        const h = def.height * 8;
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(p.x * 8 - w / 2, -p.y * 8 - h, w, h, 4);
        ctx.fill();
        ctx.stroke();
      });

      // Thruster Flame Particle Effect
      if (state.throttle > 0 && !state.landed) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-10, 20);
        ctx.lineTo(0, 20 + Math.random() * 40 * state.throttle);
        ctx.lineTo(10, 20);
        ctx.fill();
      }

      ctx.restore();
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [parts]);

  return (
    <div className="relative flex-1 h-full bg-slate-950 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
