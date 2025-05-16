import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DUMMY_RESULTS } from '../constants/dummy-data';

type Comment = {
  id: string;
  content: string;
  username: string;
  timestamp: string;
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

  // Find the post from DUMMY_RESULTS using the id
  const post = DUMMY_RESULTS.find(p => p.id === id);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        content: newComment,
        username: 'Anonymous',
        timestamp: 'Just now'
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
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