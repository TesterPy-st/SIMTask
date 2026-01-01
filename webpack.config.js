const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@react-native-community/datetimepicker'],
      },
    },
    argv
  );
  
  // Customize the config before returning it.
  return config;
};
