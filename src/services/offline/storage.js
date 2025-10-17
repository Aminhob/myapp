import AsyncStorage from '@react-native-async-storage/async-storage';

export const setJSON = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getJSON = async (key, fallback = null) => {
  const v = await AsyncStorage.getItem(key);
  return v ? JSON.parse(v) : fallback;
};
