import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Colors from '../../constants/colors';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.emoji, focused && styles.emojiActive]}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
      {focused && <View style={styles.indicator} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Accueil" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="seance"
        options={{
          title: 'Séance',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💪" label="Séance" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🍎" label="Nutrition" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="programme"
        options={{
          title: 'Programme',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Programme" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBarBackground,
    borderTopColor: Colors.tabBarBorder,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    paddingTop: 2,
  },
  emoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  emojiActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.accent,
    fontWeight: '700',
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    marginTop: 3,
  },
});
