import { TimerPreset } from '../types';

export const timerPresets: TimerPreset[] = [
  {
    id: 'gesture-30',
    name: '30 seconds',
    duration: 30,
    description: 'Quick gesture sketches'
  },
  {
    id: 'gesture-60',
    name: '1 minute',
    duration: 60,
    description: 'Basic gesture drawing'
  },
  {
    id: 'gesture-120',
    name: '2 minutes',
    duration: 120,
    description: 'Detailed gestures'
  },
  {
    id: 'study-300',
    name: '5 minutes',
    duration: 300,
    description: 'Quick studies'
  },
  {
    id: 'study-600',
    name: '10 minutes',
    duration: 600,
    description: 'Focused practice'
  },
  {
    id: 'study-900',
    name: '15 minutes',
    duration: 900,
    description: 'Detailed studies'
  },
  {
    id: 'study-1800',
    name: '30 minutes',
    duration: 1800,
    description: 'Long-form practice'
  },
  {
    id: 'unlimited',
    name: 'No Timer',
    duration: 0,
    description: 'Practice at your own pace'
  }
];