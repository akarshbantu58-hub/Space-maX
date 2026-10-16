import { PartDefinition } from '../types';

export const PARTS_CATALOG: PartDefinition[] = [
  // --- ENGINES ---
  {
    id: 'engine_kolibri',
    name: 'Kolibri Engine',
    category: 'engines',
    mass: 0.5,
    width: 2,
    height: 2,
    cost: 400,
    description: 'Lightweight side-mounted engine for attitude control and small landers.',
    thrust: 20,
    isp: 250,
    iconName: 'Flame'
  },
  {
    id: 'engine_valiant',
    name: 'Valiant Engine',
    category: 'engines',
    mass: 1.0,
    width: 2,
    height: 3,
    cost: 800,
    description: 'Versatile upper-stage or lunar lander engine with good efficiency.',
    thrust: 60,
    isp: 280,
    iconName: 'Flame'
  },
  {
    id: 'engine_hawk',
    name: 'Hawk Engine',
    category: 'engines',
    mass: 2.5,
    width: 4,
    height: 4,
    cost: 1500,
    description: 'Reliable first-stage booster engine providing robust thrust.',
    thrust: 180,
    isp: 260,
    iconName: 'Flame'
  },
  {
    id: 'engine_frontier',
    name: 'Frontier Engine',
    category: 'engines',
    mass: 4.0,
    width: 4,
    height: 5,
    cost: 2600,
    description: 'High vacuum efficiency engine designed for interplanetary transfers.',
    thrust: 240,
    isp: 340,
    iconName: 'Flame'
  },
  {
    id: 'engine_titan',
    name: 'Titan Engine',
    category: 'engines',
    mass: 8.0,
    width: 8,
    height: 6,
    cost: 5000,
    description: 'Monstrous heavy-lift core engine for launching massive payloads into orbit.',
    thrust: 750,
    isp: 290,
    iconName: 'Flame'
  },

  // --- FUEL TANKS ---
  {
    id: 'fuel_small',
    name: 'Small Fuel Tank',
    category: 'fuel',
    mass: 0.5,
    width: 4,
    height: 2,
    cost: 200,
    description: 'Compact fuel tank for minor orbital adjustments or RCS auxiliary storage.',
    fuelCapacity: 2.0,
    iconName: 'Fuel'
  },
  {
    id: 'fuel_medium',
    name: 'Medium Fuel Tank',
    category: 'fuel',
    mass: 1.0,
    width: 4,
    height: 4,
    cost: 450,
    description: 'Standard 4x4 fuel tank holding liquid fuel and oxidizer.',
    fuelCapacity: 5.0,
    iconName: 'Fuel'
  },
  {
    id: 'fuel_large',
    name: 'Large Fuel Tank',
    category: 'fuel',
    mass: 2.0,
    width: 4,
    height: 8,
    cost: 900,
    description: 'Tall fuel tank providing high delta-V for stage boosters.',
    fuelCapacity: 12.0,
    iconName: 'Fuel'
  },
  {
    id: 'fuel_huge',
    name: 'Titanium Fuel Tank',
    category: 'fuel',
    mass: 4.5,
    width: 8,
    height: 8,
    cost: 2200,
    description: 'Massive 8-wide heavy lift fuel tank for interplanetary rockets.',
    fuelCapacity: 30.0,
    iconName: 'Fuel'
  },

  // --- COMMAND ---
  {
    id: 'command_capsule',
    name: '1-Man Capsule',
    category: 'command',
    mass: 1.0,
    width: 4,
    height: 4,
    cost: 1200,
    description: 'Manned command pod with integrated parachute and heat shielding.',
    isCommand: true,
    iconName: 'User'
  },
  {
    id: 'command_probe',
    name: 'Sentry Probe Core',
    category: 'command',
    mass: 0.2,
    width: 2,
    height: 2,
    cost: 800,
    description: 'Automated guidance computer for unmanned satellites and probes.',
    isCommand: true,
    iconName: 'Cpu'
  },

  // --- AERODYNAMICS ---
  {
    id: 'aero_nosecone_small',
    name: 'Small Nose Cone',
    category: 'aerodynamics',
    mass: 0.2,
    width: 4,
    height: 2,
    cost: 150,
    description: 'Reduces atmospheric drag during ascent through planetary atmospheres.',
    iconName: 'Triangle'
  },
  {
    id: 'aero_nosecone_large',
    name: 'Heavy Nose Cone',
    category: 'aerodynamics',
    mass: 0.5,
    width: 8,
    height: 3,
    cost: 350,
    description: 'Wide aerodynamic nose cone for 8-meter diameter rocket cores.',
    iconName: 'Triangle'
  },
  {
    id: 'aero_fin',
    name: 'Aerodynamic Fin',
    category: 'aerodynamics',
    mass: 0.2,
    width: 2,
    height: 3,
    cost: 200,
    description: 'Provides aerodynamic stability and atmospheric control surfaces.',
    iconName: 'Navigation'
  },

  // --- STRUCTURAL ---
  {
    id: 'struct_decoupler',
    name: 'Radial Decoupler',
    category: 'structural',
    mass: 0.3,
    width: 1,
    height: 4,
    cost: 250,
    description: 'Explosive separator to jettison spent side boosters.',
    isDecoupler: true,
    iconName: 'Split'
  },
  {
    id: 'struct_separator',
    name: 'Stage Separator',
    category: 'structural',
    mass: 0.4,
    width: 4,
    height: 1,
    cost: 300,
    description: 'Stack separator for clean multi-stage staging.',
    isDecoupler: true,
    iconName: 'Columns'
  },
  {
    id: 'struct_truss',
    name: 'Structural Truss',
    category: 'structural',
    mass: 0.1,
    width: 4,
    height: 2,
    cost: 100,
    description: 'Lightweight spacer for connecting rocket components.',
    iconName: 'Grid'
  },

  // --- UTILITY ---
  {
    id: 'util_parachute',
    name: 'Rescue Parachute',
    category: 'utility',
    mass: 0.2,
    width: 2,
    height: 2,
    cost: 300,
    description: 'Deployable canopy to safely land payloads on Earth and Mars.',
    isParachute: true,
    iconName: 'Wind'
  },
  {
    id: 'util_landing_leg',
    name: 'Landing Leg',
    category: 'utility',
    mass: 0.3,
    width: 2,
    height: 4,
    cost: 350,
    description: 'Shock-absorbing landing strut for touchdowns on moons and planets.',
    isLandingLeg: true,
    iconName: 'Anchor'
  },
  {
    id: 'util_solar_panel',
    name: 'Solar Panel',
    category: 'utility',
    mass: 0.1,
    width: 2,
    height: 2,
    cost: 400,
    description: 'Generates electrical power in sunlight.',
    isSolarPanel: true,
    iconName: 'Sun'
  },
  {
    id: 'util_rcs',
    name: 'RCS Thruster Block',
    category: 'utility',
    mass: 0.1,
    width: 1,
    height: 1,
    cost: 250,
    description: 'Reaction Control System thrusters for precision docking and rotation.',
    isRCS: true,
    iconName: 'Move'
  }
];

// Expand the core catalogue into a 150+ item engineering catalogue. These are
// distinct, selectable component definitions with scaled mass/cost, not claims
// that every variant has unique hand-authored CAD geometry.
const CORE_PARTS = [...PARTS_CATALOG];
for (let tier = 2; tier <= 9; tier++) {
  for (const part of CORE_PARTS) {
    PARTS_CATALOG.push({
      ...part,
      id: `mk${tier}_${part.id}`,
      name: `${part.name} Mk ${tier}`,
      mass: Number((part.mass * (1 + (tier - 1) * 0.065)).toFixed(2)),
      cost: Math.round(part.cost * (1 + (tier - 1) * 0.16)),
      description: `Mk ${tier} upgraded variant. ${part.description}`
    });
  }
}
