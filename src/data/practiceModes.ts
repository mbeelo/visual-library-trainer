import { PracticeMode } from '../types';

export const practiceModes: PracticeMode[] = [
  {
    id: 'gesture',
    name: 'Gesture Drawing',
    description: 'Quick, loose sketches capturing movement and flow',
    icon: '🏃',
    suggestedDuration: 60
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Focus on basic shapes and structure',
    icon: '📐',
    suggestedDuration: 300
  },
  {
    id: 'detailed',
    name: 'Detailed Study',
    description: 'Careful observation and rendering',
    icon: '🔍',
    suggestedDuration: 900
  },
  {
    id: 'memory',
    name: 'Memory Drawing',
    description: 'Draw from recall without references',
    icon: '🧠',
    suggestedDuration: 180
  },
  {
    id: 'speed',
    name: 'Speed Sketching',
    description: 'Quick captures focusing on essentials',
    icon: '⚡',
    suggestedDuration: 30
  },
  {
    id: 'analytical',
    name: 'Analytical Drawing',
    description: 'Break down forms and relationships',
    icon: '🔬',
    suggestedDuration: 600
  }
];