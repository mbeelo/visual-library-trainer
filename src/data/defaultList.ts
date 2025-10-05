import { TrainingList } from '../types';

export const defaultList: TrainingList = {
  id: 'default',
  name: 'Visual Basics',
  description: 'Master the fundamentals across all categories. Essential visual vocabulary that applies to everything you draw.',
  creator: 'AfterImage',
  categories: {
    'Basic Forms': ['cube', 'sphere', 'cylinder', 'cone', 'pyramid', 'torus'],
    'Everyday Objects': ['chair', 'table', 'lamp', 'cup', 'book', 'phone', 'bottle', 'apple'],
    'Simple Anatomy': ['eye', 'hand', 'foot', 'ear', 'nose', 'mouth'],
    'Nature Elements': ['tree', 'flower', 'cloud', 'rock', 'leaf', 'mountain'],
    'Basic Vehicles': ['car', 'bicycle', 'boat', 'airplane']
  }
};