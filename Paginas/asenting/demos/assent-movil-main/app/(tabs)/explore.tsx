import React from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Search } from 'lucide-react-native';

const EXPLORE_ITEMS = [
  { id: '1', title: 'Montañas', color: '#FF6584' },
  { id: '2', title: 'Océanos', color: '#6C63FF' },
  { id: '3', title: 'Bosques', color: '#4CAF50' },
  { id: '4', title: 'Desiertos', color: '#FFD740' },
  { id: '5', title: 'Ciudades', color: '#40C4FF' },
  { id: '6', title: 'Espacio', color: '#8A84FF' },
];

export default function Explore() {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const renderItem = ({ item }: { item: typeof EXPLORE_ITEMS[0] }) => (
    <View style={[styles.card, { backgroundColor: item.color }]}>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.background, isDark ? '#1A1A2E' : colors.surfaceLight]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Explorar</Text>
          <View style={[styles.searchBar, { 
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderColor: colors.border 
          }]}>
            <Search color={colors.textSecondary} size={20} />
            <Text style={[styles.placeholder, { color: colors.textSecondary }]}>Buscar destinos...</Text>
          </View>
        </View>

        <FlatList
          data={EXPLORE_ITEMS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
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
  header: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  placeholder: {
    marginLeft: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    height: 150,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'flex-end',
    opacity: 0.8,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
