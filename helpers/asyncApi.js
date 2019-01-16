import { AsyncStorage } from 'react-native';

export const store = async (key, val) => {
  await AsyncStorage.setItem(key, JSON.stringify(val));
};

export const remove = async (key) => {
  await AsyncStorage.remove(key);
};

export const fetch = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return await JSON.parse(data);
  } catch (e) {
    return null;
  }
};
