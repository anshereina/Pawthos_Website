import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ConfirmLogoutModalProps = {
	visible: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	title?: string;
	message?: string;
};

export default function ConfirmLogoutModal({ visible, onConfirm, onCancel, title = 'Confirm Logout', message = 'Are you sure you want to log out?' }: ConfirmLogoutModalProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onCancel}
		>
			<View style={styles.overlay}>
				<View style={styles.container}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.message}>{message}</Text>
					<View style={styles.actions}>
						<TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
							<Text style={styles.cancelText}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
							<Text style={styles.confirmText}>Log out</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
	},
	container: {
		width: '100%',
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 20,
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#111',
		marginBottom: 8,
		textAlign: 'center',
	},
	message: {
		fontSize: 15,
		color: '#444',
		textAlign: 'center',
		marginBottom: 16,
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	button: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	cancel: {
		borderWidth: 1,
		borderColor: '#ddd',
		marginRight: 8,
		backgroundColor: '#fff',
	},
	confirm: {
		marginLeft: 8,
		backgroundColor: '#b71c1c',
	},
	cancelText: { color: '#333', fontWeight: '600' },
	confirmText: { color: '#fff', fontWeight: '700' },
});
