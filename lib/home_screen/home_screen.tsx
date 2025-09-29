
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from "react-native";
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "./toast";
import { PersonModal } from "../common/PersonModal";

const initialPersons = [
    { id: "1", name: "Alice", age: 28 },
    { id: "2", name: "Bob", age: 34 },
    { id: "3", name: "Charlie", age: 22 },
    { id: "4", name: "Diana", age: 30 },
    { id: "5", name: "Eve", age: 25 },
];

export default function HomeScreen() {
    const [persons, setPersons] = useState(initialPersons);
    const [modalVisible, setModalVisible] = useState(false);
    const [editPerson, setEditPerson] = useState<{ id: string; name: string; age: string } | null>(null);
    const [errors, setErrors] = useState<{ name?: string; age?: string }>({});
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newPerson, setNewPerson] = useState<{ name: string; age: string }>({ name: '', age: '' });
    const [addErrors, setAddErrors] = useState<{ name?: string; age?: string }>({});

    const openEditModal = (person: { id: string; name: string; age: number }) => {
        setEditPerson({ ...person, age: String(person.age) });
        setErrors({});
        setModalVisible(true);
    };

    const handleEditChange = (field: 'name' | 'age', value: string) => {
        if (!editPerson) return;
        setEditPerson({ ...editPerson, [field]: value });
    };

    const validate = (person: { name: string; age: string }, setErr: (e: any) => void) => {
        let valid = true;
        let newErrors: { name?: string; age?: string } = {};
        if (!person.name.trim()) {
            newErrors.name = 'Name is required';
            valid = false;
        }
        if (!person.age.trim()) {
            newErrors.age = 'Age is required';
            valid = false;
        } else if (isNaN(Number(person.age)) || Number(person.age) <= 0) {
            newErrors.age = 'Age must be a positive number';
            valid = false;
        }
        setErr(newErrors);
        return valid;
    };

    const handleEditConfirm = () => {
        if (!editPerson) return;
        if (!validate(editPerson, setErrors)) return;
        setPersons((prev) =>
            prev.map((p) =>
                p.id === editPerson.id
                    ? { ...p, name: editPerson.name.trim(), age: Number(editPerson.age) }
                    : p
            )
        );
        setModalVisible(false);
        showToast('Edit successful');
    };

    // Floating button handlers
    const openAddModal = () => {
        setNewPerson({ name: '', age: '' });
        setAddErrors({});
        setAddModalVisible(true);
    };

    const handleAddChange = (field: 'name' | 'age', value: string) => {
        setNewPerson({ ...newPerson, [field]: value });
    };

    const handleAddConfirm = () => {
        if (!validate(newPerson, setAddErrors)) return;
        setPersons((prev) => [
            {
                id: (Math.max(0, ...prev.map((p) => Number(p.id))) + 1).toString(),
                name: newPerson.name.trim(),
                age: Number(newPerson.age),
            },
            ...prev,
        ]);
        setAddModalVisible(false);
        showToast('Add successful');
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this person?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: () => setPersons((prev) => prev.filter((p) => p.id !== id)),
                },
            ]
        );
    };

    const renderRightActions = (id: string) => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(id)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.appBar}>
                <Text style={styles.appBarTitle}>Home</Text>
            </View>
            <FlatList
                data={persons}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                        <TouchableOpacity
                            style={styles.personItem}
                            onPress={() => openEditModal(item)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.personName}>{item.name}</Text>
                            <Text style={styles.personAge}>Age: {item.age}</Text>
                        </TouchableOpacity>
                    </Swipeable>
                )}
            />

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.8}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            {/* Edit Modal */}
            <PersonModal
                visible={modalVisible}
                title="Edit Person"
                name={editPerson?.name || ''}
                age={editPerson?.age || ''}
                errors={errors}
                onChange={handleEditChange}
                onCancel={() => setModalVisible(false)}
                onConfirm={handleEditConfirm}
                confirmText="Confirm"
            />

            {/* Add Modal */}
            <PersonModal
                visible={addModalVisible}
                title="Add Person"
                name={newPerson.name}
                age={newPerson.age}
                errors={addErrors}
                onChange={handleAddChange}
                onCancel={() => setAddModalVisible(false)}
                onConfirm={handleAddConfirm}
                confirmText="Add"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    appBar: {
        height: 56,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        marginBottom: 8,
    },
    appBarTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    listContent: {
        padding: 16,
    },
    personItem: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    personName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    personAge: {
        fontSize: 16,
        color: "#666",
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        alignSelf: 'center',
    },
    input: {
        height: 48,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    inputError: {
        borderColor: '#f44336',
    },
    errorText: {
        color: '#f44336',
        marginBottom: 8,
        fontSize: 13,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#bbb',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    fabIcon: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: -2,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: '90%',
        borderRadius: 8,
        marginVertical: 6,
        alignSelf: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
