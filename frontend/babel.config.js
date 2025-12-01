// /frontend/babel.config.js (수정)

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 💡 누락된 expo-router 플러그인을 추가합니다.
      'expo-router/babel', 
      'react-native-reanimated/plugin',
    ],
  };
};