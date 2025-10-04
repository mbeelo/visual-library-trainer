import { TrainingList } from '../types';

export const communityLists: TrainingList[] = [
  {
    id: 'anatomy-essentials',
    name: 'Human Anatomy Essentials',
    description: 'Master the fundamentals of human anatomy with this focused collection of body parts and proportions. Perfect for figure drawing, character design, and realistic portraits.',
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
    description: 'Build your mechanical drawing skills with this comprehensive collection of vehicles. Great for concept artists, industrial designers, and anyone wanting to master hard surface drawing.',
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
    description: 'Explore the organic beauty of nature with this collection focused on natural forms, textures, and landscapes. Perfect for environmental artists, botanical illustrators, and plein air enthusiasts.',
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