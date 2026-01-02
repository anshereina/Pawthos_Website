import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView } from "react-native";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
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
    logoRow: {
        flexDirection: "row",
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
        marginBottom: 32,
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
    input: {
        flex: 1,
        fontSize: 16,
        color: '#222',
        padding: 0,
        marginLeft: 12,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 14,
        backgroundColor: "#D37F52",
        alignItems: "center",
        justifyContent: "center",
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
        textAlign: "center",
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#4a7c59',
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#4a7c59',
        borderColor: '#045b26',
    },
    link: {
        color: '#D37F52',
        textAlign: 'right',
        textDecorationLine: 'underline',
        fontSize: 14,
        fontWeight: '600',
    },
    error: {
        color: '#F44336',
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 14,
    },
    bottomLink: {
        color: '#4a7c59',
        textAlign: 'center',
        fontSize: 14,
        marginTop: 8,
    }
});

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [savedCredentials, setSavedCredentials] = useState<{ email: string; password: string } | null>(null);

    // Load saved credentials on component mount (but don't auto-fill)
    useEffect(() => {
        loadSavedCredentials();
    }, []);

    const loadSavedCredentials = async () => {
        try {
            const credentials = await auth.getRememberMeCredentials();
            if (credentials) {
                setSavedCredentials(credentials);
                setRemember(true);
                console.log('✅ Remember Me credentials loaded successfully');
                // Don't auto-fill the fields - keep them empty
            }
        } catch (error) {
            console.error('❌ Error loading saved credentials:', error);
        }
    };

    // Handle email input changes
    const handleEmailChange = (email: string) => {
        setUsername(email);
        
        // Only auto-fill password if:
        // 1. There are saved credentials
        // 2. The entered email exactly matches the saved email
        // 3. The email field is not empty
        if (savedCredentials && email.trim() !== '' && email.toLowerCase().trim() === savedCredentials.email.toLowerCase()) {
            setPassword(savedCredentials.password);
            console.log('✅ Auto-filling password for saved email');
        } else {
            // Clear password if email doesn't match or is empty
            setPassword('');
        }
    };

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            setError("Please enter both email and password");
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await auth.login(username.trim(), password, remember);
            
            if (!result.success) {
                setError(result.message || "Login failed");
            } else {
                // Clear any previous errors on successful login
                setError(null);
                console.log('✅ Login successful');
                router.replace('/main');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push('/forgotPassword');
    };


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={28} color="#D37F52" />
                    </TouchableOpacity>
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
                <Text style={styles.title}>Welcome back!</Text>
                <Text style={styles.subtitle}>Login to your account</Text>

                {/* Login Form Card */}
                <View style={styles.card}>
                    <View style={styles.inputRow}>
                        <FontAwesome name="user" size={20} color="#4a7c59" />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={handleEmailChange}
                            onFocus={() => {
                                // Clear password when user starts typing a new email
                                if (savedCredentials && username.trim() !== '' && username.toLowerCase().trim() !== savedCredentials.email.toLowerCase()) {
                                    setPassword('');
                                }
                            }}
                            style={styles.input}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.inputRow}>
                        <MaterialIcons name="lock-outline" size={20} color="#4a7c59" />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
                            <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={20} color="#4a7c59" />
                        </TouchableOpacity>
                    </View>
                    {error && <Text style={styles.error}>{error}</Text>}
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.checkbox, remember && styles.checkboxChecked]} onPress={() => setRemember(!remember)}>
                            {remember && <MaterialIcons name="check" size={16} color="#fff" />}
                        </TouchableOpacity>
                        <Text style={{ color: '#4a7c59', fontSize: 14, flex: 1 }}>Remember me</Text>
                        <TouchableOpacity onPress={handleForgotPassword}>
                            <Text style={styles.link}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOGIN</Text>}
                    </TouchableOpacity>
                </View>

                <Pressable onPress={() => router.push('/signup')}>
                    <Text style={styles.bottomLink}>Don't have an account? Sign Up</Text>
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}
