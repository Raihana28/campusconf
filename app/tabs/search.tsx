import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Animated,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { CATEGORIES } from '../constants/categories';

type SearchResult = {
  id: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  username?: string;
};

// Add dummy search results
const DUMMY_RESULTS: SearchResult[] = [
  {
    id: '1',
    content: "The cafeteria's new menu is surprisingly good! Never thought I'd say this.",
    category: 'Food',
    timestamp: '2h ago',
    likes: 45,
    comments: 12,
    isAnonymous: true
  },
  {
    id: '2',
    content: "Found a perfect study spot in the library's west wing. So peaceful!",
    category: 'Study',
    timestamp: '4h ago',
    likes: 89,
    comments: 23,
    isAnonymous: false,
    username: 'StudyBuddy'
  },
  {
    id: '3',
    content: "To the person who returned my lost ID card - you're an angel!",
    category: 'Campus Life',
    timestamp: '1d ago',
    likes: 156,
    comments: 34,
    isAnonymous: true
  },
  {
    id: '4',
    content: "The chemistry professor's jokes are so bad they're actually good now.",
    category: 'Academics',
    timestamp: '2d ago',
    likes: 234,
    comments: 45,
    isAnonymous: true
  },
  {
    id: '5',
    content: "Why is the campus WiFi always slower during exam week? 😭",
    category: 'Rants',
    timestamp: '3d ago',
    likes: 312,
    comments: 67,
    isAnonymous: false,
    username: 'TechieStudent'
  }
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Animated value for search bar
  const searchBarAnim = new Animated.Value(0);

  // Handle search
  const handleSearch = (query: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const filtered = DUMMY_RESULTS.filter(item => 
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsLoading(false);
      
      // Add to recent searches
      if (query.trim() && !recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    }, 500);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
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
          <Text style={styles.statsText}>{item.comments}</Text>
        </View>
        <Text style={styles.usernameText}>
          {item.isAnonymous ? 'Anonymous' : item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.searchContainer,
        { transform: [{ translateY: searchBarAnim }] }
      ]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search confessions..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

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
              onPress={() => setSelectedFilter(
                selectedFilter === category.id ? null : category.id
              )}
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
      </Animated.View>

      {searchQuery ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No results found</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentSearches.map((search, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.recentItem}
              onPress={() => {
                setSearchQuery(search);
                handleSearch(search);
              }}
            >
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  recentContainer: {
    padding: 15,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    color: '#007AFF',
    fontSize: 14,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
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
});