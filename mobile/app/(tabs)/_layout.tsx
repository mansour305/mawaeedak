/**
 * Tab Layout — Bottom Tab Navigation for Mawaeedak Mobile
 * 
 * Luxury design matching Mawaeedak identity:
 * - RTL order: الرئيسية, الرواتب, الخدمات, التقويم, المزيد
 * - Active: capsule with cream background + gold icon + gold text + gold underline
 * - Inactive: no background + brown icon + brown text
 * - Ivory/cream background with gold border
 * - Soft shadow, large border-radius
 * - Support safe-area-bottom
 * - Using Feather icons: Home, DollarSign, Grid, Calendar, MoreHorizontal
 */

import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { I18nManager, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Theme colors - Mawaeedak luxury identity
const GOLD = '#C9A063';
const BROWN = '#8A6B3D';
const INK = '#2F2B25';
const CREAM = '#FAF7F2';
const LIGHT_CREAM = '#F5EFE4';

// Tab data with Feather icon names
const TABS = [
  { name: 'home', label: 'الرئيسية', iconName: 'home' as const },
  { name: 'salary', label: 'الرواتب', iconName: 'dollar-sign' as const },
  { name: 'services', label: 'الخدمات', iconName: 'grid' as const },
  { name: 'calendar', label: 'التقويم', iconName: 'calendar' as const },
  { name: 'more', label: 'المزيد', iconName: 'more-horizontal' as const },
];

// Icon component
function TabIcon({ name, size, color }: { name: string; size: number; color: string }) {
  return (
    <Feather 
      name={name as any} 
      size={size} 
      color={color} 
    />
  );
}

// Tab item component
function TabItem({ label, iconName, isActive, onPress }: { label: string; iconName: string; isActive: boolean; onPress: () => void }) {
  const iconColor = isActive ? GOLD : BROWN;
  
  return (
    <Pressable 
      onPress={onPress} 
      style={[styles.tabItem, isActive && styles.tabItemActive]}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={isActive ? { selected: true } : undefined}
    >
      <View style={styles.iconContainer}>
        <TabIcon name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
      {isActive && <View style={styles.underline} />}
    </Pressable>
  );
}

// Custom tab bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { width } = useWindowDimensions();
  const tabBarWidth = Math.min(width - 32, 420);
  
  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar, { width: tabBarWidth }]}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const tab = TABS[index];
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          
          return (
            <TabItem
              key={route.key}
              label={tab?.label || route.name}
              iconName={tab?.iconName || 'circle'}
              isActive={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20, // safe-area-bottom
    direction: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: CREAM,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(201,160,99,0.25)',
    shadowColor: '#8A6B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 22,
    marginHorizontal: 2,
    minHeight: 58,
  },
  tabItemActive: {
    backgroundColor: LIGHT_CREAM,
  },
  iconContainer: {
    width: 36,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 9,
    color: BROWN,
    fontWeight: '500',
    marginTop: 2,
  },
  labelActive: {
    color: GOLD,
    fontWeight: '600',
  },
  underline: {
    width: 18,
    height: 2.5,
    backgroundColor: GOLD,
    borderRadius: 1.25,
    marginTop: 3,
  },
});