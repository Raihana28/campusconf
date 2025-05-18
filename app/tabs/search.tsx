import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebaseConfig';


type SearchResult = {
  id: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  commentCount: number;
  isAnonymous: boolean;
  username?: string;
  userId: string;
  mood?: string;
};

const POPULAR_TOPICS = [
  "Dorm Life",
  "Exams",
  "Cafeteria",
  "Professors",
  "Clubs",
  "Relationships"
];

const POPULAR_DUMMY_POSTS = [
  {
    id: 'p1',
    content: "The cafeteria food is actually amazing this semester! Who's the new chef? 🍔🍟",
    category: "Cafeteria",
    timestamp: "1 hour ago",
    likes: 132,
    commentCount: 41,
    isAnonymous: false,
    username: "HungryStudent",
    userId: "userA",
    mood: "happy"
  },
  {
    id: 'p2',
    content: "Dorm WiFi went down again during my Zoom exam... anyone else? 😭",
    category: "Dorm Life",
    timestamp: "2 hours ago",
    likes: 98,
    commentCount: 27,
    isAnonymous: true,
    userId: "userB",
    mood: "sad"
  },
  {
    id: 'p3',
    content: "Shoutout to Prof. Smith for making calculus actually fun. Never thought I'd say that!",
    category: "Professors",
    timestamp: "3 hours ago",
    likes: 120,
    commentCount: 33,
    isAnonymous: false,
    username: "MathGeek",
    userId: "userC",
    mood: "happy"
  },
  {
    id: 'p4',
    content: "Our club just hit 200 members! So proud of everyone who joined the Coding Society 💻🎉",
    category: "Clubs",
    timestamp: "4 hours ago",
    likes: 150,
    commentCount: 50,
    isAnonymous: false,
    username: "ClubLeader",
    userId: "userD",
    mood: "excited"
  }
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handle search with Firestore
  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const filteredDummy = POPULAR_DUMMY_POSTS.filter((post: SearchResult) => 
        post.content.toLowerCase().includes(searchText.toLowerCase()) ||
        post.category.toLowerCase().includes(searchText.toLowerCase())
      );

      const postsRef = collection(db, 'posts');
      let baseQuery = query(postsRef);

      // Build query conditionally
      const queryConstraints = [];

      if (selectedFilter) {
        queryConstraints.push(where('category', '==', selectedFilter));
      }

      // Create final query with all constraints
      const finalQuery = query(postsRef, ...queryConstraints);

      const snapshot = await getDocs(finalQuery);
      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SearchResult))
        .filter((post: SearchResult) => 
          post.content.toLowerCase().includes(searchText.toLowerCase()) ||
          post.category.toLowerCase().includes(searchText.toLowerCase())
        );

      // Combine dummy and Firestore results
      const allResults = [...filteredDummy, ...results];
      
      setSearchResults(allResults);
    } catch (error) {
      Alert.alert('Error', 'Failed to search confessions');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => router.push(`../post/${item.id}`)}
    >
      <View style={styles.resultHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <Text style={styles.resultContent} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={styles.resultFooter}>
        <View style={styles.statsContainer}>
          <Ionicons name="heart-outline" size={16} color="#666" />
          <Text style={styles.statsText}>{item.likes}</Text>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.statsText}>{item.commentCount}</Text>
        </View>
        <Text style={styles.usernameText}>
          {item.isAnonymous ? 'Anonymous' : item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const MarqueeTopics = () => {
    const translateX = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;
    const topicWidth = 130; // Adjust to fit your chip width
    const totalWidth = POPULAR_TOPICS.length * topicWidth;

    useEffect(() => {
      const loop = () => {
        translateX.setValue(0);
        Animated.timing(translateX, {
          toValue: -totalWidth,
          duration: 9000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(loop);
      };
      loop();
      // No cleanup needed since animation is continuous
    }, [translateX, totalWidth]);

    // Duplicate topics for seamless loop
    const topics = [...POPULAR_TOPICS, ...POPULAR_TOPICS];

    return (
      <View style={{ height: 44, marginBottom: 10, overflow: 'hidden', width: '100%' }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            transform: [{ translateX }],
          }}
        >
          {topics.map((topic, idx) => (
            <View key={idx} style={styles.topicChip}>
              <Text style={styles.topicChipText}>{topic}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* --- Search Bar --- */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search confessions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        {/* REMOVE Sort options */}
        {/* 
        <View style={styles.sortContainer}>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'latest' && styles.sortButtonActive]}
            onPress={() => setSortBy('latest')}
          >
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={sortBy === 'latest' ? '#fff' : '#007AFF'} 
            />
            <Text style={[styles.sortText, sortBy === 'latest' && styles.sortTextActive]}>
              Latest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
            onPress={() => setSortBy('popular')}
          >
            <Ionicons 
              name="trending-up" 
              size={16} 
              color={sortBy === 'popular' ? '#fff' : '#007AFF'} 
            />
            <Text style={[styles.sortText, sortBy === 'popular' && styles.sortTextActive]}>
              Popular
            </Text>
          </TouchableOpacity>
        </View>
        */}
        {/* Category filters - REMOVE THIS BLOCK */}
        {/* 
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                selectedFilter === category.id && styles.filterChipSelected
              ]}
              onPress={() => {
                setSelectedFilter(selectedFilter === category.id ? null : category.id);
                if (searchQuery) handleSearch(searchQuery);
              }}
            >
              <Ionicons 
                name={category.icon} 
                size={16} 
                color={selectedFilter === category.id ? '#fff' : '#007AFF'} 
              />
              <Text style={[
                styles.filterText,
                selectedFilter === category.id && styles.filterTextSelected
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        */}
      </View>

      {/* --- Popular Topics Marquee --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Topics</Text>
      </View>
      <MarqueeTopics />

      {/* --- Popular Searches Section --- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Searches</Text>
      </View>
      <FlatList
        data={POPULAR_DUMMY_POSTS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.popularCard}
            onPress={() => router.push(`../post/${item.id}`)}
            activeOpacity={0.85}
          >
            <View style={styles.popularCardHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            <Text style={styles.popularCardContent} numberOfLines={4}>
              {item.content}
            </Text>
            <View style={styles.popularCardFooter}>
              <View style={styles.statsContainer}>
                <Ionicons name="heart-outline" size={16} color="#007AFF" />
                <Text style={styles.statsTextBlue}>{item.likes}</Text>
                <Ionicons name="chatbubble-outline" size={16} color="#007AFF" style={{ marginLeft: 10 }} />
                <Text style={styles.statsTextBlue}>{item.commentCount}</Text>
              </View>
              <Text style={styles.usernameText}>
                {item.isAnonymous ? 'Anonymous' : item.username}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 10 }}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 15,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sortTextActive: {
    color: '#fff',
  },
  filterContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextSelected: {
    color: '#fff',
  },
  resultsList: {
    padding: 15,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  resultContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 10,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
    marginRight: 12,
  },
  usernameText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 6,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  marqueeContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
    minHeight: 48,
  },
  topicChip: {
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    marginVertical: 4,
    justifyContent: 'center',
    minWidth: 110,
    alignItems: 'center',
  },
  topicChipText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  popularCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  popularCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  popularCardContent: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
    lineHeight: 22,
  },
  popularCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  statsTextBlue: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
    marginRight: 8,
  },
});