import { AsyncStorage } from 'react-native';

const store = async (key, val) => {
  await AsyncStorage.setItem(key, JSON.stringify(val));
};

const remove = async (key) => {
  await AsyncStorage.removeItem(key);
};

const fetch = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    const parsedData = await JSON.parse(data);
    return parsedData;
  } catch (e) {
    return null;
  }
};

export {
  store,
  remove,
  fetch,
};
