import { Ionicons } from '@expo/vector-icons';

export type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;  // This ensures icon names are valid Ionicons
};

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Campus Life', icon: 'school-outline' },
  { id: '2', name: 'Love', icon: 'heart-outline' },
  { id: '3', name: 'Food', icon: 'restaurant-outline' },
  { id: '4', name: 'Study', icon: 'book-outline' },
];