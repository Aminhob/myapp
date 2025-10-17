import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, Colors } from '../../theme';

const TAB_ROOTS = new Set(['Home', 'Management', 'Reports', 'Settings']);

export default function BrandHeader({ title, subtitle, children, style }) {
  const theme = useTheme();
  const navigation = useNavigation();
  const routes = useNavigationState((state) => state?.routes ?? []);
  const canGoBack = navigation?.canGoBack?.();
  const currentRoute = routes?.[routes.length - 1]?.name;
  const showBack = canGoBack && currentRoute && !TAB_ROOTS.has(currentRoute);
  const insets = useSafeAreaInsets();

  const containerStyle = {
    paddingTop: insets.top + spacing(1.5),
    paddingBottom: spacing(2),
    paddingHorizontal: spacing(2.5),
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  };

  return (
    <LinearGradient
      colors={Colors.gradientPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[containerStyle, style]}
    >
      <LinearGradient
        colors={Colors.gradientHighlight}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.8, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }]}
      />
      <View style={{ paddingTop: showBack ? spacing(0.25) : 0 }}>
        {(showBack || !!title) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: subtitle ? spacing(0.75) : spacing(2) }}>
            {showBack && (
              <IconButton
                icon="arrow-left"
                size={22}
                iconColor={Colors.primary}
                style={{
                  marginRight: spacing(1.25),
                  backgroundColor: '#01002a',
                  borderRadius: 18,
                  padding: 6,
                }}
                containerColor="transparent"
                onPress={() => navigation.goBack()}
              />
            )}
            {!!title && (
              <Text
                variant="headlineSmall"
                style={{ color: theme.colors.onBackground, textShadowColor: Colors.glow, textShadowOffset: { width: 0, height: 8 }, textShadowRadius: 24, fontFamily: 'Poppins_700Bold' }}
              >
                {title}
              </Text>
            )}
          </View>
        )}
        {!!subtitle && (
          <Text style={{ color: Colors.mutedDark, marginBottom: spacing(1.5), fontFamily: 'Poppins_500Medium' }}>{subtitle}</Text>
        )}
        {children}
      </View>
    </LinearGradient>
  );
}
