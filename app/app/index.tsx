import React from "react";
import { Text, View, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#045b26",
  },
  logoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    marginRight: 12,
  },
  logo2: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
    // fontFamily: 'IrishGrover', // Made optional to prevent crashes
  },
  subtitle: {
    fontSize: 18,
    color: "#e0ffe6",
    marginBottom: 32,
  },
  button: {
    width: 200,
    paddingVertical: 14,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#045b26",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default function Index() {
  const router = useRouter();

  const handleLoginPress = () => {
    try {
      router.push('/login');
    } catch (error) {
      console.error('Error navigating to Login:', error);
    }
  };

  const handleSignupPress = () => {
    try {
      router.push('/signup');
    } catch (error) {
      console.error('Error navigating to Signup:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image
          source={require("../assets/images/logo_1.png")}
          style={styles.logo}
          resizeMode="contain"
          onError={(error) => {
            console.warn('Error loading logo_1.png:', error);
          }}
        />
        <Image
          source={require("../assets/images/logo_2.png")}
          style={styles.logo2}
          resizeMode="contain"
          onError={(error) => {
            console.warn('Error loading logo_2.png:', error);
          }}
        />
      </View>
      <Text style={styles.title}>PawThos</Text>
      <Text style={styles.subtitle}>Welcome to your pet care companion</Text>
      <View style={{ height: 48 }} />
      <Pressable 
        style={[styles.button, { backgroundColor: '#2D941C' }]} 
        onPress={handleLoginPress}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>LOGIN</Text>
      </Pressable>
      <Pressable 
        style={[styles.button, { backgroundColor: '#e0ffe6' }]} 
        onPress={handleSignupPress}
      >
        <Text style={[styles.buttonText, { color: '#045b26' }]}>SIGN UP</Text>
      </Pressable>
    </View>
  );
}
