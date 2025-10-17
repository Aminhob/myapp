import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View } from 'react-native';
import { Text, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { spacing } from '../theme';

export default function BarcodeScannerModal({ visible, onClose, onScanned }) {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const theme = useTheme();

  const barcodeTypes = useMemo(() => [
    'qr',
    'ean13',
    'ean8',
    'code128',
    'code39',
    'code93',
    'upc_a',
    'upc_e',
    'pdf417',
    'itf14',
    'aztec',
  ], []);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      if (!permission?.granted) {
        (async () => {
          try { await requestPermission(); } catch {}
        })();
      }
    }
  }, [visible, permission?.granted, requestPermission]);

  if (!visible) return null;

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    onScanned?.(String(data));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, padding: spacing(2), backgroundColor: 'black' }}>
        {permission == null && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={{ color: 'white', marginTop: spacing() }}>Ogolaanshaha kamarada...</Text>
          </View>
        )}
        {permission?.granted === false && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Kamarada lama ogolayn. Fadlan u ogolow isticmaalka kamarada.</Text>
            <Button mode="outlined" onPress={requestPermission} style={{ marginTop: spacing() }} textColor="white" borderColor="white">Ogolow</Button>
          </View>
        )}
        {permission?.granted && (
          <View style={{ flex: 1 }}>
            <CameraView
              style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{ barcodeTypes }}
              enableTorch={false}
            />
            <View style={{ position: 'absolute', top: spacing(2), left: spacing(2), right: spacing(2), alignItems: 'center' }}>
              <Text style={{ color: 'white', fontFamily: 'Poppins_600SemiBold' }}>Ku dheji baar-koodhka gudaha sanduuqan</Text>
            </View>
            <View style={{ position: 'absolute', top: '25%', left: '15%', right: '15%', bottom: '35%', borderWidth: 2, borderColor: theme.colors.primary, borderRadius: 12 }} />
          </View>
        )}
        <Button mode="contained" onPress={() => { setScanned(false); onClose?.(); }} style={{ marginTop: spacing() }} buttonColor={theme.colors.primary}>Xir</Button>
      </View>
    </Modal>
  );
}
