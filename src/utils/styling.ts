import { Rating } from '../types';

export const getRatingColor = (rating: Rating): string => {
  switch(rating) {
    case 'easy': return 'bg-green-100 text-green-700';
    case 'got-it': return 'bg-blue-100 text-blue-700';
    case 'struggled': return 'bg-orange-100 text-orange-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};