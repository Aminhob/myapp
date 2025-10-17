import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme';

export default function ScreenWrapper({ children, backgroundColor = Colors.background, edges = ['left', 'right', 'bottom'], style }) {
  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
