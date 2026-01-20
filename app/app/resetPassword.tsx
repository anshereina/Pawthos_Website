import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
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
    },
    passwordRequirements: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 6,
        padding: 12,
        marginBottom: 16,
    },
    requirementText: {
        color: '#e0ffe6',
        fontSize: 12,
        marginBottom: 4,
    },
    requirementMet: {
        color: '#90EE90',
    },
    requirementNotMet: {
        color: '#ffb3b3',
    }
});

export default function ResetPasswordPage({ navigation, route }) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokenInput, setTokenInput] = useState("");

    // Optional token and email from deep link / navigation
    const tokenFromRoute = route?.params?.token as string | undefined;
    const emailFromRoute = route?.params?.email as string | undefined;

    // Use token from route when present, otherwise fall back to manual input
    const effectiveToken = (tokenFromRoute || tokenInput.trim());

    // Password validation
    const passwordRequirements = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /\d/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
    const passwordsMatch = newPassword === confirmPassword;

    const handleResetPassword = async () => {
        if (!effectiveToken) {
            setError("Please enter the reset code that was sent to your email.");
            return;
        }

        if (!isPasswordValid) {
            setError("Please ensure your password meets all requirements.");
            return;
        }

        if (!passwordsMatch) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const result = await auth.resetPassword(effectiveToken, newPassword);
        setLoading(false);

        if (result.success) {
            setSuccess(result.message || "Password reset successfully");
            Alert.alert(
                "Success",
                "Your password has been reset successfully. You can now log in with your new password.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
        } else {
            setError(result.message || "Failed to reset password");
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
            
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
                {tokenFromRoute
                    ? "Enter your new password below."
                    : "Enter the reset code from your email and choose a new password."}
            </Text>
            
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    🔒 A reset code was sent to your email
                    {emailFromRoute ? ` (${emailFromRoute})` : ""}.{" "}
                    Enter that code below together with your new password. 
                    Make sure your new password is strong and different from your previous one.
                </Text>
            </View>

            {/* Reset code / OTP input when no token was provided via deep link */}
            {!tokenFromRoute && (
                <View style={styles.inputRow}>
                    <MaterialIcons name="vpn-key" size={22} color="#045b26" />
                    <TextInput
                        placeholder="Reset code from email"
                        placeholderTextColor="#b2d8c5"
                        value={tokenInput}
                        onChangeText={setTokenInput}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            )}
            
            <View style={styles.inputRow}>
                <MaterialIcons name="lock-outline" size={22} color="#045b26" />
                <TextInput
                    placeholder="New Password"
                    placeholderTextColor="#b2d8c5"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                    <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={22} color="#045b26" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
                <MaterialIcons name="lock-outline" size={22} color="#045b26" />
                <TextInput
                    placeholder="Confirm New Password"
                    placeholderTextColor="#b2d8c5"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                    <MaterialIcons name={showConfirmPassword ? "visibility-off" : "visibility"} size={22} color="#045b26" />
                </TouchableOpacity>
            </View>

            {newPassword.length > 0 && (
                <View style={styles.passwordRequirements}>
                    <Text style={[styles.requirementText, passwordRequirements.length ? styles.requirementMet : styles.requirementNotMet]}>
                        ✓ At least 8 characters
                    </Text>
                    <Text style={[styles.requirementText, passwordRequirements.uppercase ? styles.requirementMet : styles.requirementNotMet]}>
                        ✓ One uppercase letter
                    </Text>
                    <Text style={[styles.requirementText, passwordRequirements.lowercase ? styles.requirementMet : styles.requirementNotMet]}>
                        ✓ One lowercase letter
                    </Text>
                    <Text style={[styles.requirementText, passwordRequirements.number ? styles.requirementMet : styles.requirementNotMet]}>
                        ✓ One number
                    </Text>
                    <Text style={[styles.requirementText, passwordRequirements.special ? styles.requirementMet : styles.requirementNotMet]}>
                        ✓ One special character
                    </Text>
                </View>
            )}
            
            {error && <Text style={styles.error}>{error}</Text>}
            {success && <Text style={styles.success}>{success}</Text>}
            
            <Pressable 
                style={[styles.button, (!isPasswordValid || !passwordsMatch || !effectiveToken) && { opacity: 0.6 }]} 
                onPress={handleResetPassword} 
                disabled={loading || !isPasswordValid || !passwordsMatch || !effectiveToken}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>RESET PASSWORD</Text>}
            </Pressable>
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
}























