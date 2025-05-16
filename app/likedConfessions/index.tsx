import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

type LikedConfession = {
  id: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  category?: string;
  mood?: 'happy' | 'sad' | 'funny' | 'angry';
};

export default function LikedConfessionsScreen() {
  const [likedConfessions, setLikedConfessions] = useState<LikedConfession[]>([
    {
      id: '1',
      content: "The library's third floor has become my second home",
      likes: 89,
      comments: 12,
      timestamp: '5h ago',
      category: 'Study',
      mood: 'funny',
    },
    // Add more liked confessions here
  ]);

  const renderLikedConfession = ({ item }: { item: LikedConfession }) => (
    <View style={styles.confessionCard}>
      <Text style={styles.confessionContent}>{item.content}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      
      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Ionicons name="heart" size={24} color="#FF4444" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </View>

        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
            <Text style={styles.emptyStateText}>No liked confessions yet</Text>
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
});