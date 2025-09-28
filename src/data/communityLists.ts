import { TrainingList } from '../types';

export const communityLists: TrainingList[] = [
  {
    id: 'anatomy-essentials',
    name: 'Human Anatomy Essentials',
    creator: '@artbyjenna',
    isCustom: true,
    categories: {
      'Head & Face': ['eye', 'nose', 'mouth', 'ear', 'skull', 'jaw', 'cheek', 'forehead', 'chin', 'eyebrow'],
      'Torso': ['ribcage', 'spine', 'shoulder', 'chest', 'abs', 'back muscles', 'collarbone', 'neck', 'throat'],
      'Arms': ['bicep', 'forearm', 'elbow', 'wrist', 'hand', 'fingers', 'thumb', 'palm', 'knuckles'],
      'Legs': ['thigh', 'knee', 'calf', 'ankle', 'foot', 'toes', 'hip', 'glutes', 'shin']
    }
  },
  {
    id: 'vehicles-fundamentals',
    name: 'Vehicle Design Fundamentals',
    creator: '@conceptcarl',
    isCustom: true,
    categories: {
      'Cars': ['sports car', 'sedan', 'SUV', 'hatchback', 'convertible', 'coupe', 'station wagon'],
      'Motorcycles': ['sport bike', 'cruiser', 'dirt bike', 'scooter', 'chopper', 'touring bike'],
      'Trucks': ['pickup truck', 'semi truck', 'delivery van', 'fire truck', 'garbage truck'],
      'Other': ['bicycle', 'bus', 'train', 'airplane', 'helicopter', 'boat', 'tank']
    }
  },
  {
    id: 'nature-forms',
    name: 'Natural Forms & Textures',
    creator: '@wildsketchbook',
    isCustom: true,
    categories: {
      'Trees': ['oak tree', 'pine tree', 'willow tree', 'palm tree', 'cherry blossom', 'dead tree', 'tree trunk', 'tree roots'],
      'Flowers': ['rose', 'sunflower', 'tulip', 'lily', 'daisy', 'orchid', 'poppy', 'dandelion'],
      'Animals': ['cat', 'dog', 'bird', 'fish', 'butterfly', 'deer', 'rabbit', 'squirrel', 'wolf', 'bear'],
      'Landscapes': ['mountain', 'valley', 'river', 'lake', 'forest', 'desert', 'cliff', 'waterfall', 'clouds', 'rocks']
    }
  }
];