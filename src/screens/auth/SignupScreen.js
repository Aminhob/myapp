import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, RadioButton } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { spacing } from '../../theme';
import BrandInput from '../../components/ui/BrandInput';

const isValidEmail = (val = '') => /.+@.+\..+/.test(val);
const mapAuthError = (code = '') => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email-kan hore ayaa loo isticmaalay.';
    case 'auth/invalid-email':
      return 'Email sax ah geli.';
    case 'auth/weak-password':
      return 'Erayga sirta waa inuu ka badan yahay 6 xaraf.';
    case 'auth/network-request-failed':
      return 'Shabakad la’aan. Hubi internet-ka ka dibna isku day mar kale.';
    case 'auth/operation-not-allowed':
      return 'Nooca diiwaan-gelinta lama oggola. (Fiiro gaar ah: Daar Email/Password ee Firebase Console).';
    default:
      return 'Diiwaan-gelintu way fashilantay.';
  }
};

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const e = email.trim().toLowerCase();
      if (!name.trim()) {
        throw { code: 'client/invalid-name' };
      }
      if (!isValidEmail(e)) {
        throw { code: 'auth/invalid-email' };
      }
      if ((password || '').length < 6) {
        throw { code: 'auth/weak-password' };
      }
      await signUp(e, password, { name: name.trim(), role });
      navigation.goBack();
    } catch (e) {
      if (e?.code === 'client/invalid-name') {
        setError('Fadlan geli magaca.');
      } else {
        setError(mapAuthError(e?.code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Abaabulo koonto</Text>
      <BrandInput label="Magaca" value={name} onChangeText={setName} style={styles.input} />
      <BrandInput label="Email" value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' style={styles.input} />
      <BrandInput label="Erayga sirta" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Text style={{ marginTop: spacing() }}>Doorka</Text>
      <RadioButton.Group onValueChange={setRole} value={role}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing() }}>
          <RadioButton value="admin" /><Text>Maamule</Text>
          <RadioButton value="accountant" /><Text>Xisaabiye</Text>
          <RadioButton value="sales" /><Text>Wakiil Iib</Text>
        </View>
      </RadioButton.Group>
      {!!error && <Text style={{ color: 'red', marginBottom: spacing() }}>{error}</Text>}
      <Button mode="contained" onPress={onSignup} loading={loading}>Diiwaan-gelin</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing(2) },
  title: { textAlign: 'center', marginBottom: spacing(2) },
  input: { marginBottom: spacing() },
});
