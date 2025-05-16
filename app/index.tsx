import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';

export default function WelcomeScreen() {
  const [showMain, setShowMain] = useState(false);

  if (!showMain) {
    return (
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        onIndexChanged={(index) => {
          if (index === 2) {
            setTimeout(() => setShowMain(true), 500);
          }
        }}
      >
        <View style={styles.slide}>
          <Ionicons name="shield-checkmark" size={100} color="#007AFF" />
          <Text style={styles.slideTitle}>Safe & Anonymous</Text>
          <Text style={styles.slideText}>
            Share your thoughts and experiences anonymously with your campus community. Your privacy is our top priority.
          </Text>
        </View>

        <View style={styles.slide}>
          <Ionicons name="people" size={100} color="#007AFF" />
          <Text style={styles.slideTitle}>Connect & Engage</Text>
          <Text style={styles.slideText}>
            Read, react, and comment on confessions from fellow students. You're not alone in your campus journey.
          </Text>
        </View>

        <View style={styles.slide}>
          <Text style={styles.welcomeTitle}>Welcome to{'\n'}Campus Confessions</Text>
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={() => setShowMain(true)}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </Swiper>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Campus Confessions</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Link href="/login" style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign In with Email</Text>
        </Link>

        <Link href="/tabs" style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Continue Anonymously</Text>
        </Link>

        <Link href="/register" style={styles.linkText}>
          <Text style={styles.linkTextContent}>Don't have an account? Register</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    color: '#007AFF',
    textAlign: 'center',
  },
  slideText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 28,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 44,
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  dot: {
    backgroundColor: '#ccc',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 20,
    width: '80%',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  outlineButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    width: '80%',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  outlineButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkText: {
    marginTop: 20,
  },
  linkTextContent: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
});