import React, { useMemo } from 'react';
import { TextInput, useTheme } from 'react-native-paper';
import { Colors } from '../../theme';

export default function BrandInput({ style, mode = 'outlined', outlineStyle, ...props }) {
  const theme = useTheme();
  const mergedOutlineStyle = useMemo(
    () => ({
      borderRadius: 20,
      borderColor: 'rgba(1,204,255,0.25)',
      borderWidth: 1.25,
      ...outlineStyle,
    }),
    [outlineStyle],
  );

  return (
    <TextInput
      mode={mode}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 20,
          color: theme.colors.onSurface,
        },
        style,
      ]}
      outlineStyle={mergedOutlineStyle}
      activeOutlineColor={Colors.primary}
      textColor={theme.colors.onSurface}
      cursorColor={Colors.primary}
      placeholderTextColor={Colors.mutedSurface}
      right={props.right}
      {...props}
    />
  );
}
