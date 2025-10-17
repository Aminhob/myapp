import React from 'react';
import { FAB, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme';

export default function BrandFAB({ style, color = '#fff', buttonColor, ...props }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <FAB
      {...props}
      color={color}
      style={[
        {
          position: 'absolute',
          right: spacing(2),
          bottom: insets.bottom + spacing(2),
          backgroundColor: buttonColor || theme.colors.primary,
          elevation: 6,
        },
        style,
      ]}
    />
  );
}
