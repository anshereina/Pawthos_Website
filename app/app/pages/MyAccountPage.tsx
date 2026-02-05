import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Dimensions, SafeAreaView, Modal, TextInput } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getUserProfile, getCurrentUser, updateStoredUser, isAuthenticated, updateUserProfile, changePassword } from '../../utils/auth.utils';
import EditProfileModal from '../modals/EditProfileModal';
import { API_BASE_URL } from '../../utils/config';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF' 
    },
    content: { 
        flex: 1, 
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    // Modern Profile Header Card
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F8F0',
        position: 'relative',
        overflow: 'hidden',
    },
    profileGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#045b26',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
    },
    avatarContainer: { 
        position: 'relative', 
        marginRight: 20 
    },
    avatar: { 
        width: 70, 
        height: 70, 
        borderRadius: 35, 
        backgroundColor: '#E8F5E8',
        borderWidth: 2,
        borderColor: '#F0F8F0',
    },
    editAvatarBtn: { 
        position: 'absolute', 
        bottom: 0, 
        right: 0, 
        backgroundColor: '#045b26', 
        borderRadius: 14, 
        width: 28, 
        height: 28, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF'
    },
    profileInfo: {
        flex: 1,
    },
    name: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#045b26',
        fontFamily: 'Jumper',
        marginBottom: 2,
    },
    email: { 
        fontSize: 14, 
        color: '#666',
        fontFamily: 'Flink',
        marginBottom: 8,
    },
    editBtn: { 
        backgroundColor: '#045b26', 
        borderRadius: 10, 
        paddingVertical: 8, 
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    editBtnText: { 
        color: '#FFFFFF', 
        fontWeight: 'bold',
        fontFamily: 'Jumper',
        fontSize: 12,
    },
    // Modern Info Cards
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F8F0',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#F8FFF8',
        borderRadius: 10,
        marginBottom: 8,
    },
    infoItemIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    infoItemText: {
        fontSize: 14,
        color: '#045b26',
        fontFamily: 'Flink',
        flex: 1,
    },
    infoItemTextEmpty: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'Flink',
        fontStyle: 'italic',
        flex: 1,
    },
    // Settings Items
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#F8FFF8',
        borderRadius: 10,
        marginBottom: 8,
    },
    settingsItemIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    settingsItemText: {
        fontSize: 14,
        color: '#045b26',
        fontFamily: 'Flink',
        flex: 1,
    },
    settingsItemArrow: {
        marginLeft: 8,
    },
    // Loading and Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontFamily: 'Flink',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFE8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#DC3545',
        fontFamily: 'Jumper',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Flink',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryBtn: {
        backgroundColor: '#045b26',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
    },
    retryBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Jumper',
    },
    // Password modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 12,
        fontFamily: 'Jumper',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        marginBottom: 10,
    },
    modalInputWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    modalInputWithIcon: {
        paddingRight: 40,
        marginBottom: 0,
    },
    modalEyeButton: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalActionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalPrimaryButton: {
        backgroundColor: '#045b26',
    },
    modalSecondaryButton: {
        backgroundColor: '#e6f3ea',
    },
    modalButtonText: {
        color: '#045b26',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Jumper',
    },
    modalPrimaryButtonText: {
        color: '#fff',
    },
});

interface MyAccountPageProps {
    onUserDataUpdate?: () => void;
}

export default function MyAccountPage({ onUserDataUpdate }: MyAccountPageProps = {}) {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPasswordInput, setCurrentPasswordInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState('');
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Check if user is authenticated
            const isAuth = await isAuthenticated();
            console.log('Is authenticated:', isAuth);
            
            // First try to get from local storage (faster)
            const localUser = await getCurrentUser();
            console.log('Local user data:', localUser);
            if (localUser) {
                setUserData(localUser);
            }
            
            // Then fetch fresh data from backend
            const result = await getUserProfile();
            console.log('=== MYACCOUNT DEBUG ===');
            console.log('Backend result:', result);
            console.log('Local user:', localUser);
            
            // Check if result has user data (id, email, name, etc.)
            if (result && typeof result === 'object' && 'id' in result && 'email' in result) {
                // The backend returns user data directly in the response
                console.log('Setting user data:', result);
                setUserData(result);
                // Update local storage with fresh data
                await updateStoredUser(result);
            } else if (result && typeof result === 'object' && 'success' in result && result.success === false) {
                console.log('Backend failed:', result.message);
                if (!localUser) {
                    setError(result.message || 'Failed to load profile');
                }
            } else {
                console.log('Unexpected response format:', result);
                if (!localUser) {
                    setError('Invalid response from server');
                }
            }
        } catch (err) {
            console.error('Load profile error:', err);
            if (!userData) {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserProfile();
    }, []);

    const handleEditProfile = () => {
        setEditModalVisible(true);
    };

    const handleUpdateProfile = async (updatedData: any) => {
        try {
            setUpdating(true);
            
            console.log('Updating profile with data:', updatedData);
            
            // Call the API to update the profile
            const result = await updateUserProfile(updatedData);
            
            console.log('Update result:', result);
            
            if (result.success) {
                // The updateUserProfile function already stores the updated data
                // Now just fetch it to update the UI
                console.log('✅ Profile update successful!');
                console.log('📸 Updated user from result:', JSON.stringify(result.user, null, 2));
                
                if (result.user) {
                    // Use the user data returned from the update API
                    console.log('🔄 Setting userData with photo_url:', result.user.photo_url);
                    setUserData(result.user);
                } else {
                    // Fallback: fetch fresh data from the server
                    console.log('⚠️ No user in result, fetching fresh data...');
                    const freshUserData = await getCurrentUser();
                    console.log('📥 Fresh user data:', JSON.stringify(freshUserData, null, 2));
                    
                    if (freshUserData) {
                        setUserData(freshUserData);
                    }
                }
                
                // Notify parent component to refresh its user data (for header, etc.)
                if (onUserDataUpdate) {
                    console.log('🔔 Calling onUserDataUpdate to refresh parent component');
                    onUserDataUpdate();
                }
                
                // Close modal
                setEditModalVisible(false);
                
                Alert.alert('Success', 'Profile updated successfully!');
            } else {
                console.log('❌ Profile update failed:', result.message);
                Alert.alert('Error', result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const resetPasswordModal = () => {
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
    };

    const handleChangePassword = () => {
        resetPasswordModal();
        setPasswordModalVisible(true);
    };

    const handleSubmitPasswordChange = async () => {
        if (!currentPasswordInput.trim()) {
            Alert.alert('Error', 'Please enter your current password.');
            return;
        }
        if (!newPasswordInput.trim()) {
            Alert.alert('Error', 'Please enter a new password.');
            return;
        }
        if (newPasswordInput.trim().length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters.');
            return;
        }
        if (newPasswordInput.trim() !== confirmPasswordInput.trim()) {
            Alert.alert('Error', 'New password and confirmation do not match.');
            return;
        }

        try {
            setChangingPassword(true);
            const result = await changePassword(currentPasswordInput.trim(), newPasswordInput.trim());
            if (result.success) {
                Alert.alert('Success', result.message || 'Password updated successfully.');
                setPasswordModalVisible(false);
                resetPasswordModal();
            } else {
                Alert.alert('Error', result.message || 'Failed to change password.');
            }
        } catch (err) {
            console.error('Change password error:', err);
            Alert.alert('Error', 'Failed to change password. Please try again.');
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !userData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <MaterialIcons name="error-outline" size={40} color="#DC3545" />
                    </View>
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadUserProfile}>
                        <Text style={styles.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Modern Profile Header Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileGradient} />
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            {userData?.photo_url ? (
                                <Image 
                                    key={userData.photo_url}
                                    source={{ 
                                        uri: (() => {
                                            const baseUrl = userData.photo_url.startsWith('http') 
                                                ? userData.photo_url 
                                                : `${API_BASE_URL.replace('/api', '')}${userData.photo_url}`;
                                            const finalUrl = baseUrl + `?t=${Date.now()}`;
                                            console.log('🖼️ Loading profile image from:', finalUrl);
                                            console.log('📦 userData.photo_url:', userData.photo_url);
                                            console.log('🌐 API_BASE_URL:', API_BASE_URL);
                                            return finalUrl;
                                        })()
                                    }} 
                                    style={styles.avatar}
                                    defaultSource={require('../../assets/images/icon.png')}
                                    onError={(error) => {
                                        console.log('❌ Error loading profile image:', error);
                                        console.log('🔗 Attempted URL:', userData.photo_url.startsWith('http') 
                                            ? userData.photo_url 
                                            : `${API_BASE_URL.replace('/api', '')}${userData.photo_url}`);
                                    }}
                                    onLoad={() => {
                                        console.log('✅ Profile image loaded successfully!');
                                    }}
                                />
                            ) : (
                                <Image 
                                    source={require('../../assets/images/icon.png')} 
                                    style={styles.avatar}
                                />
                            )}
                            <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditProfile}>
                                <MaterialIcons name="camera-alt" size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>{userData?.name || 'User Name'}</Text>
                            <Text style={styles.email}>{userData?.email || 'user@email.com'}</Text>
                            <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
                                <Text style={styles.editBtnText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                {/* Account Information Card */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <MaterialCommunityIcons name="account-circle" size={16} color="#045b26" />
                        </View>
                        <Text style={styles.cardTitle}>Account Information</Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                        <View style={styles.infoItemIcon}>
                            <MaterialIcons name="phone" size={16} color="#045b26" />
                        </View>
                        <Text style={userData?.phone_number ? styles.infoItemText : styles.infoItemTextEmpty}>
                            {userData?.phone_number || 'No phone number added'}
                        </Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                        <View style={styles.infoItemIcon}>
                            <MaterialIcons name="location-on" size={16} color="#045b26" />
                        </View>
                        <Text style={userData?.address ? styles.infoItemText : styles.infoItemTextEmpty}>
                            {userData?.address || 'No address added'}
                        </Text>
                    </View>
                </View>
                
                {/* Settings Card */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardIconContainer}>
                            <MaterialCommunityIcons name="cog" size={16} color="#045b26" />
                        </View>
                        <Text style={styles.cardTitle}>Settings</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.settingsItem} onPress={handleChangePassword}>
                        <View style={styles.settingsItemIcon}>
                            <MaterialIcons name="lock-outline" size={16} color="#045b26" />
                        </View>
                        <Text style={styles.settingsItemText}>Change Password</Text>
                        <MaterialIcons name="chevron-right" size={16} color="#045b26" style={styles.settingsItemArrow} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Change Password Modal */}
            <Modal
                transparent
                animationType="fade"
                visible={passwordModalVisible}
                onRequestClose={() => {
                    setPasswordModalVisible(false);
                    resetPasswordModal();
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Change Password</Text>
                        <View style={styles.modalInputWrapper}>
                            <TextInput
                                style={[styles.modalInput, styles.modalInputWithIcon]}
                                placeholder="Current password"
                                placeholderTextColor="#777"
                                value={currentPasswordInput}
                                onChangeText={setCurrentPasswordInput}
                                secureTextEntry={!showCurrentPassword}
                            />
                            <TouchableOpacity
                                style={styles.modalEyeButton}
                                onPress={() => setShowCurrentPassword((prev) => !prev)}
                            >
                                <MaterialIcons
                                    name={showCurrentPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#777"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalInputWrapper}>
                            <TextInput
                                style={[styles.modalInput, styles.modalInputWithIcon]}
                                placeholder="New password"
                                placeholderTextColor="#777"
                                value={newPasswordInput}
                                onChangeText={setNewPasswordInput}
                                secureTextEntry={!showNewPassword}
                            />
                            <TouchableOpacity
                                style={styles.modalEyeButton}
                                onPress={() => setShowNewPassword((prev) => !prev)}
                            >
                                <MaterialIcons
                                    name={showNewPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#777"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalInputWrapper}>
                            <TextInput
                                style={[styles.modalInput, styles.modalInputWithIcon]}
                                placeholder="Confirm new password"
                                placeholderTextColor="#777"
                                value={confirmPasswordInput}
                                onChangeText={setConfirmPasswordInput}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                style={styles.modalEyeButton}
                                onPress={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                <MaterialIcons
                                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                                    size={20}
                                    color="#777"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSecondaryButton, { marginRight: 8 }]}
                                onPress={() => {
                                    setPasswordModalVisible(false);
                                    resetPasswordModal();
                                }}
                                disabled={changingPassword}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalPrimaryButton,
                                    changingPassword && { opacity: 0.7 }
                                ]}
                                onPress={handleSubmitPasswordChange}
                                disabled={changingPassword}
                            >
                                <Text style={[styles.modalButtonText, styles.modalPrimaryButtonText]}>
                                    {changingPassword ? 'Updating...' : 'Update'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <EditProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={handleUpdateProfile}
                userData={userData}
                loading={updating}
            />
        </SafeAreaView>
    );
}

// Styles for password modal are appended below existing styles
