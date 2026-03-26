import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/theme';
import { getColors } from '../../constants/theme';

export default function TabLayout() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);

  const tabBarStyle = {
    backgroundColor: isDark ? 'rgba(26,26,46,0.72)' : 'rgba(255,255,255,0.74)',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(58,58,82,0.75)' : 'rgba(229,229,229,0.9)',
    height: Platform.OS === 'ios' ? 86 : 72,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
    paddingTop: 8,
    borderRadius: 26,
    position: 'absolute' as const,
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 12 : 10,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.24 : 0.14,
    shadowRadius: 20,
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarActiveBackgroundColor: isDark ? 'rgba(29,185,84,0.18)' : 'rgba(29,185,84,0.14)',
          tabBarItemStyle: {
            borderRadius: 16,
            marginHorizontal: 6,
            marginVertical: 7,
            overflow: 'hidden',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: -1,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="seance"
          options={{
            title: 'Séance',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="dumbbell" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen name="nutrition" options={{ href: null }} />
        <Tabs.Screen name="programme" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
