import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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
import { db } from "../../firebaseConfig";
import { savePost } from "../../utils/firestore"; // Import your Firestore utility
import { CATEGORIES } from '../constants/categories';

type Post = {
  id: string;
  content: string;
  username: string;
  timestamp: string;
  category: string;
  isAnonymous: boolean;
  likes: number;
  userId: string;  // Add this line
  mood?: string;   // Make this optional since it's not always required
};

export default function PostScreen() {
  const router = useRouter();
  const [confession, setConfession] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mood, setMood] = useState<string>('');

  const MOODS = [
    { id: 'happy', icon: 'happy', label: 'Happy' },
    { id: 'sad', icon: 'sad', label: 'Sad' },
    { id: 'angry', icon: 'flame', label: 'Angry' },
    { id: 'funny', icon: 'happy', label: 'Funny' },
  ];

  const handlePost = async () => {
    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category for your confession');
      return;
    }
    try {
      const postId = await savePost({
        content: confession,
        username: isAnonymous ? "Anonymous" : "YourUserName",
        timestamp: new Date().toISOString(),
        category: selectedCategory,
        isAnonymous,
        likes: 0,
        userId: "user123", // Make sure this matches your actual user ID
        mood: mood, // Include mood if selected
      });
      // Reset form
      setConfession('');
      setSelectedCategory('');
      setIsAnonymous(true);
      setMood('');
      router.push(`/post/${postId}`);
    } catch (error) {
      Alert.alert("Error", "Failed to post. Please try again.");
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

            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Ionicons name="apps" size={24} color="#007AFF" />
                <Text style={styles.optionLabel}>Category</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCategory}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                >
                  <Picker.Item label="Select..." value="" />
                  {CATEGORIES.map(category => (
                    <Picker.Item 
                      key={category.id} 
                      label={category.name} 
                      value={category.name} 
                    />
                  ))}
                </Picker>
              </View>
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

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/post/${item.id}`)}
          style={{ padding: 16, borderBottomWidth: 1, borderColor: "#eee" }}
        >
          <Text style={{ fontWeight: "bold" }}>
            {item.isAnonymous ? "Anonymous" : item.username}
          </Text>
          <Text style={{ color: "#666", fontSize: 12 }}>{item.timestamp}</Text>
          <Text style={{ marginTop: 8 }}>{item.content}</Text>
          <Text style={{ color: "#007AFF", marginTop: 4 }}>{item.category}</Text>
        </TouchableOpacity>
      )}
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
});