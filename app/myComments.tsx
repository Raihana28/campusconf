import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function MyCommentsScreen() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      let allComments: any[] = [];
      const postsSnap = await getDocs(collection(db, "posts"));
      const promises = postsSnap.docs.map(async (postDoc) => {
        if (!auth.currentUser) return; // TypeScript safety check
        const commentsSnap = await getDocs(
          query(
            collection(db, "posts", postDoc.id, "comments"),
            where("userId", "==", auth.currentUser.uid)
          )
        );
        commentsSnap.forEach(doc => {
          allComments.push({ ...doc.data(), id: doc.id, postId: postDoc.id });
        });
      });
      await Promise.all(promises);
      if (isMounted) {
        setComments(allComments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        setLoading(false);
      }
    };
    fetchComments();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: '#888', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!auth.currentUser) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You must be signed in to view your comments.</Text>
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No Comments Yet</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/tabs')}>
          <Text style={styles.buttonText}>Start Commenting</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.commentCard}
          onPress={() => router.push(`/post/${item.postId}`)}
          activeOpacity={0.8}
        >
          <View style={styles.commentHeader}>
            <Text style={styles.commentPostId}>
              Post: <Text style={styles.commentPostIdValue}>{item.postId}</Text>
            </Text>
            <Text style={styles.commentDate}>
              {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
            </Text>
          </View>
          <Text style={styles.commentContent}>{item.content}</Text>
        </TouchableOpacity>
      )}
      ListHeaderComponent={
        <Text style={styles.sectionTitle}>My Comments</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#f8f9fb' },
  emptyText: { fontSize: 18, color: '#666', marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 20, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  commentCard: {
    backgroundColor: '#fff',
    marginBottom: 14,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentPostId: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  commentPostIdValue: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#bbb',
  },
  commentContent: {
    fontSize: 16,
    color: '#222',
    lineHeight: 22,
  },
});