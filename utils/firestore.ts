import { addDoc, collection, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

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

export const savePost = async (postData: PostData): Promise<string> => {
  const docRef = await addDoc(collection(db, "posts"), postData);
  return docRef.id;
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