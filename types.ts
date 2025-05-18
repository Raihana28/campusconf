export type PostInput = {
  content: string;
  username: string;
  category: string;
  isAnonymous: boolean;
  userId: string;
  mood?: string;
};

export type Post = {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  category: string;
  isAnonymous: boolean;
  likes: number;
  userId: string;
  mood?: string;
  commentCount?: number;
};