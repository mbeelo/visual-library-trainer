import { TrainingList } from '../types';

export const communityLists: TrainingList[] = [
  {
    id: 'character-essentials',
    name: 'Character Essentials',
    description: 'Human elements that bring art to life. Perfect for figure artists, animators, and character designers.',
    creator: 'AfterImage',
    isCustom: false,
    categories: {
      'Facial Features': ['eye', 'nose', 'mouth', 'ear', 'eyebrow', 'chin', 'cheek'],
      'Hands & Gestures': ['open hand', 'fist', 'pointing finger', 'thumbs up', 'peace sign', 'grasping hand'],
      'Body Parts': ['head', 'torso', 'arm', 'leg', 'shoulder', 'hip', 'knee', 'elbow'],
      'Expressions': ['smile', 'frown', 'surprise', 'anger', 'sadness', 'joy'],
      'Poses': ['standing figure', 'sitting figure', 'walking figure', 'running figure', 'jumping figure']
    }
  },
  {
    id: 'designers-toolkit',
    name: "Designer's Toolkit",
    description: 'Objects and elements for world-building. Essential for concept artists, game designers, and illustrators.',
    creator: 'AfterImage',
    isCustom: false,
    categories: {
      'Vehicles': ['sports car', 'motorcycle', 'truck', 'helicopter', 'spaceship', 'tank'],
      'Architecture': ['house', 'skyscraper', 'bridge', 'castle', 'tower', 'barn'],
      'Weapons & Tools': ['sword', 'gun', 'hammer', 'wrench', 'bow and arrow', 'shield'],
      'Furniture': ['chair', 'desk', 'bed', 'sofa', 'bookshelf', 'dresser'],
      'Tech & Props': ['computer', 'robot', 'machine', 'engine', 'gear', 'control panel']
    }
  }
];