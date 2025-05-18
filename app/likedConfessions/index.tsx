import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, doc, DocumentData, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from "../../firebaseConfig";

// Update the type definition to match Firestore data
type LikedConfession = {
  id: string;
  content: string;
  likes: number;
  commentCount: number;
  timestamp: string;
  category?: string;
  mood?: 'happy' | 'sad' | 'funny' | 'angry';
  username: string;
  isAnonymous: boolean;
};

export default function LikedConfessionsScreen() {
  const [likedConfessions, setLikedConfessions] = useState<LikedConfession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace('/');
      return;
    }

    const likesQuery = query(
      collection(db, "likes"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(likesQuery, async (snapshot) => {
      const likedPosts = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const postId = docSnapshot.data().postId;
          const postRef = doc(db, "posts", postId);
          const postSnap = await getDoc(postRef);
          
          if (postSnap.exists()) {
            const postData = postSnap.data() as DocumentData;
            const likedPost: LikedConfession = {
              id: postSnap.id,
              content: postData.content || '',
              likes: postData.likes || 0,
              commentCount: postData.commentCount || 0,
              timestamp: postData.timestamp || '',
              category: postData.category,
              mood: postData.mood,
              username: postData.username || 'Anonymous',
              isAnonymous: postData.isAnonymous || false
            };
            return likedPost;
          }
          return null;
        })
      );

      // Filter out null values and set state
      setLikedConfessions(likedPosts.filter((post): post is LikedConfession => post !== null));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderLikedConfession = ({ item }: { item: LikedConfession }) => (
    <TouchableOpacity 
      style={styles.confessionCard}
      onPress={() => router.push(`/post/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.username}>
          {item.isAnonymous ? 'Anonymous' : item.username}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.confessionContent}>{item.content}</Text>
      
      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Ionicons name="heart" size={24} color="#FF4444" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </View>

        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{item.commentCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Liked Confessions</Text>
      </View>

      <FlatList
        data={likedConfessions}
        renderItem={renderLikedConfession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {loading ? 'Loading...' : 'No liked confessions yet'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  list: {
    padding: 15,
  },
  confessionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confessionContent: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
});