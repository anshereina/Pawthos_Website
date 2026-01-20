import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as auth from '../utils/auth.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#045b26",
        padding: 24,
    },
    logoRow: {
        flexDirection: "row",
        marginBottom: 16,
        marginTop: 24,
    },
    backButton: {
        position: 'absolute',
        top: 32,
        left: 24,
        zIndex: 10,
        padding: 8,
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
        color: "#fff",
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: "#e0ffe6",
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 22,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 16,
        width: 300,
        paddingHorizontal: 10,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#222',
        padding: 0,
        marginLeft: 8,
        height: 48,
    },
    button: {
        width: 200,
        paddingVertical: 14,
        borderRadius: 32,
        backgroundColor: "#2D941C",
        alignItems: "center",
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        letterSpacing: 1,
    },
    link: {
        color: '#e0ffe6',
        textAlign: 'center',
        textDecorationLine: 'underline',
        fontSize: 14,
        marginTop: 16,
    },
    error: {
        color: '#ffb3b3',
        marginBottom: 8,
        textAlign: 'center',
    },
    success: {
        color: '#90EE90',
        marginBottom: 8,
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#90EE90',
    },
    infoText: {
        color: '#e0ffe6',
        fontSize: 14,
        lineHeight: 20,
    }
});

export default function ForgotPasswordPage({ navigation }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRequestReset = async () => {
        if (!email.trim()) {
            setError("Please enter your email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const result = await auth.requestPasswordReset(email.trim());
            
            if (result.success) {
                setSuccess(result.message || "Password reset email sent successfully");
                // Navigate to the reset password screen where user can enter the code and new password
                navigation.navigate('resetPassword', { email: email.trim() });
            } else {
                setError(result.message || "Failed to send password reset email");
            }
        } catch (error) {
            console.error('❌ Password reset request error:', error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
                <MaterialIcons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            
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
            
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
                Enter your email address and we'll send you a reset code to change your password.
            </Text>
            
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    💡 We'll send a one-time reset code to your email.{"\n"}
                    Enter that code on the next screen to set a new password. 
                    Make sure to check your spam folder if you don't see it in your inbox.
                </Text>
            </View>
            
            <View style={styles.inputRow}>
                <FontAwesome name="envelope" size={22} color="#045b26" />
                <TextInput
                    placeholder="Enter your email address"
                    placeholderTextColor="#b2d8c5"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                />
            </View>
            
            {error && <Text style={styles.error}>{error}</Text>}
            {success && <Text style={styles.success}>{success}</Text>}
            
            <Pressable style={styles.button} onPress={handleRequestReset} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SEND RESET EMAIL</Text>}
            </Pressable>
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
}























