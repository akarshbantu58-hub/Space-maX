import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PartDefinition, PlacedPart } from '../../types';
import { PARTS_CATALOG } from '../../data/partsCatalog';

interface SpaceSceneProps {
  parts: PlacedPart[];
  setParts: React.Dispatch<React.SetStateAction<PlacedPart[]>>;
  selectedPartDef: PartDefinition | null;
  setSelectedPartDef: (def: PartDefinition | null) => void;
}

const WORLDS = [
  { name: 'Earth', color: '#2679c8', kind: 'ocean', radius: 3.8 },
  { name: 'Moon', color: '#aaa79e', kind: 'rock', radius: 2.1 },
  { name: 'Mars', color: '#b65335', kind: 'desert', radius: 3.1 },
  { name: 'Mercury', color: '#9b9185', kind: 'rock', radius: 2.2 },
  { name: 'Venus', color: '#d8a96b', kind: 'cloud', radius: 3.5 },
  { name: 'Phobos', color: '#8b8178', kind: 'rock', radius: 1.1 },
  { name: 'Deimos', color: '#aaa092', kind: 'rock', radius: 0.9 },
  { name: 'Europa', color: '#c9bba4', kind: 'ice', radius: 1.6 },
  { name: 'Ganymede', color: '#9c9486', kind: 'ice', radius: 2.0 },
  { name: 'Callisto', color: '#77716a', kind: 'rock', radius: 1.8 },
  { name: 'Io', color: '#d6b45a', kind: 'lava', radius: 1.5 },
  { name: 'Titan', color: '#d79b48', kind: 'cloud', radius: 2.2 },
  { name: 'Enceladus', color: '#e0e7e8', kind: 'ice', radius: 1.1 },
  { name: 'Triton', color: '#b9b5c1', kind: 'ice', radius: 1.4 },
  { name: 'Pluto', color: '#b7a18c', kind: 'ice', radius: 1.5 },
  { name: 'Ceres', color: '#9e968d', kind: 'rock', radius: 1.3 },
  { name: 'Europa II', color: '#d4d0bd', kind: 'ice', radius: 1.2 },
  { name: 'Kepler-186f', color: '#397d6e', kind: 'ocean', radius: 3.0 },
  { name: 'Kepler-452b', color: '#997b52', kind: 'desert', radius: 3.6 },
  { name: 'Proxima b', color: '#7f684f', kind: 'rock', radius: 2.8 },
  { name: 'TOI-700 d', color: '#438f80', kind: 'ocean', radius: 2.9 },
  { name: 'Gliese 667 Cc', color: '#a8664a', kind: 'desert', radius: 3.2 },
  { name: 'Neptune', color: '#3974ce', kind: 'gas', radius: 3.5 },
  { name: 'Uranus', color: '#69b8c1', kind: 'gas', radius: 3.4 },
  { name: 'Saturn', color: '#d5b77c', kind: 'gas', radius: 3.6 },
  { name: 'Jupiter', color: '#c59a75', kind: 'gas', radius: 4.2 }
] as const;

function makeSurfaceTexture(color: string, kind: string, seed: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let n = seed >>> 0;
  const rand = () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; };
  if (kind === 'ocean') {
    ctx.fillStyle = '#184b37';
    for (let i = 0; i < 75; i++) {
      const x = rand() * canvas.width, y = rand() * canvas.height;
      ctx.beginPath(); ctx.ellipse(x, y, 18 + rand() * 100, 8 + rand() * 38, rand() * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(220,235,225,.72)';
    for (let i = 0; i < 110; i++) {
      ctx.beginPath(); ctx.ellipse(rand() * canvas.width, rand() * canvas.height, 8 + rand() * 70, 2 + rand() * 15, rand() * 2, 0, Math.PI * 2); ctx.fill();
    }
  } else if (kind === 'gas' || kind === 'cloud') {
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,245,220,.18)' : 'rgba(30,45,80,.13)';
      ctx.fillRect(0, rand() * canvas.height, canvas.width, 2 + rand() * 22);
    }
  } else {
    for (let i = 0; i < 2800; i++) {
      const x = rand() * canvas.width, y = rand() * canvas.height, r = 1 + rand() * (kind === 'ice' ? 4 : 8);
      ctx.fillStyle = rand() > .5 ? 'rgba(255,255,255,.16)' : 'rgba(15,12,10,.16)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 95; i++) {
      const x = rand() * canvas.width, y = rand() * canvas.height, r = 2 + rand() * 12;
      ctx.strokeStyle = 'rgba(20,15,12,.25)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makePartGeometry(def: PartDefinition): THREE.BufferGeometry {
  const id = def.id.toLowerCase();
  if (id.includes('nosecone')) return new THREE.ConeGeometry(Math.max(.28, def.width * .13), Math.max(.5, def.height * .32), 32);
  if (id.includes('engine')) return new THREE.CylinderGeometry(.2, Math.max(.4, def.width * .12), Math.max(.5, def.height * .22), 32, 1, false);
  if (id.includes('decoupler') || id.includes('separator')) return new THREE.CylinderGeometry(.58, .58, .18, 32);
  if (id.includes('fin')) {
    const shape = new THREE.Shape(); shape.moveTo(-.7, -.5); shape.lineTo(.55, -.5); shape.lineTo(.35, .55); shape.lineTo(-.7, -.5);
    return new THREE.ExtrudeGeometry(shape, { depth: .08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .04, bevelThickness: .04 });
  }
  if (id.includes('parachute')) return new THREE.SphereGeometry(.48, 24, 16, 0, Math.PI * 2, 0, Math.PI * .52);
  if (id.includes('solar')) return new THREE.BoxGeometry(1.05, .07, .65);
  if (id.includes('leg')) return new THREE.CylinderGeometry(.045, .08, 1.05, 8);
  if (id.includes('capsule') || id.includes('probe')) return new THREE.CylinderGeometry(.42, .58, .72, 32);
  if (id.includes('rcs')) return new THREE.BoxGeometry(.32, .28, .32);
  return new THREE.CylinderGeometry(Math.max(.35, def.width * .12), Math.max(.35, def.width * .12), Math.max(.35, def.height * .2), 32);
}

export const SpaceScene: React.FC<SpaceSceneProps> = ({ parts, setParts, selectedPartDef, setSelectedPartDef }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rocketGroupRef = useRef<THREE.Group | null>(null);
  const worldRef = useRef<THREE.Mesh | null>(null);
  const [worldName, setWorldName] = useState<string>('Earth');
  const [showWorlds, setShowWorlds] = useState(false);
  const [zoomLabel, setZoomLabel] = useState('ORBIT CAMERA');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030711');
    scene.fog = new THREE.FogExp2('#030711', .008);
    const camera = new THREE.PerspectiveCamera(42, host.clientWidth / Math.max(1, host.clientHeight), .1, 3000);
    camera.position.set(9, 8, 13);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .065;
    controls.enablePan = true;
    controls.minDistance = 4;
    controls.maxDistance = 65;
    controls.target.set(0, 3.5, 0);
    controls.addEventListener('change', () => setZoomLabel(camera.position.distanceTo(controls.target) < 8 ? 'DETAIL VIEW' : 'ORBIT CAMERA'));
    const ambient = new THREE.HemisphereLight('#b9d7ff', '#3b2a1e', 1.65); scene.add(ambient);
    const key = new THREE.DirectionalLight('#fff1d6', 4.2); key.position.set(-8, 16, 10); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
    const rim = new THREE.DirectionalLight('#399bff', 2.2); rim.position.set(8, 5, -10); scene.add(rim);

    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(2200 * 3);
    for (let i = 0; i < 2200; i++) {
      starPositions[i * 3] = (Math.random() - .5) * 900;
      starPositions[i * 3 + 1] = (Math.random() - .5) * 650;
      starPositions[i * 3 + 2] = (Math.random() - .5) * 900;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: '#d9eaff', size: .55, sizeAttenuation: true }));
    scene.add(stars);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: '#141d2b', roughness: .82, metalness: .18 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.06; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(100, 80, '#1c4a69', '#172637'); grid.position.y = -.045; scene.add(grid);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.5, .22, 64), new THREE.MeshStandardMaterial({ color: '#3d4857', metalness: .7, roughness: .32 }));
    pad.position.y = .05; pad.receiveShadow = true; pad.castShadow = true; scene.add(pad);
    const padRing = new THREE.Mesh(new THREE.TorusGeometry(3.18, .045, 8, 96), new THREE.MeshStandardMaterial({ color: '#00d9ff', emissive: '#005a7a', emissiveIntensity: 1.2, metalness: .7, roughness: .25 }));
    padRing.rotation.x = Math.PI / 2; padRing.position.y = .18; scene.add(padRing);
    for (let i = 0; i < 4; i++) {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(.25, 5 + (i % 2), .25), new THREE.MeshStandardMaterial({ color: '#536274', metalness: .75, roughness: .3 }));
      const a = i * Math.PI / 2 + Math.PI / 4; tower.position.set(Math.cos(a) * 2.6, 2.5, Math.sin(a) * 2.6); tower.castShadow = true; scene.add(tower);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.3, .18, .18), new THREE.MeshStandardMaterial({ color: '#718294', metalness: .65, roughness: .35 }));
      arm.position.set(Math.cos(a) * 2, 4.3, Math.sin(a) * 2); arm.rotation.y = -a; scene.add(arm);
    }

    const rocketGroup = new THREE.Group(); scene.add(rocketGroup);
    const worldGroup = new THREE.Group(); scene.add(worldGroup);
    const world = new THREE.Mesh(new THREE.SphereGeometry(9, 96, 64), new THREE.MeshStandardMaterial({ map: makeSurfaceTexture('#2679c8', 'ocean', 42), roughness: .78, metalness: .02 }));
    world.position.set(-16, 5, -32); worldGroup.add(world);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(9.18, 64, 48), new THREE.MeshBasicMaterial({ color: '#338dff', transparent: true, opacity: .13, side: THREE.BackSide }));
    atmosphere.position.copy(world.position); worldGroup.add(atmosphere);
    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer; controlsRef.current = controls; rocketGroupRef.current = rocketGroup; worldRef.current = world;

    let raf = 0;
    const animate = () => { raf = requestAnimationFrame(animate); controls.update(); world.rotation.y += .00035; renderer.render(scene, camera); };
    animate();
    const resize = () => { if (!host) return; camera.aspect = host.clientWidth / Math.max(1, host.clientHeight); camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); };
    const observer = new ResizeObserver(resize); observer.observe(host);
    return () => {
      cancelAnimationFrame(raf); observer.disconnect(); controls.dispose(); renderer.dispose();
      scene.traverse(obj => { const mesh = obj as THREE.Mesh; if (mesh.geometry) mesh.geometry.dispose(); if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose()); else if (mesh.material) mesh.material.dispose(); });
      renderer.domElement.remove(); sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = rocketGroupRef.current;
    if (!group) return;
    while (group.children.length) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child); child.geometry.dispose();
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose()); else if (child.material) child.material.dispose();
    }
    const sorted = [...parts].sort((a, b) => a.y - b.y);
    const minY = sorted.length ? Math.min(...sorted.map(p => p.y)) : 0;
    const maxY = sorted.length ? Math.max(...sorted.map(p => p.y)) : 10;
    const scale = Math.min(1, 10 / Math.max(8, maxY - minY + 4));
    sorted.forEach((part, index) => {
      const def = PARTS_CATALOG.find(p => p.id === part.definitionId);
      if (!def) return;
      const geometry = makePartGeometry(def);
      const material = new THREE.MeshStandardMaterial({
        color: part.color || (def.category === 'engines' ? '#697787' : def.category === 'fuel' ? '#d6dce4' : def.category === 'command' ? '#e7e0ce' : def.category === 'aerodynamics' ? '#c7d3df' : def.category === 'utility' ? '#5b9ab0' : '#7b8da2'),
        metalness: def.category === 'fuel' || def.category === 'engines' ? .78 : .42,
        roughness: def.category === 'command' ? .24 : .4
      });
      const mesh = new THREE.Mesh(geometry, material);
      const width = Math.max(.7, def.width * .23);
      const height = Math.max(.6, def.height * .19);
      mesh.scale.set(width, height, width);
      mesh.position.set(part.x * .23, 1 + (part.y - minY) * .26 * scale + index * .001, 0);
      mesh.rotation.y = (part.rotation || 0) * Math.PI / 180;
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.instanceId = part.instanceId;
      group.add(mesh);
    });
    if (!parts.length) {
      const sample = new THREE.Group();
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(.65, .65, 3.8, 48), new THREE.MeshStandardMaterial({ color: '#c9d4df', metalness: .72, roughness: .28 }));
      tank.position.y = 3.3; tank.castShadow = true; sample.add(tank);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(.65, 1.25, 48), new THREE.MeshStandardMaterial({ color: '#e6e9ed', metalness: .45, roughness: .25 }));
      nose.position.y = 5.8; nose.castShadow = true; sample.add(nose);
      const engine = new THREE.Mesh(new THREE.CylinderGeometry(.35, .58, .9, 32), new THREE.MeshStandardMaterial({ color: '#6c7c8c', metalness: .8, roughness: .3 }));
      engine.position.y = 1.1; sample.add(engine); group.add(sample);
    }
  }, [parts]);

  useEffect(() => {
    const body = WORLDS.find(w => w.name === worldName) || WORLDS[0];
    const old = worldRef.current;
    if (!old) return;
    const material = old.material as THREE.MeshStandardMaterial;
    const previous = material.map;
    material.map = makeSurfaceTexture(body.color, body.kind, WORLDS.indexOf(body) * 97 + 17);
    material.needsUpdate = true;
    old.scale.setScalar(body.radius / 3.8);
    old.geometry.dispose(); old.geometry = new THREE.SphereGeometry(9, 96, 64);
    if (previous) previous.dispose();
  }, [worldName]);

  const addSelectedPart = () => {
    if (!selectedPartDef) return;
    const nextY = parts.length ? Math.max(...parts.map(p => p.y)) + 2 : 0;
    const newPart: PlacedPart = {
      instanceId: 'part_' + Math.random().toString(36).slice(2, 11),
      definitionId: selectedPartDef.id, x: 0, y: nextY, rotation: 0,
      fuel: selectedPartDef.fuelCapacity || 0, stage: 1
    };
    setParts(prev => [...prev, newPart]);
    setSelectedPartDef(null);
  };

  return <div className="relative min-w-0 flex-1 overflow-hidden bg-[#030711]">
    <div ref={hostRef} className="absolute inset-0" aria-label="Interactive 3D rocket assembly scene" />
    <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-cyan-300/20 bg-slate-950/75 px-3 py-2 text-[10px] tracking-[.2em] text-cyan-100 shadow-lg backdrop-blur-md">
      <div className="font-semibold">SPACEMAX / 3D VAB</div><div className="mt-1 text-slate-400">{zoomLabel} · PBR LIGHTING</div>
    </div>
    <div className="absolute right-3 top-3 flex gap-2">
      <button onClick={() => setShowWorlds(v => !v)} className="rounded-xl border border-cyan-300/30 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-cyan-100 backdrop-blur-md">{worldName} ▾</button>
      <button onClick={() => { controlsRef.current?.reset(); }} className="rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-xs text-white backdrop-blur-md">Reset view</button>
    </div>
    {showWorlds && <div className="absolute right-3 top-14 z-20 grid max-h-[55%] w-56 grid-cols-2 gap-1 overflow-y-auto rounded-xl border border-cyan-300/25 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl">
      {WORLDS.map(body => <button key={body.name} onClick={() => { setWorldName(body.name); setShowWorlds(false); }} className={'rounded-lg border px-2 py-2 text-left text-xs ' + (worldName === body.name ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100' : 'border-white/10 text-slate-300')}>
        <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: body.color, boxShadow: '0 0 10px ' + body.color }} />{body.name}
      </button>)}
    </div>}
    {selectedPartDef && <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-cyan-300/30 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <div className="max-w-44"><div className="text-xs font-semibold text-white">{selectedPartDef.name}</div><div className="text-[10px] text-slate-400">Tap add to place on rocket</div></div>
      <button onClick={addSelectedPart} className="rounded-xl bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950">ADD PART</button>
    </div>}
    <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-[10px] text-slate-400 backdrop-blur-md">DRAG · ORBIT &nbsp; PINCH · ZOOM</div>
  </div>;
};
