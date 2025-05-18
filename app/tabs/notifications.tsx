import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig';

// Update the Notification type to include more notification types
type Notification = {
  id: string;
  type: 'confession' | 'comment' | 'like' | 'mention'; // Added more types
  postId: string;
  content: string;
  username: string;
  timestamp: string;
  read: boolean;
};

// Dummy notifications for testing
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    postId: 'post123',
    content: 'Your confession about campus food received a like',
    username: 'Sarah',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    read: false
  },
  {
    id: '2',
    type: 'comment',
    postId: 'post456',
    content: 'I totally agree with you! The library should extend its hours.',
    username: 'Mike',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: true
  },
  {
    id: '3',
    type: 'mention',
    postId: 'post789',
    content: '@you should check out this confession about the new campus policy!',
    username: 'Alex',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    read: false
  },
  {
    id: '4',
    type: 'confession',
    postId: 'post101',
    content: 'New trending confession in your followed category: "Campus Life"',
    username: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: true
  },
  {
    id: '5',
    type: 'like',
    postId: 'post202',
    content: 'Your confession about parking issues is getting popular! 5 new likes',
    username: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: true
  }
];

const DUMMY_POSTS = {
  'post123': {
    id: 'post123',
    content: 'The campus food in the main cafeteria needs serious improvement. Who else agrees?',
    username: 'YourUsername',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    likes: 5,
    comments: [],
    category: 'Campus Life',
    isAnonymous: false
  },
  'post456': {
    id: 'post456',
    content: 'Library hours are too short during exam season. We need 24/7 access!',
    username: 'YourUsername',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likes: 3,
    comments: [
      {
        id: 'comment1',
        content: 'I totally agree with you! The library should extend its hours.',
        username: 'Mike',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      }
    ],
    category: 'Academics',
    isAnonymous: false
  },
  'post789': {
    id: 'post789',
    content: 'New policy about online classes is actually pretty good!',
    username: 'Alex',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    likes: 2,
    comments: [],
    category: 'Campus Policy',
    isAnonymous: false
  },
  'post101': {
    id: 'post101',
    content: 'The new student center is amazing! Finally a good place to hang out between classes.',
    username: 'Emma',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 10,
    comments: [],
    category: 'Campus Life',
    isAnonymous: false
  },
  'post202': {
    id: 'post202',
    content: 'Parking situation is getting worse every semester. We need more spaces!',
    username: 'YourUsername',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likes: 15,
    comments: [],
    category: 'Campus Life',
    isAnonymous: false
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    // Comment out or remove the Firestore code temporarily
    setNotifications(DUMMY_NOTIFICATIONS);
    
    // Return empty cleanup function
    return () => {};
  }, []);

  // Add helper functions to handle notification types
  const getNotificationIcon = (type: Notification['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'confession':
        return 'chatbox-outline';
      case 'comment':
        return 'chatbubble-outline';
      case 'like':
        return 'heart-outline';
      case 'mention':
        return 'at-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationTitle = (type: Notification['type']): string => {
    switch (type) {
      case 'confession':
        return 'New Confession';
      case 'comment':
        return 'New Comment on your confession';
      case 'like':
        return 'Liked your confession';
      case 'mention':
        return 'Mentioned you in a comment';
      default:
        return 'New Notification';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => router.push(`/post/${item.postId}`)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons 
          name={getNotificationIcon(item.type)} 
          size={24} 
          color="#007AFF" 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationHeader}>
          {getNotificationTitle(item.type)}
        </Text>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.content} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={48} color="#666" />
          <Text style={styles.emptyStateText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});