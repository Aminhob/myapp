// Load environment variables from .env
require('dotenv').config();

module.exports = ({ config }) => {
  const current = (config.extra && config.extra.firebase) || {};
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      firebase: {
        projectNumber: process.env.FIREBASE_PROJECT_NUMBER || current.projectNumber || '850721536439',
        projectId: process.env.FIREBASE_PROJECT_ID || current.projectId || 'data-81861',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || current.storageBucket || 'data-81861.firebasestorage.app',
        apiKey: process.env.FIREBASE_API_KEY || current.apiKey || 'AIzaSyBFOglK931vQI7sZ_aaDl2zB_vVsIY3644',
        appIdAndroid:
          process.env.FIREBASE_APP_ID || process.env.FIREBASE_ANDROID_APP_ID || current.appIdAndroid || '1:850721536439:android:bde444ccc377fa07169032',
        appId:
          process.env.FIREBASE_APP_ID || process.env.FIREBASE_IOS_APP_ID || current.appId || '',
        packageName: (config.android && config.android.package) || current.packageName || 'com.emaamul.app',
      },
    },
  };
};
