import { Mission } from '../types';

export const MISSIONS_LIST: Mission[] = [
  {
    id: 'm_first_launch',
    title: 'First Liftoff',
    description: 'Launch your rocket above 1,000 meters altitude.',
    reward: 'Flight Wings Badge',
    completed: false,
    check: (_, maxAlt) => maxAlt >= 1000
  },
  {
    id: 'm_karman_line',
    title: 'To Space!',
    description: 'Cross the Kármán line at 50,000 meters altitude into the vacuum of space.',
    reward: 'Astronaut Wings Badge',
    completed: false,
    check: (_, maxAlt) => maxAlt >= 50000
  },
  {
    id: 'm_earth_orbit',
    title: 'Orbiting Earth',
    description: 'Reach a stable orbit around Earth (Altitude > 80km with orbital velocity).',
    reward: 'Orbital Master Badge',
    completed: false,
    check: (state, maxAlt) => maxAlt >= 80000 && !state.landed && state.currentBodyId === 'earth'
  },
  {
    id: 'm_moon_landing',
    title: 'One Small Step',
    description: 'Land safely on the Moon surface.',
    reward: 'Lunar Pioneer Badge',
    completed: false,
    check: (state) => state.landed && state.currentBodyId === 'moon'
  },
  {
    id: 'm_mars_arrival',
    title: 'The Red Planet',
    description: 'Reach the Sphere of Influence of Mars.',
    reward: 'Martian Explorer Badge',
    completed: false,
    check: (state) => state.currentBodyId === 'mars'
  }
];
