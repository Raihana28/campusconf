import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { useCurrentUser } from "../utils/auth";

// Typing effect phrases
const PHRASES = [
  "Start Confessing",
  "Ready to share?",
  "Your story matters",
  "Be heard, stay anonymous"
];

function TypingEffect() {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIdx];
    let timeout: number; // <-- Change here

    if (!deleting && charIdx < currentPhrase.length) {
      timeout = setTimeout(() => {
        setDisplayed(currentPhrase.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, 80);
    } else if (!deleting && charIdx === currentPhrase.length) {
      timeout = setTimeout(() => setDeleting(true), 1200);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplayed(currentPhrase.slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, 40);
    } else if (deleting && charIdx === 0) {
      timeout = setTimeout(() => {
        setPhraseIdx((phraseIdx + 1) % PHRASES.length);
        setDeleting(false);
      }, 400);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx]);

  return (
    <Text style={styles.typingSubtitle}>
      {displayed}
      <Text style={{ color: '#007AFF' }}>|</Text>
    </Text>
  );
}

function AnimatedBackground({ colors }: { colors: string[] }) {
  const [colorAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: colors,
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: bgColor, opacity: 0.25, zIndex: -1, borderRadius: 30 }
      ]}
    />
  );
}

function ParticlesBackground() {
  // Create 8 animated values for 8 particles
  const particles = Array.from({ length: 8 }).map(() => {
    const x = useRef(new Animated.Value(Math.random() * 300)).current;
    const yStart = Math.random() * 600;
    const y = useRef(new Animated.Value(yStart)).current;
    const initialY = yStart;
    return {
      x,
      y,
      initialY,
      size: 30 + Math.random() * 30,
      opacity: 0.15 + Math.random() * 0.15,
      color: ['#007AFF', '#00CFFF', '#A7D8FF', '#E3F0FF'][Math.floor(Math.random() * 4)],
      duration: 1200 + Math.random() * 800, // MUCH FASTER: 1.2s to 2s
      delay: Math.random() * 800,
    };
  });

  useEffect(() => {
    particles.forEach(p => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p.y, {
            toValue: p.initialY + 40,
            duration: p.duration,
            delay: p.delay,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(p.y, {
            toValue: p.initialY - 40,
            duration: p.duration,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.quad),
          }),
        ])
      ).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, idx) => (
        <Animated.View
          key={idx}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: p.color,
            opacity: p.opacity,
            zIndex: -1,
          }}
        />
      ))}
    </View>
  );
}

export default function WelcomeScreen() {
  const [showMain, setShowMain] = useState(false);
  const { displayName } = useCurrentUser();

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
          <ParticlesBackground />
          <Ionicons name="shield-checkmark" size={100} color="#007AFF" />
          <Text style={styles.slideTitle}>Safe & Anonymous</Text>
          <Text style={styles.slideText}>
            Share your thoughts and experiences anonymously with your campus community. Your privacy is our top priority.
          </Text>
        </View>

        <View style={styles.slide}>
          <ParticlesBackground />
          <Ionicons name="people" size={100} color="#007AFF" />
          <Text style={styles.slideTitle}>Connect & Engage</Text>
          <Text style={styles.slideText}>
            Read, react, and comment on confessions from fellow students. You're not alone in your campus journey.
          </Text>
        </View>

        <View style={styles.slide}>
          <ParticlesBackground />
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
        <View style={styles.logoCircle}>
          <Image 
            source={require('./assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Campus Confessions</Text>
        <TypingEffect />
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
    backgroundColor: '#f8faff',
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
    shadowColor: '#007AFF',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
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
    padding: 24,
    backgroundColor: '#f8faff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  logoCircle: {
    backgroundColor: '#fff',
    borderRadius: 60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#007AFF',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 1,
  },
  typingSubtitle: {
    fontSize: 20,
    color: '#444',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10,
    fontWeight: '500',
    minHeight: 28,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexDirection: 'column',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 22,
    width: '90%',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    alignSelf: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    width: '100%',
    textAlignVertical: 'center',
    alignSelf: 'center',
  },
  outlineButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 22,
    width: '90%',
    marginVertical: 8,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  outlineButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    width: '100%',
    textAlignVertical: 'center',
    alignSelf: 'center',
  },
  linkText: {
    marginTop: 18,
  },
  linkTextContent: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});