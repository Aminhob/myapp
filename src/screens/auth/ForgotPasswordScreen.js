import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { spacing } from '../../theme';
import BrandInput from '../../components/ui/BrandInput';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      setSent(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BrandInput label="Email" value={email} onChangeText={setEmail} keyboardType='email-address' style={styles.input} />
      <Button mode="contained" onPress={onSend} loading={loading}>Soo dir xiriirinta</Button>
      {sent && <Text style={{ color: 'green', marginTop: spacing() }}>Waxaa laguu soo diray farriin</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing(2), justifyContent: 'center' },
  input: { marginBottom: spacing() },
});
