import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation_types';
import Spinner from 'react-native-loading-spinner-overlay';


export default function LoginScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Login'>>();

    const [emailCtl, setEmail] = useState('admin');
    const [passwordCtl, setPassword] = useState('admin');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!emailCtl || !passwordCtl) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        // Set loading state
        setIsLoading(true);

        // Simulate API call with 1 second delay
        setTimeout(() => {
            // Example validation (you can replace with API call)
            if (emailCtl === 'admin' && passwordCtl === 'admin') {
                setIsLoading(false);
                navigation.replace('Home');
            } else {
                setIsLoading(false);
                Alert.alert('Error', 'Invalid credentials');
            }
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailCtl}
                onChangeText={setEmail}
                editable={!isLoading}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={passwordCtl}
                onChangeText={setPassword}
                editable={!isLoading}
            />
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.buttonText}>Log In</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => Alert.alert('Account', 'admin\nadmin')}
                disabled={isLoading}
            >
                <Text style={[styles.forgotText, isLoading && styles.textDisabled]}>
                    Forgot Password?
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        alignSelf: 'center',
    },
    input: {
        height: 50,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        height: 50,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#9E9E9E',
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotText: {
        color: '#007BFF',
        marginTop: 16,
        alignSelf: 'center',
    },
    textDisabled: {
        opacity: 0.5,
    },
});