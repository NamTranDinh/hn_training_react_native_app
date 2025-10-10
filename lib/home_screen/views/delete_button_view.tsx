import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';

const DeleteBtnView = ({ onPress }: { onPress: () => void }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.deleteButton, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};


const styles = StyleSheet.create({
    deleteButton: {
        backgroundColor: '#f44336',
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        borderRadius: 8,
        marginLeft: 16,
        marginBottom: 12,
        alignSelf: 'stretch',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});


export default DeleteBtnView;
