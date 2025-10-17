import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/onboarding/SplashScreen';
import IntroSlidesScreen from '../screens/onboarding/IntroSlidesScreen';
import AuthStack from './auth/AuthStack';

const Stack = createNativeStackNavigator();

export default function OnboardingStack({ onFinish }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Intro">
        {(props) => <IntroSlidesScreen {...props} onFinish={onFinish} />}
      </Stack.Screen>
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}
