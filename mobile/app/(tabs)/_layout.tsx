import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/theme';
import { getColors } from '../../constants/theme';

const INACTIVE_COLOR = '#8E8E93';
const ACTIVE_COLOR = '#FFFFFF';

function HomeIcon({ focused }: { focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 2, width: 72 }}>
      <Ionicons
        name={focused ? 'home' : 'home-outline'}
        size={26}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          color: focused ? ACTIVE_COLOR : INACTIVE_COLOR,
          marginTop: 2,
          fontWeight: focused ? '700' : '500',
        }}
      >
        Accueil
      </Text>
    </View>
  );
}

function DumbbellIcon({ focused }: { focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 2, width: 72 }}>
      <MaterialCommunityIcons
        name="dumbbell"
        size={26}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          color: focused ? ACTIVE_COLOR : INACTIVE_COLOR,
          marginTop: 2,
          fontWeight: focused ? '700' : '500',
        }}
      >
        Séance
      </Text>
    </View>
  );
}

function PersonIcon({ focused }: { focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 2, width: 72 }}>
      <Ionicons
        name={focused ? 'person' : 'person-outline'}
        size={26}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          color: focused ? ACTIVE_COLOR : INACTIVE_COLOR,
          marginTop: 2,
          fontWeight: focused ? '700' : '500',
        }}
      >
        Profil
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const isDark = useThemeStore((s) => s.isDark);
  const colors = getColors(isDark);

  const tabBarStyle = {
    backgroundColor: '#000000',
    borderTopColor: '#1C1C1E',
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
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="seance"
        options={{
          title: 'Séance',
          tabBarIcon: ({ focused }) => <DumbbellIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <PersonIcon focused={focused} />,
        }}
      />
      {/* Hide old tabs */}
      <Tabs.Screen name="nutrition" options={{ href: null }} />
      <Tabs.Screen name="programme" options={{ href: null }} />
    </Tabs>
  );
}
