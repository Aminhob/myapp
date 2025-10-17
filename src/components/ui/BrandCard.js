import React from 'react';
import { View } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme';

export default function BrandCard({ children, style, onPress, border = true }) {
  const theme = useTheme();
  const containerRadius = 22;

  const content = (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: containerRadius,
          padding: 18,
          borderWidth: border ? 1 : 0,
          borderColor: border ? 'rgba(255,255,255,0.06)' : 'transparent',
          shadowColor: Colors.glow,
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.25,
          shadowRadius: 30,
          elevation: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  const Wrapper = ({ children: inner }) => (
    <LinearGradient
      colors={border ? Colors.gradientCardBorder : ['transparent', 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: containerRadius, padding: border ? 1.5 : 0, overflow: 'hidden' }}
    >
      {inner}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Wrapper>
        <TouchableRipple
          onPress={onPress}
          borderless={false}
          rippleColor="rgba(1,204,255,0.15)"
          style={{ borderRadius: containerRadius }}
        >
          {content}
        </TouchableRipple>
      </Wrapper>
    );
  }

  return <Wrapper>{content}</Wrapper>;
}
