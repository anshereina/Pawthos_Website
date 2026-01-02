import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, SafeAreaView } from "react-native";
import { useFonts } from 'expo-font';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as auth from '../utils/auth.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    backButton: {
        padding: 10,
        zIndex: 10,
    },
    headerTitle: {
        color: '#D37F52',
        fontSize: 25,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        color: "#045b26",
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: "#4a7c59",
        marginBottom: 24,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#222',
        padding: 0,
        marginLeft: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    button: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: "#D37F52",
        alignItems: "center",
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        letterSpacing: 1,
    },
    link: {
        color: '#4a7c59',
        marginTop: 8,
        textAlign: 'center',
        fontSize: 14,
    },
    error: {
        color: '#F44336',
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 14,
    },
    logoRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
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
    requiredText: {
        color: '#4a7c59',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
        fontStyle: 'italic',
    }
});

export default function SignupPage() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ IrishGrover: require('../assets/fonts/IrishGrover-Regular.ttf') });
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!fontsLoaded) return null;

    const handleSignup = async () => {
        setLoading(true);
        setError(null);

        // Validation
        if (!name || !email || !password) {
            setError("Please fill in all required fields");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const result = await auth.signup(email, password, name, phoneNumber, address);
        setLoading(false);
        if (!result.success) {
            setError(result.message || "Signup failed");
        } else {
            Alert.alert("Success!", result.message || "Account created successfully!", [
                {
                    text: "Go to Login", 
                    onPress: () => {
                        router.replace('/login');
                    }
                }
            ]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={28} color="#D37F52" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sign Up</Text>
                </View>

                {/* Logo and Title */}
                <View style={styles.logoRow}>
                    <Image
                        source={require("../assets/images/logo_1.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Image
                        source={require("../assets/images/logo_2.png")}
                        style={styles.logo2}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>

                {/* Signup Form Card */}
                <View style={styles.card}>
                    {/* Full Name */}
                    <View style={styles.inputRow}>
                        <MaterialIcons name="person" size={20} color="#4a7c59" />
                        <TextInput
                            placeholder="Full Name *"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputRow}>
                        <MaterialIcons name="email" size={20} color="#4a7c59" />
                        <TextInput
                            placeholder="Email Address *"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputRow}>
                        <MaterialIcons name="phone" size={20} color="#4a7c59" />
                        <TextInput
                            placeholder="Phone Number"
                            placeholderTextColor="#999"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            style={styles.input}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Address */}
                    <View style={styles.inputRow}>
                        <MaterialIcons name="location-on" size={20} color="#4a7c59" />
                        <TextInput
                            placeholder="Address"
                            placeholderTextColor="#999"
                            value={address}
                            onChangeText={setAddress}
                            style={styles.input}
                            autoCapitalize="words"
                            multiline={true}
                            numberOfLines={2}
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputRow}>
                        <MaterialIcons name="lock-outline" size={20} color="#4a7c59" />
                        <TextInput
                            placeholder="Password *"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            secureTextEntry
                        />
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputRow}>
                        <MaterialIcons name="lock-outline" size={20} color="#4a7c59" />
                        <TextInput
                            placeholder="Confirm Password *"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            style={styles.input}
                            secureTextEntry
                        />
                    </View>

                    <Text style={styles.requiredText}>
                        * Required fields
                    </Text>

                    {error && <Text style={styles.error}>{error}</Text>}
                    
                    <Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>CREATE ACCOUNT</Text>}
                    </Pressable>
                </View>
                
                <Pressable onPress={() => router.push('/login')}>
                    <Text style={styles.link}>Already have an account? Login</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
