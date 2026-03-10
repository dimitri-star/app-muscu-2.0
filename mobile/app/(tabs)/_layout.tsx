import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/theme';
import { getColors } from '../../constants/theme';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
  colors: ReturnType<typeof getColors>;
}

function TabIcon({ name, label, focused, colors }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 2, width: 72 }}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? colors.tabIconActive : colors.tabIconInactive}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          color: focused ? colors.tabIconActive : colors.tabIconInactive,
          marginTop: 2,
          fontWeight: focused ? '600' : '500',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);

  const tabBarStyle = {
    backgroundColor: colors.tabBarBackground,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 0.5,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-outline" label="Accueil" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="seance"
        options={{
          title: 'Séance',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="barbell-outline" label="Séance" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person-outline" label="Profil" focused={focused} colors={colors} />
          ),
        }}
      />
      {/* Hide old tabs */}
      <Tabs.Screen name="nutrition" options={{ href: null }} />
      <Tabs.Screen name="programme" options={{ href: null }} />
    </Tabs>
  );
}
