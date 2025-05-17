import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";

const currentUserId = "user123"; // Replace with your actual user ID from auth

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("Anonymous");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        if (firebaseUser.isAnonymous) {
          setDisplayName("Anonymous");
        } else {
          // Try to get user's name from Firestore, fallback to email or displayName
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists() && userDoc.data().username) {
            setDisplayName(userDoc.data().username);
          } else if (firebaseUser.displayName) {
            setDisplayName(firebaseUser.displayName);
          } else if (firebaseUser.email) {
            setDisplayName(firebaseUser.email.split("@")[0]);
          } else {
            setDisplayName("User");
          }
        }
      } else {
        setDisplayName("Anonymous");
      }
    });
    return unsubscribe;
  }, []);

  return { user, displayName };
}