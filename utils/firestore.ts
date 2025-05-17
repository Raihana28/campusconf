import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

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
  email: string;
  username: string;
  createdAt: string;
  bio?: string; // Add bio as an optional property
};

export const savePost = async (postData: PostData): Promise<string> => {
  const docRef = await addDoc(collection(db, "posts"), postData);
  return docRef.id;
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