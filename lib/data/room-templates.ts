export interface RoomTemplate {
  name: string;
  color: string;
  tasks: string[];
}

export const roomTemplates: RoomTemplate[] = [
  { name: 'Living Room', color: '#22c55e', tasks: ['Vacuum', 'Dust shelves', 'Organize cushions', 'Water plants'] },
  { name: 'Kitchen', color: '#f59e0b', tasks: ['Wash dishes', 'Clean counter', 'Take out trash', 'Wipe table'] },
  { name: 'Bedroom', color: '#3b82f6', tasks: ['Make bed', 'Put away clothes', 'Change sheets'] },
  { name: 'Bathroom', color: '#06b6d4', tasks: ['Clean toilet', 'Wipe mirror', 'Refill soap', 'Scrub shower'] },
  { name: 'Home Office', color: '#8b5cf6', tasks: ['Organize desk', 'Empty trash', 'Wipe monitor', 'File documents'] },
  { name: 'Garage', color: '#6b7280', tasks: ['Organize tools', 'Sweep floor', 'Check oil', 'Sort recycling'] },
];
