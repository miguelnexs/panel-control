import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Animated, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Sparkles } from 'lucide-react-native';

export default function Home() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const features = [
    { title: 'Diseño Moderno', description: 'Interfaz limpia con colores vibrantes y modo oscuro inmersivo.' },
    { title: 'Animaciones Nativas', description: 'Interacciones fluidas y transiciones suaves a 60fps.' },
    { title: 'Experiencia Intuitiva', description: 'Navegación rápida y estructura clara para el usuario.' },
  ];

  return (
    <LinearGradient
      colors={[colors.background, isDark ? '#1A1A2E' : colors.surfaceLight, isDark ? '#2E2E4E' : colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconContainer}>
              <Image source={require('../../assets/icon.png')} style={styles.logo} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Assent Dashboard</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Plantilla móvil con el mismo estilo</Text>
          </Animated.View>

          <View style={styles.cardsContainer}>
            {features.map((feature, index) => (
              <Card 
                key={index}
                index={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </View>

          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Button 
              title="Explorar Detalles" 
              onPress={() => router.push('/details')} 
            />
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  footer: {
    alignItems: 'center',
  },
});
