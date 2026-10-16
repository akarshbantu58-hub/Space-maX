import { Blueprint } from '../types';

export const PRESET_BLUEPRINTS: Blueprint[] = [
  {
    id: 'preset_basic_hopper',
    name: 'Basic Suborbital Hopper',
    description: 'A simple single-stage rocket designed to reach upper atmosphere and demonstrate basic flight.',
    createdAt: Date.now(),
    parts: [
      { instanceId: 'p1', definitionId: 'command_capsule', x: 0, y: 6, rotation: 0, fuel: 0, stage: 2 },
      { instanceId: 'p2', definitionId: 'util_parachute', x: 0, y: 10, rotation: 0, fuel: 0, stage: 2 },
      { instanceId: 'p3', definitionId: 'fuel_medium', x: 0, y: 2, rotation: 0, fuel: 5, stage: 1 },
      { instanceId: 'p4', definitionId: 'engine_valiant', x: 0, y: 0, rotation: 0, fuel: 0, stage: 1 },
      { instanceId: 'p5', definitionId: 'util_landing_leg', x: -2, y: 1, rotation: 0, fuel: 0, stage: 1 },
      { instanceId: 'p6', definitionId: 'util_landing_leg', x: 2, y: 1, rotation: 0, fuel: 0, stage: 1 }
    ]
  },
  {
    id: 'preset_earth_orbit',
    name: 'Earth Orbital Rocket',
    description: 'A powerful two-stage rocket capable of achieving stable low Earth orbit (LEO).',
    createdAt: Date.now(),
    parts: [
      // Upper stage
      { instanceId: 'u1', definitionId: 'command_probe', x: 0, y: 14, rotation: 0, fuel: 0, stage: 3 },
      { instanceId: 'u2', definitionId: 'fuel_small', x: 0, y: 10, rotation: 0, fuel: 2, stage: 2 },
      { instanceId: 'u3', definitionId: 'engine_frontier', x: 0, y: 8, rotation: 0, fuel: 0, stage: 2 },
      { instanceId: 'u4', definitionId: 'struct_separator', x: 0, y: 7, rotation: 0, fuel: 0, stage: 2 },
      // First stage core
      { instanceId: 'c1', definitionId: 'fuel_huge', x: 0, y: -1, rotation: 0, fuel: 30, stage: 1 },
      { instanceId: 'c2', definitionId: 'engine_titan', x: 0, y: -5, rotation: 0, fuel: 0, stage: 1 },
      { instanceId: 'c3', definitionId: 'aero_nosecone_small', x: 0, y: 16, rotation: 0, fuel: 0, stage: 3 },
      // Side boosters
      { instanceId: 'b1', definitionId: 'fuel_large', x: -5, y: -1, rotation: 0, fuel: 12, stage: 1 },
      { instanceId: 'b2', definitionId: 'engine_hawk', x: -5, y: -5, rotation: 0, fuel: 0, stage: 1 },
      { instanceId: 'b3', definitionId: 'struct_decoupler', x: -3, y: -1, rotation: 0, fuel: 0, stage: 1 },
      { instanceId: 'b4', definitionId: 'fuel_large', x: 5, y: -1, rotation: 0, fuel: 12, stage: 1 },
      { instanceId: 'b5', definitionId: 'engine_hawk', x: 5, y: -5, rotation: 0, fuel: 0, stage: 1 },
      { instanceId: 'b6', definitionId: 'struct_decoupler', x: 3, y: -1, rotation: 0, fuel: 0, stage: 1 }
    ]
  },
  {
    id: 'preset_moon_mission',
    name: 'Lunar Landing Expedition',
    description: 'Heavy Saturn-style multi-stage rocket equipped with a dedicated lunar lander and return stage.',
    createdAt: Date.now(),
    parts: [
      { instanceId: 'm1', definitionId: 'command_capsule', x: 0, y: 16, rotation: 0, fuel: 0, stage: 4 },
      { instanceId: 'm2', definitionId: 'util_parachute', x: 0, y: 20, rotation: 0, fuel: 0, stage: 4 },
      { instanceId: 'm3', definitionId: 'fuel_medium', x: 0, y: 12, rotation: 0, fuel: 5, stage: 3 },
      { instanceId: 'm4', definitionId: 'engine_valiant', x: 0, y: 10, rotation: 0, fuel: 0, stage: 3 },
      { instanceId: 'm5', definitionId: 'struct_separator', x: 0, y: 9, rotation: 0, fuel: 0, stage: 3 },
      { instanceId: 'm6', definitionId: 'fuel_huge', x: 0, y: 1, rotation: 0, fuel: 30, stage: 2 },
      { instanceId: 'm7', definitionId: 'engine_frontier', x: 0, y: -1, rotation: 0, fuel: 0, stage: 2 },
      { instanceId: 'm8', definitionId: 'struct_separator', x: 0, y: -2, rotation: 0, fuel: 0, stage: 2 },
      { instanceId: 'm9', definitionId: 'fuel_huge', x: 0, y: -10, rotation: 0, fuel: 30, stage: 1 },
      { instanceId: 'm10', definitionId: 'engine_titan', x: 0, y: -14, rotation: 0, fuel: 0, stage: 1 }
    ]
  }
];
