import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import DashboardScreen from '../../screens/DashboardScreen';
import ReportsScreen from '../../screens/ReportsScreen';
import TransactionsScreen from '../../screens/TransactionsScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import ManagementStack from './ManagementStack';
import { Colors } from '../../theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: { color: theme.colors.onBackground, fontFamily: 'Poppins_600SemiBold' },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: Colors.mutedDark,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const m = {
            Home: 'home-variant-outline',
            Management: 'view-grid-outline',
            Transactions: 'swap-horizontal',
            Reports: 'poll',
            Settings: 'cog-outline',
          };
          const icon = <MaterialCommunityIcons name={m[route.name]} size={size} color={color} />;
          if (!focused) return icon;
          return (
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 8, backgroundColor: 'rgba(254,50,0,0.12)' }}>
              {icon}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarLabel: 'Home', title: 'Home' }} />
      <Tab.Screen name="Management" component={ManagementStack} options={{ tabBarLabel: 'Maareynta', title: 'Maareynta', headerShown: false }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ tabBarLabel: 'Xisaabaad', title: 'Xisaabaad' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarLabel: 'Warbixin', title: 'Warbixin' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Dejinta', title: 'Dejinta' }} />
    </Tab.Navigator>
  );
}
