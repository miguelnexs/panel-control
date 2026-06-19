import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { User, Bell, Shield, LogOut, ChevronRight, Moon } from 'lucide-react-native';

export default function Profile() {
  const [notifications, setNotifications] = React.useState(true);
  const { colors, theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <LinearGradient
      colors={[colors.background, isDark ? '#1A1A2E' : '#FFFFFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.surfaceLight, borderColor: colors.primary }]}>
            <User color={colors.text} size={40} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>Usuario Demo</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>usuario@ejemplo.com</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuración</Text>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
                <Bell color="#FFF" size={20} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Notificaciones</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={notifications ? '#FFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#555' : '#333' }]}>
                <Moon color="#FFF" size={20} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Modo Oscuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={isDark ? '#FFF' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                <Shield color="#FFF" size={20} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Privacidad</Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut color={colors.error} size={20} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Cerrar Sesión</Text>
        </TouchableOpacity>

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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
