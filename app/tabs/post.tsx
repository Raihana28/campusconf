import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from "../../firebaseConfig";
import { Post, PostInput } from '../../types';
import { getUser, savePost } from "../../utils/firestore"; // Import your Firestore utility


type Mood = {
  id: string;
  icon: string;
  label: string;
};

// Add this helper function at the top of the file
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

export default function PostScreen() {
  const router = useRouter();
  const [confession, setConfession] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mood, setMood] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const MOODS = [
    { id: 'happy', icon: 'happy', label: 'Happy' },
    { id: 'sad', icon: 'sad', label: 'Sad' },
    { id: 'angry', icon: 'flame', label: 'Angry' },
    { id: 'funny', icon: 'happy', label: 'Funny' },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        const userData = await getUser(auth.currentUser.uid);
        setCurrentUser(userData);
      }
    };
    loadUserData();
  }, []);

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        Alert.alert('Authentication Error', 'Please log in to post confessions');
        router.push('/login'); // Redirect to login if needed
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'Please log in to post');
      return;
    }

    if (!confession.trim()) {
      Alert.alert('Error', 'Please write your confession');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      // Get current user data to ensure we have the correct username
      const userData = await getUser(auth.currentUser.uid);
      
      const newPost: PostInput = {
        content: confession,
        // Use userData.username if available and not anonymous
        username: isAnonymous ? 'Anonymous' : userData?.username || auth.currentUser.displayName || 'Anonymous',
        category: selectedCategory,
        isAnonymous: isAnonymous,
        userId: auth.currentUser.uid,
        mood: mood || undefined,
      };

      await savePost(newPost);
      
      setConfession('');
      setSelectedCategory('');
      setMood('');
      
      router.push('/tabs');
    } catch (error) {
      console.error('Error posting:', error);
      Alert.alert('Error', 'Failed to post confession');
    }
  };

  const characterCount = confession.length;
  const maxCharacters = 500;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (confession.trim()) {
              Alert.alert(
                'Discard Post?',
                'Are you sure you want to discard your confession?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Discard', style: 'destructive', onPress: () => router.back() }
                ]
              );
            } else {
              router.back();
            }
          }}
        >
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.postButton, 
            (!confession || !selectedCategory) && styles.postButtonDisabled
          ]}
          disabled={!confession || !selectedCategory}
          onPress={handlePost}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Share your thoughts anonymously..."
            multiline
            maxLength={maxCharacters}
            value={confession}
            onChangeText={setConfession}
          />
          <Text style={styles.characterCount}>
            {characterCount}/{maxCharacters}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.optionSection}>
            <Text style={styles.sectionTitle}>Post Settings</Text>
            
            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
                <Text style={styles.optionLabel}>Post Anonymously</Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                ios_backgroundColor="#767577"
              />
            </View>

 

          </View>

          <View style={styles.optionSection}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodContainer}>
              {MOODS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.moodButton,
                    mood === item.id && styles.moodButtonSelected
                  ]}
                  onPress={() => setMood(item.id)}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={mood === item.id ? '#fff' : '#007AFF'} 
                  />
                  <Text style={[
                    styles.moodText,
                    mood === item.id && styles.moodTextSelected
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function PostsScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  const MOODS: Mood[] = [
    { id: 'happy', icon: 'happy', label: 'Happy' },
    { id: 'sad', icon: 'sad', label: 'Sad' },
    { id: 'angry', icon: 'flame', label: 'Angry' },
    { id: 'funny', icon: 'happy', label: 'Funny' },
  ];

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
            userId: data.userId ?? "",  // Add this line
            mood: data.mood           // Add this line
          };
        })
      );
    });
    return unsubscribe;
  }, []);

  const sortedPosts = posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      onPress={() => router.push(`/post/${item.id}`)}
      style={styles.postCard}
    >
      <View style={styles.postHeader}>
        <Text style={styles.username}>
          {item.isAnonymous ? 'Anonymous' : item.username}
        </Text>
        {item.mood && (
          <Ionicons 
            name={getMoodIcon(item.mood)} 
            size={20} 
            color="#007AFF" 
          />
        )}
      </View>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={sortedPosts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
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
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  characterCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  optionsContainer: {
    padding: 15,
  },
  optionSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    width: 150,
  },
  picker: {
    width: 150,
    height: 40,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  moodButtonSelected: {
    backgroundColor: '#007AFF',
  },
  moodText: {
    marginLeft: 5,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  moodTextSelected: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timestamp: {
    fontSize: 13,
    color: '#666',
  },
});