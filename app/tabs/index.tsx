import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from "../../firebaseConfig";

// Replace with your actual username or userId logic
const CURRENT_USERNAME = "YourUserName"; // Or use userId if you store it

type Post = {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  category: string;
  isAnonymous: boolean;
  likes: number;
  userId: string; // Make sure this is included
};

export default function PostsTabScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showMyConfessions, setShowMyConfessions] = useState(false);
  const currentUserId = "user123"; // Make sure this matches the userId you use when posting

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            content: data.content ?? "",
            username: data.username ?? "Anonymous",
            timestamp: data.timestamp ?? "",
            category: data.category ?? "",
            isAnonymous: data.isAnonymous ?? true,
            likes: data.likes ?? 0,
            userId: data.userId ?? "",
          };
        })
      );
    });
    return unsubscribe;
  }, []);

  // Filter posts based on userId for My Confessions
  const filteredPosts = showMyConfessions
    ? posts.filter(post => post.userId === currentUserId)
    : posts;

  return (
    <View style={styles.container}>
      {/* Add the title bar back */}
      <View style={styles.titleBar}>
        <Text style={styles.title}>CampusConfessions</Text>
        <TouchableOpacity 
          onPress={() => router.push('/likedConfessions')}
          style={styles.likedButton}
        >
          <Ionicons name="heart-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.toggle, !showMyConfessions && styles.activeToggle]}
          onPress={() => setShowMyConfessions(false)}
        >
          <Text style={[styles.toggleText, !showMyConfessions && styles.activeToggleText]}>New</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, showMyConfessions && styles.activeToggle]}
          onPress={() => setShowMyConfessions(true)}
        >
          <Text style={[styles.toggleText, showMyConfessions && styles.activeToggleText]}>My Confessions</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/post/${item.id}`)}
            style={styles.postCard}
          >
            <View style={styles.userBadge}>
              <Text style={styles.username}>
                {item.isAnonymous ? "Anonymous" : item.username}
              </Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            <View style={styles.footer}>
              <Text style={styles.stats}>❤️ {item.likes}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Add these new styles

git config --global user.email ""
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  likedButton: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggle: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  activeToggle: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  activeToggleText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    backgroundColor: '#f0f8ff',
    color: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    fontWeight: 'bold',
  },
  category: {
    backgroundColor: '#f0f8ff',
    color: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stats: {
    color: '#666',
  },
  timestamp: {
    color: '#666',
  },
});