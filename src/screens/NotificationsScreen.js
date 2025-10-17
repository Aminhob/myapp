import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import BrandHeader from '../components/ui/BrandHeader';
import BrandCard from '../components/ui/BrandCard';
import ScreenWrapper from '../components/ui/ScreenWrapper';
import { spacing, Colors } from '../theme';

const sampleNotifications = [
  {
    id: 'notif-1',
    title: 'Kayd hooseeya',
    message: 'Fadlan hubi alaabta "Bariis Premium" kaydku waa 3 xabo.',
    time: '5 daqiiqo kahor',
    tone: 'danger',
  },
  {
    id: 'notif-2',
    title: 'Iib cusub',
    message: 'Iib degdeg ah ayaa la dhameeyay. Qadarka: $45.90.',
    time: '1 saac kahor',
    tone: 'success',
  },
  {
    id: 'notif-3',
    title: 'Xasuusin Bixin',
    message: 'Fatuur #INV-019 waxay dhacaysaa berri. Hubi bixinta.',
    time: 'Xalay 7:30 PM',
    tone: 'info',
  },
];

export default function NotificationsScreen() {
  const theme = useTheme();

  const toneStyles = useMemo(
    () => ({
      danger: {
        badgeBg: 'rgba(255,92,112,0.14)',
        badgeColor: Colors.danger,
      },
      success: {
        badgeBg: 'rgba(32,224,112,0.16)',
        badgeColor: Colors.success,
      },
      info: {
        badgeBg: 'rgba(1,204,255,0.16)',
        badgeColor: Colors.primary,
      },
    }),
    []
  );

  return (
    <ScreenWrapper backgroundColor={theme.colors.background}>
      <BrandHeader title="Ogeysiisyada" subtitle="Ku hay la socod waxyaabaha muhiimka ah" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing(2.5), paddingTop: spacing(2), paddingBottom: spacing(4), gap: spacing(1.5) }}>
        {sampleNotifications.map((notif) => {
          const tone = toneStyles[notif.tone] || toneStyles.info;
          return (
            <BrandCard key={notif.id} border>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: spacing() }}>
                  <Text style={{ color: '#fff', fontFamily: 'Poppins_600SemiBold', marginBottom: spacing(0.5) }}>
                    {notif.title}
                  </Text>
                  <Text style={{ color: Colors.mutedSurface, marginBottom: spacing() }}>{notif.message}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{notif.time}</Text>
                </View>
                <View
                  style={{
                    backgroundColor: tone.badgeBg,
                    borderRadius: 999,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ color: tone.badgeColor, fontFamily: 'Poppins_600SemiBold', fontSize: 12 }}>Ogeysiis</Text>
                </View>
              </View>
            </BrandCard>
          );
        })}
        {sampleNotifications.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: spacing(3) }}>
            <Text style={{ color: Colors.mutedSurface }}>Wax ogeysiis cusub ma jiro.</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
