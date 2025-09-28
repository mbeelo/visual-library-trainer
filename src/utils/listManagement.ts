import { TrainingList, CustomListData } from '../types';

export function generateListId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function parseItemsToCategories(rawItems: string): Record<string, string[]> {
  const lines = rawItems.split('\n').filter(line => line.trim());

  // Try to detect if user used categories (lines with colons)
  const hasCategories = lines.some(line => line.includes(':') && !line.startsWith(' '));

  if (hasCategories) {
    const categories: Record<string, string[]> = {};
    let currentCategory = 'Uncategorized';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.includes(':') && !trimmedLine.startsWith(' ')) {
        // This is a category header
        currentCategory = trimmedLine.replace(':', '').trim();
        if (!categories[currentCategory]) {
          categories[currentCategory] = [];
        }
      } else {
        // This is an item
        const item = trimmedLine.replace(/^[-*]\s*/, ''); // Remove bullet points
        if (!categories[currentCategory]) {
          categories[currentCategory] = [];
        }
        categories[currentCategory].push(item);
      }
    }

    return categories;
  } else {
    // No categories detected, put everything in a default category
    const items = lines.map(line => line.trim().replace(/^[-*]\s*/, '')).filter(item => item);
    return { 'Drawing Subjects': items };
  }
}

export function createCustomList(data: CustomListData): TrainingList {
  const categories = parseItemsToCategories(data.rawItems);

  return {
    id: generateListId(),
    name: data.name,
    creator: data.creator,
    categories,
    createdAt: new Date(),
    isCustom: true
  };
}

export function validateCustomListData(data: CustomListData): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('List name is required');
  }

  if (!data.creator.trim()) {
    errors.push('Creator name is required');
  }

  if (!data.rawItems.trim()) {
    errors.push('At least one item is required');
  } else {
    const lines = data.rawItems.split('\n').filter(line => line.trim());
    const items = lines.filter(line => !line.includes(':') || line.startsWith(' '));
    if (items.length === 0) {
      errors.push('At least one drawing subject is required');
    }
  }

  return errors;
}