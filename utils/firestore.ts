import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { PostInput } from '../types';

type PostData = {
  content: string;
  username: string;
  timestamp: string;
  category: string;
  isAnonymous: boolean;
  likes: number;
  userId: string;
  mood?: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
};

export const savePost = async (postInput: PostInput): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to post');
  }

  const post = {
    ...postInput,
    timestamp: new Date().toISOString(),
    likes: 0,
    commentCount: 0
  };

  try {
    const docRef = await addDoc(collection(db, "posts"), post);
    return docRef.id;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

export const createUser = async (userData: Omit<User, 'id'>) => {
  const userRef = doc(db, "users", auth.currentUser!.uid); // Use Auth UID as document ID
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date().toISOString()
  });
  return auth.currentUser!.uid;
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, userData, { merge: true });
};

// Save a comment (to a post)
export async function saveComment(postId: string, comment: {
  content: string;
  username: string;
  timestamp: string;
}) {
  const commentsRef = collection(db, "posts", postId, "comments");
  const docRef = await addDoc(commentsRef, comment);
  return docRef.id;
}

// Save a user (by userId)
export async function saveUser(userId: string, user: {
  username: string;
  email: string;
  createdAt: string;
}) {
  await setDoc(doc(db, "users", userId), user);
}

// Fetch posts
export async function fetchPosts() {
  const postsCol = collection(db, "posts");
  const q = query(postsCol, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Delete a post
export async function deletePost(postId: string) {
  await deleteDoc(doc(db, "posts", postId));
}

// Add to your existing firestore.ts file

export async function createNotification(notification: {
  userId: string;
  type: 'confession' | 'comment';
  postId: string;
  content: string;
  username: string;
}) {
  const notificationsRef = collection(db, "notifications");
  await addDoc(notificationsRef, {
    ...notification,
    timestamp: new Date().toISOString(),
    read: false,
  });
}

// Example usage:
// For confessions:
/*
await createNotification({
  userId: auth.currentUser?.uid ?? '',
  type: 'confession',
  postId: 'some-post-id',
  content: 'confession content',
  username: 'username'
});
*/

// For comments:
/*
await createNotification({
  userId: 'post-owner-id',
  type: 'comment',
  postId: 'some-post-id',
  content: 'comment content',
  username: 'commenter username'
});
*/