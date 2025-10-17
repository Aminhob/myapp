import React, { useCallback, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AppStack from './AppStack';
import OnboardingStack from './OnboardingStack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthStack from './auth/AuthStack';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [onboardingSeen, setOnboardingSeen] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('onboardingSeen');
        setOnboardingSeen(flag === 'true');
      } catch {
        setOnboardingSeen(false);
      }
    })();
  }, []);

  const markOnboardingSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem('onboardingSeen', 'true');
    } catch {}
    setOnboardingSeen(true);
  }, []);

  if (loading || onboardingSeen === null) {
    return null; // could add splash
  }

  const showOnboarding = !user && !onboardingSeen;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        <Stack.Screen name="Onboarding">
          {() => <OnboardingStack onFinish={markOnboardingSeen} />}
        </Stack.Screen>
      ) : user ? (
        <Stack.Screen name="Main" component={AppStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
