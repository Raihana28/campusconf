import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from "../../firebaseConfig";
import { saveComment, savePost, saveUser } from "../../utils/firestore";

type Comment = {
  id: string;
  content: string;
  username: string;
  timestamp: string;
};

type Post = {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  category: string;
  isAnonymous: boolean;
  likes: number;
  userId: string;
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: 'This is so relatable!',
      username: 'Anonymous',
      timestamp: '2m ago'
    }
  ]);
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (!post) return;
    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            content: data.content ?? "",
            username: data.username ?? "Anonymous",
            timestamp: data.timestamp ?? "",
          };
        })
      );
    });
    return unsubscribe;
  }, [post]);

  const handleAddComment = async () => {
    if (newComment.trim() && post) {
      const comment = {
        content: newComment,
        username: "Anonymous", // Or use actual username if available
        timestamp: new Date().toISOString(),
      };
      setNewComment('');
      try {
        await saveComment(post.id, comment);
        // Optionally: fetch comments again or use onSnapshot for real-time updates
      } catch (error) {
        alert("Failed to save comment: " + error);
      }
    }
  };

  const handleSavePost = async () => {
    if (!post) return;
    try {
      const postId = await savePost({
        content: post.content,
        username: post.username ?? "Anonymous",
        timestamp: post.timestamp,
        category: post.category,
        isAnonymous: post.isAnonymous,
        likes: post.likes,
        userId: post.userId ?? "user123", // Add userId from post or fallback
      });
      alert("Post saved with ID: " + postId);
    } catch (error) {
      alert("Failed to save post: " + error);
    }
  };

  // Example usage
  const saveUserExample = async () => {
    try {
      await saveUser("userId123", {
        username: "Alice",
        email: "alice@example.com",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      alert("Failed to save user: " + error);
    }
  };

  if (!post) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUser}>{item.username}</Text>
              <Text style={styles.commentTime}>{item.timestamp}</Text>
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.postContainer}>
            <View style={styles.userInfo}>
              <Text style={styles.username}>
                {post.isAnonymous ? 'Anonymous' : post.username}
              </Text>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
            
            <Text style={styles.content}>{post.content}</Text>
            
            <View style={styles.categoryBadge}>
              <Ionicons name="apps" size={16} color="#007AFF" />
              <Text style={styles.categoryText}>{post.category}</Text>
            </View>

            <View style={styles.interactions}>
              <TouchableOpacity 
                style={styles.interactionButton}
                onPress={() => setIsLiked(!isLiked)}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? "#FF3B30" : "#666"} 
                />
                <Text style={styles.interactionText}>{post.likes}</Text>
              </TouchableOpacity>
              
              <View style={styles.interactionButton}>
                <Ionicons name="chatbubble-outline" size={24} color="#666" />
                <Text style={styles.interactionText}>{comments.length}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleSavePost} style={{margin: 10, padding: 10, backgroundColor: "#007AFF", borderRadius: 8}}>
              <Text style={{color: "#fff", textAlign: "center"}}>Save Post to Firestore</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.commentsContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={200}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !newComment.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleAddComment}
          disabled={!newComment.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={newComment.trim() ? "#007AFF" : "#ccc"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  timestamp: {
    color: '#666',
    fontSize: 14,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 15,
  },
  categoryText: {
    color: '#007AFF',
    marginLeft: 5,
    fontSize: 14,
  },
  interactions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  interactionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  commentsContainer: {
    paddingBottom: 20,
  },
  commentCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentUser: {
    fontWeight: '500',
    color: '#007AFF',
  },
  commentTime: {
    color: '#666',
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});