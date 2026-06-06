import { MaterialTopTabs } from '../../components/MaterialTopTabs';
import { useTheme } from '../../context/ThemeContext';
import { Home, Compass, User } from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: colors.surface, 
          borderTopWidth: 0, 
          elevation: 5, 
          shadowOpacity: 0.1,
          paddingBottom: 5, // Add some padding for safe area/aesthetics
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIndicatorStyle: { 
          backgroundColor: colors.primary, 
          height: 3, 
          top: 0 // Place indicator at the top of the bottom bar
        },
        tabBarLabelStyle: { 
          fontSize: 10, 
          fontWeight: 'bold', 
          textTransform: 'capitalize',
          marginTop: -5,
        },
        tabBarIconStyle: {
          height: 24,
          width: 24,
        },
        tabBarShowIcon: true,
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <MaterialTopTabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Compass color={color} size={24} />,
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </MaterialTopTabs>
  );
}
