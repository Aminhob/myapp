import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { theme as appTheme } from './src/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import RootNavigator from './src/navigation/RootNavigator';
import { setupDb, setDbOwner } from './src/services/offline/db';
import { useOnlineStatus } from './src/hooks/useOnlineStatus';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false })
});

function AppInner() {
  const { user } = useAuth() || {};
  const [iconsReady, setIconsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  useOnlineStatus();
  useEffect(() => {
    try { setDbOwner(user?.uid || null); } catch {}
    setupDb();
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        await Notifications.requestPermissionsAsync();
      } catch (e) {}
    })();
    (async () => {
      try {
        await MaterialCommunityIcons.loadFont();
      } catch {}
      setIconsReady(true);
    })();
  }, []);

  if (!iconsReady || !fontsLoaded) return null;

  const navTheme = {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      background: appTheme.colors.background,
      card: appTheme.colors.surface,
      text: appTheme.colors.onBackground,
      primary: appTheme.colors.primary,
      border: appTheme.colors.outline,
    },
  };

  return (
    <PaperProvider theme={appTheme}>
      <CurrencyProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </CurrencyProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
