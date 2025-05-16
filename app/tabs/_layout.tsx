import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: '10%',
          right: '10%',
          elevation: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          height: 65, // Increased height
          paddingTop: 8, // Added padding top
          borderWidth: 1,
          borderColor: '#007AFF',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        tabBarItemStyle: {
          height: 50,
          width: 45,
          marginTop: 5, // Added margin top to items
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.postButton,
              focused && styles.postButtonActive
            ]}>
              <Ionicons 
                name="add" 
                size={40} 
                color={focused ? '#fff' : '#007AFF'} 
              />
            </View>
          ),
          tabBarItemStyle: {
            height: 55,
            width: 50,
            marginTop: -15,
          },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="likedConfessions"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  postButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  postButtonActive: {
    backgroundColor: '#007AFF',
  },
});