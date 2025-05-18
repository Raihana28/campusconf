import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebaseConfig';
import { CATEGORIES } from '../constants/categories';

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

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Load recent searches from storage on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Handle search with Firestore
  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const postsRef = collection(db, 'posts');
      let baseQuery = query(postsRef);

      // Build query conditionally
      const queryConstraints = [];

      if (selectedFilter) {
        queryConstraints.push(where('category', '==', selectedFilter));
      }

      // Add sorting
      queryConstraints.push(
        sortBy === 'latest' 
          ? orderBy('timestamp', 'desc')
          : orderBy('likes', 'desc')
      );

      // Create final query with all constraints
      const finalQuery = query(postsRef, ...queryConstraints);

      const snapshot = await getDocs(finalQuery);
      const results = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SearchResult))
        .filter(post => 
          post.content.toLowerCase().includes(searchText.toLowerCase()) ||
          post.category.toLowerCase().includes(searchText.toLowerCase())
        );

      setSearchResults(results);

      // Save to recent searches
      if (searchText.trim()) {
        saveRecentSearch(searchText);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search confessions');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save recent searches to AsyncStorage
  const saveRecentSearch = async (query: string) => {
    if (!recentSearches.includes(query)) {
      const newSearches = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(newSearches);
      try {
        await AsyncStorage.setItem('recentSearches', JSON.stringify(newSearches));
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }
    }
  };

  // Load recent searches from AsyncStorage
  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Clear recent searches
  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
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

  return (
    <View style={styles.container}>
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

        {/* Sort options */}
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

        {/* Category filters */}
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
      </View>

      {/* Results or Recent Searches */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : searchQuery ? (
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
  loader: {
    marginTop: 20,
  },
});