import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../screens/auth/LoginScreen';
import SignupScreen from '../../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Soo gal' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Diiwaan-gelin' }} />
      <Stack.Screen name="Forgot" component={ForgotPasswordScreen} options={{ title: 'Hilmaamay erayga sirta?' }} />
    </Stack.Navigator>
  );
}
