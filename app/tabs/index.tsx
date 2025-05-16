import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORIES, Category } from '../constants/categories';

// Update the Confession type
type Confession = {
  id: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  category?: string;
  mood?: 'happy' | 'sad' | 'funny' | 'angry';
  isAnonymous: boolean;  // This is required (no question mark)
  username?: string;     // This is optional (has question mark)
};

// Add more varied dummy data
const DUMMY_CONFESSIONS: Confession[] = [
  {
    id: '1',
    content: "I actually enjoy pineapple on pizza and I'm tired of pretending I don't",
    likes: 42,
    comments: 15,
    timestamp: '2h ago',
    category: 'Food',
    isAnonymous: true,
  },
  {
    id: '2',
    content: "Sometimes I pretend to be on my phone to avoid talking to people on campus",
    likes: 128,
    comments: 23,
    timestamp: '4h ago',
    category: 'Campus Life',
    isAnonymous: false,
    username: 'Student123',
  },
  {
    id: '3',
    content: "The library's third floor has become my second home. I've spent more time there this semester than in my actual room.",
    likes: 89,
    comments: 12,
    timestamp: '5h ago',
    category: 'Study',
    mood: 'funny',
    isAnonymous: true,
  },
];

export default function HomeScreen() {
  const [showNew, setShowNew] = useState(true);
  const [confessions, setConfessions] = useState(DUMMY_CONFESSIONS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Add filtered confessions
  const filteredConfessions = selectedCategory 
    ? confessions.filter(confession => confession.category === CATEGORIES.find(cat => cat.id === selectedCategory)?.name)
    : confessions;

  const toggleLike = (postId: string) => {
    setConfessions(prevConfessions =>
      prevConfessions.map(confession =>
        confession.id === postId
          ? {
              ...confession,
              likes: confession.isLiked ? confession.likes - 1 : confession.likes + 1,
              isLiked: !confession.isLiked,
            }
          : confession
      )
    );
  };

  const renderConfession = ({ item }: { item: Confession }) => (
    <Pressable 
      style={styles.postCard}
      onPress={() => {
        router.push(`./post/${item.id}`);
      }}
    >
      <View style={styles.postHeader}>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>
            {item.isAnonymous ? 'Anonymous' : item.username}
          </Text>
        </View>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Ionicons 
              name={CATEGORIES.find(cat => cat.name === item.category)?.icon || 'apps'} 
              size={14} 
              color="#007AFF" 
            />
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        )}
      </View>

      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleLike(item.id)}
        >
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={24}
            color={item.isLiked ? "#FF4444" : "#666"}
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="flag-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={24} 
        color={selectedCategory === item.id ? '#fff' : '#007AFF'} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>CampusConfessions</Text>
        <TouchableOpacity 
          onPress={() => router.push('./likedConfessions')}
          style={styles.likedButton}
        >
          <Ionicons name="heart-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.toggle, showNew && styles.activeToggle]}
          onPress={() => setShowNew(true)}
        >
          <Text style={[styles.toggleText, showNew && styles.activeToggleText]}>New</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, !showNew && styles.activeToggle]}
          onPress={() => setShowNew(false)}
        >
          <Text style={[styles.toggleText, !showNew && styles.activeToggleText]}>Popular</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredConfessions}
        renderItem={renderConfession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: -1,
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggle: {
    flex: 1,
    padding: 10,
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
  list: {
    padding: 15,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userBadge: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  userBadgeText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#007AFF',
    fontSize: 12,
    marginLeft: 4,
  },
  postContent: {
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
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  likedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});