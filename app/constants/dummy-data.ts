export type SearchResult = {
  id: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  username?: string;
};

export const DUMMY_RESULTS: SearchResult[] = [
  {
    id: '1',
    content: "The cafeteria's new menu is surprisingly good! Never thought I'd say this.",
    category: 'Food',
    timestamp: '2h ago',
    likes: 45,
    comments: 12,
    isAnonymous: true
  },
  {
    id: '2',
    content: "Found a perfect study spot in the library's west wing. So peaceful!",
    category: 'Study',
    timestamp: '4h ago',
    likes: 89,
    comments: 23,
    isAnonymous: false,
    username: 'StudyBuddy'
  },
  // ...existing dummy data...
];