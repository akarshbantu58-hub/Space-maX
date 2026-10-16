export type GameMode = 'build' | 'flight' | 'map' | 'presets' | 'missions' | 'guide';

export type PartCategory = 'engines' | 'fuel' | 'command' | 'aerodynamics' | 'structural' | 'utility';

export interface PartDefinition {
  id: string;
  name: string;
  category: PartCategory;
  mass: number; // in tons
  width: number; // in grid units (1 unit = 0.5 meters)
  height: number;
  cost: number;
  description: string;
  // Specific properties
  thrust?: number; // in kN
  isp?: number; // specific impulse in seconds
  fuelCapacity?: number; // in tons of fuel
  maxTemp?: number;
  isCommand?: boolean;
  isParachute?: boolean;
  isLandingLeg?: boolean;
  isSolarPanel?: boolean;
  isDecoupler?: boolean;
  isRCS?: boolean;
  iconName: string;
}

export interface PlacedPart {
  instanceId: string;
  definitionId: string;
  x: number; // Grid X relative to center (0)
  y: number; // Grid Y relative to bottom (0)
  rotation: number; // 0, 90, 180, 270
  fuel: number; // current fuel if fuel tank
  stage: number; // stage index assigned to this part
  color?: string;
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  parts: PlacedPart[];
  createdAt: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  radius: number; // meters
  mass: number; // kg
  distance: number; // distance from parent center in meters
  soi: number; // sphere of influence radius in meters
  orbitRadius?: number; // graphical orbit radius in map view
  orbitSpeed: number; // orbital angular velocity multiplier
  color: string;
  atmosphereHeight: number; // meters
  atmosphereDensity: number; // kg/m^3 at surface
  surfaceGravity: number; // m/s^2
  description: string;
  parentId?: string;
  moons?: string[];
  type: 'star' | 'planet' | 'moon';
}

export interface FlightState {
  x: number; // meters from parent body center
  y: number;
  vx: number; // m/s
  vy: number;
  angle: number; // radians (0 = pointing up / north relative to surface)
  angularVelocity: number;
  throttle: number; // 0 to 1
  rcs: boolean;
  sas: boolean; // stability augmentation system
  gearExtended: boolean;
  solarPanelsExtended: boolean;
  parachuteDeployed: boolean;
  parachuteCut: boolean;
  currentBodyId: string;
  timeWarp: number; // 1, 5, 10, 50, 100, 1000, 10000
  landed: boolean;
  crashed: boolean;
  destroyed: boolean;
  flightTime: number; // seconds
  maxAltitude: number;
  maxSpeed: number;
  activeStage: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
  check: (state: FlightState, maxAlt: number, maxSpd: number, visitedBodies: string[]) => boolean;
}
