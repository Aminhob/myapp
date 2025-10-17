import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, Colors } from '../theme';

export default function CardStat({ title, value, color, full = false, filled = false, dark = false, icon }) {
  const theme = useTheme();
  const isFilled = !!filled;
  const isDark = !!dark && !isFilled;
  const bg = isFilled ? (color || theme.colors.primary) : (isDark ? 'rgba(255,255,255,0.06)' : theme.colors.surface);
  const titleColor = isFilled ? 'rgba(255,255,255,0.9)' : (isDark ? Colors.mutedDark : Colors.mutedSurface);
  const valueColor = isFilled ? '#fff' : (isDark ? theme.colors.onBackground : (color || theme.colors.primary));

  return (
    <View
      style={{
        flex: full ? 1 : 0.5,
        backgroundColor: bg,
        padding: spacing(1.75),
        borderRadius: 18,
        borderWidth: isFilled ? 0 : 1,
        borderColor: isFilled ? 'transparent' : theme.colors.outline,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 22,
        elevation: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        {!!icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={isFilled ? '#fff' : (isDark ? '#fff' : (color || theme.colors.primary))}
            style={{ marginRight: 6 }}
          />
        )}
        <Text style={{ color: titleColor }}>{title}</Text>
      </View>
      <Text variant="titleLarge" style={{ color: valueColor, fontFamily: 'Poppins_600SemiBold' }}>{value}</Text>
    </View>
  );
}
