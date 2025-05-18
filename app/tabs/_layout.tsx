import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#fff',      // Active: white
        tabBarInactiveTintColor: '#bbb',    // Inactive: grey
        headerShown: false,
        tabBarLabel: ({ focused, color }) => null, // Remove default label
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: '15%',
          right: '15%',
          elevation: 0,
          backgroundColor: '#007AFF',
          borderRadius: 30,
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
          borderWidth: 0,
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItem}>
              <Ionicons name="home" size={24} color={focused ? '#fff' : '#bbb'} />
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#bbb' }]}>Home</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItem}>
              <Ionicons name="search" size={24} color={focused ? '#fff' : '#bbb'} />
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#bbb' }]}>Search</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <View style={[styles.postButton, focused && styles.postButtonActive]}>
                <Ionicons name="add" size={40} color={focused ? '#fff' : '#007AFF'} />
              </View>
              <Text style={[styles.tabLabel, styles.postLabel]}></Text>
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
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItem}>
              <Ionicons name="notifications-outline" size={24} color={focused ? '#fff' : '#bbb'} />
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#bbb' }]}>Alerts</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItem}>
              <Ionicons name="person" size={24} color={focused ? '#fff' : '#bbb'} />
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#bbb' }]}>Profile</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    paddingTop: 2, // Reduced padding
    width: 60,  // Added fixed width to control spacing
  },
  tabLabel: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2, // Reduced spacing between icon and label
    fontWeight: '500',
  },
  postLabel: {
    marginTop: 6, // Adjusted post label spacing
    textAlign: 'center',
  },
  postButton: {
    width: 45,  // Slightly smaller button
    height: 45, // Slightly smaller button
    borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  postButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#fff',
  },
});