import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function RoleGate({ allow = ['admin'], children }) {
  const { profile } = useAuth();
  if (!profile || !allow.includes(profile.role)) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Ma lihid ogolaansho ku filan.</Text>
      </View>
    );
  }
  return <>{children}</>;
}
