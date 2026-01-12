module.exports = {
  expo: {
    name: "pawthos",
    slug: "pawthos",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.anshesanchez_30.pawthos",
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      usesCleartextTraffic: false,
      config: {
        googleMaps: {
          apiKey: ""
        }
      }
    },
    ios: {
      supportsTablet: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app needs access to your photos to let you select images.",
          cameraPermission: "The app needs access to your camera to let you take photos."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "8ecf732c-95ca-49d2-b9ee-e050d26ce417"
      }
    }
  }
};

