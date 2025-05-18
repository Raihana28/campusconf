import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from "../../firebaseConfig";
import { getUser, savePost } from "../../utils/firestore"; // Add getUser to imports

// Add this helper function
const getMoodIcon = (mood: string): keyof typeof Ionicons.glyphMap => {
  switch (mood) {
    case 'happy':
      return 'happy-outline';
    case 'sad':
      return 'sad-outline';
    case 'angry':
      return 'flame-outline';
    case 'funny':
      return 'happy';
    default:
      return 'happy-outline';
  }
};

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
  mood?: string; // Optional mood property
  commentCount?: number; // Optional comment count
  shareCount?: number; // Optional share count
  hasLiked?: boolean; // Optional hasLiked property
};

export default function PostsTabScreen() {
  const router = useRouter();
  const { showMyConfessions: showMyConfessionsParam } = useLocalSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showMyConfessions, setShowMyConfessions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('latest'); // Replace categories section with trending
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = await Promise.all(snapshot.docs.map(async (document) => {
        const data = document.data();
        // Fix: Use doc() from Firestore, not from the snapshot
        const likeRef = doc(db, "likes", `${document.id}_${currentUserId}`);
        const likeDoc = await getDoc(likeRef);
        
        return {
          id: document.id,
          content: data.content ?? "",
          username: data.username ?? "Anonymous",
          timestamp: data.timestamp ?? "",
          category: data.category ?? "",
          isAnonymous: data.isAnonymous ?? true,
          likes: data.likes ?? 0,
          userId: data.userId ?? "",
          mood: data.mood,
          commentCount: data.commentCount ?? 0,
          shareCount: data.shareCount ?? 0,
          hasLiked: likeDoc.exists(),
        };
      }));
      setPosts(postsData);
    });
    return unsubscribe;
  }, [currentUserId]);

  useEffect(() => {
    if (showMyConfessionsParam === 'true') {
      setShowMyConfessions(true);
    }
  }, [showMyConfessionsParam]);

  // Filter posts based on userId for My Confessions
  const filteredPosts = showMyConfessions
    ? posts.filter(post => post.userId === currentUserId)
    : posts;

  // Add this sorting function
  const sortedPosts = filteredPosts.sort((a, b) => {
    if (filterType === 'trending') {
      return (b.likes || 0) - (a.likes || 0);
    }
    // default to latest
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Add refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    await onSnapshot(q, (snapshot) => {
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
            mood: data.mood,
            commentCount: data.commentCount,
            shareCount: data.shareCount,
            hasLiked: data.hasLiked ?? false,
          };
        })
      );
    });
    setRefreshing(false);
  };

  // Add this function to handle likes
  const handleLike = async (post: Post) => {
    try {
      const postRef = doc(db, "posts", post.id);
      const likeRef = doc(db, "likes", `${post.id}_${currentUserId}`);

      // Optimistically update UI
      setPosts(currentPosts => 
        currentPosts.map(p => {
          if (p.id === post.id) {
            return {
              ...p,
              likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
              hasLiked: !p.hasLiked
            };
          }
          return p;
        })
      );

      // Check if user already liked
      const likeDoc = await getDoc(likeRef);
      if (likeDoc.exists()) {
        // Unlike
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likes: increment(-1)
        });
      } else {
        // Like
        await setDoc(likeRef, {
          userId: currentUserId,
          postId: post.id,
          createdAt: new Date().toISOString()
        });
        await updateDoc(postRef, {
          likes: increment(1)
        });
      }
    } catch (error) {
      // Revert UI if operation fails
      setPosts(currentPosts => 
        currentPosts.map(p => {
          if (p.id === post.id) {
            return {
              ...p,
              likes: p.hasLiked ? p.likes + 1 : p.likes - 1,
              hasLiked: !p.hasLiked
            };
          }
          return p;
        })
      );
      Alert.alert('Error updating like');
    }
  };

  // Update the handleShare function to properly save shared posts
  const handleShare = async (post: Post) => {
    if (!currentUserId) {
      Alert.alert("Error", "You must be logged in to share posts");
      return;
    }

    try {
      const result = await Share.share({
        message: `${post.content}\n- Shared from ${post.isAnonymous ? 'Anonymous' : post.username}`,
      });
      
      if (result.action === Share.sharedAction) {
        // Save the shared post to user's confessions
        const sharedPost = {
          content: post.content,
          username: `Shared post from ${post.isAnonymous ? 'Anonymous' : post.username}`,
          timestamp: new Date().toISOString(),
          category: post.category,
          isAnonymous: false,
          likes: 0,
          userId: currentUserId, // Now currentUserId is guaranteed to be a string
        };
        try {
          await savePost(sharedPost);
          Alert.alert('Success', 'Post shared and saved to My Confessions');
        } catch (error) {
          Alert.alert('Error saving shared post');
        }
      }
    } catch (error) {
      Alert.alert('Error sharing post');
    }
  };

  // Update the handleDelete function
  const handleDelete = async (postId: string) => {
    if (!currentUserId) {
      Alert.alert("Error", "You must be logged in to delete posts");
      return;
    }

    // Find the post to verify ownership
    const postToDelete = posts.find(post => post.id === postId);
    
    if (!postToDelete) {
      Alert.alert("Error", "Post not found");
      return;
    }

    // Verify ownership
    if (postToDelete.userId !== currentUserId) {
      Alert.alert("Error", "You can only delete your own posts");
      return;
    }

    Alert.alert(
      "Delete Confession",
      "Are you sure you want to delete this confession?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              // Delete from Firestore
              await deleteDoc(doc(db, "posts", postId));
              
              // Update local state
              setPosts(currentPosts => 
                currentPosts.filter(post => post.id !== postId)
              );
              
              Alert.alert("Success", "Confession deleted successfully");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete confession. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Add the handlePost function
  const handlePost = async (post: Post) => {
    if (!currentUserId) {
      Alert.alert("Error", "You must be logged in to post");
      return;
    }

    try {
      const user = await getUser(currentUserId);
      const newPost = {
        ...post,
        username: user?.username || 'Anonymous',
        userId: currentUserId // This is important!
      };
      await savePost(newPost);
    } catch (error) {
      Alert.alert('Error posting confession');
    }
  };

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      onPress={() => router.push(`/post/${item.id}`)}
      style={[
        styles.postCard,
        viewMode === 'grid' && styles.gridCard
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {item.isAnonymous ? 'Anonymous' : item.username}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        {item.mood && (
          <Ionicons name={getMoodIcon(item.mood)} size={20} color="#007AFF" />
        )}
      </View>
      
      <Text style={styles.content} numberOfLines={viewMode === 'grid' ? 3 : undefined}>
        {item.content}
      </Text>

      <View style={styles.interactions}>
        {/* Likes */}
        <TouchableOpacity 
          onPress={() => handleLike(item)}
          style={styles.interactionItem}
        >
          <Ionicons 
            name={item.hasLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={item.hasLiked ? '#FF3B30' : '#666'} 
          />
          <Text style={[styles.interactionCount, item.hasLiked && styles.likedCount]}>
            {item.likes || 0}
          </Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity 
          onPress={() => router.push(`/post/${item.id}`)}
          style={styles.interactionItem}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.interactionCount}>
            {item.commentCount || 0}
          </Text>
        </TouchableOpacity>

        {/* Shares */}
        <TouchableOpacity 
          onPress={() => handleShare(item)}
          style={styles.interactionItem}
        >
          <Ionicons name="share-outline" size={24} color="#666" />
          <Text style={styles.interactionCount}>
            {item.shareCount || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>CampusConfessions</Text>
        <View style={styles.titleBarRight}>
          <TouchableOpacity 
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={styles.viewModeButton}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'grid-outline' : 'list-outline'} 
              size={24} 
              color="#007AFF" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/likedConfessions')}
            style={styles.likedButton}
          >
            <Ionicons name="heart-outline" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'latest' && styles.activeFilterButton
          ]}
          onPress={() => setFilterType('latest')}
        >
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={filterType === 'latest' ? '#fff' : '#007AFF'} 
          />
          <Text style={[
            styles.filterText,
            filterType === 'latest' && styles.activeFilterText
          ]}>Latest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'trending' && styles.activeFilterButton
          ]}
          onPress={() => setFilterType('trending')}
        >
          <Ionicons 
            name="trending-up" 
            size={20} 
            color={filterType === 'trending' ? '#fff' : '#007AFF'} 
          />
          <Text style={[
            styles.filterText,
            filterType === 'trending' && styles.activeFilterText
          ]}>Trending</Text>
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

      {showMyConfessions && filteredPosts.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No confessions yet!</Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => router.push('/tabs/post')}
          >
            <Text style={styles.emptyStateButtonText}>Start Confessing Here</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedPosts}
          keyExtractor={item => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Lighter background for contrast
    paddingTop: 44, // Add safe area padding
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  title: {
    fontSize: 28, // Larger title
    fontWeight: 'bold',
    color: '#007AFF',
  },
  titleBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // Add gap between icons
  },
  viewModeButton: {
    padding: 10,
  },
  likedButton: {
    padding: 10,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  toggle: {
    flex: 1,
    paddingVertical: 15,
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
    borderRadius: 12,
    padding: 15,
    margin: 8,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  gridCard: {
    width: '45%',
    aspectRatio: 1,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30, // Fixed height
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  category: {
    backgroundColor: '#f0f8ff',
    color: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 13,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  interactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Add gap between icon and text
  },
  interactionText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  interactionCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  likedCount: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});