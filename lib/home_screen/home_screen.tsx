import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { FlatList, Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from 'react-native-loading-spinner-overlay';
import { showToast } from "./toast";
import { PersonModal } from "../common/PersonModal";
import DeleteBtnView from "./views/delete_button_view";

// ============================================================================
// TYPES
// ============================================================================
type Person = {
    id: string;
    name: string;
    age: number;
};

type PersonFormData = {
    name: string;
    age: string;
};

type ValidationErrors = {
    name?: string;
    age?: string;
};

type ModalState = {
    visible: boolean;
    data: PersonFormData;
    errors: ValidationErrors;
};

// ============================================================================
// CONSTANTS
// ============================================================================
const INITIAL_PERSONS: Person[] = [
    { id: "1", name: "Alice", age: 28 },
    { id: "2", name: "Bob", age: 34 },
    { id: "3", name: "Charlie", age: 22 },
    { id: "4", name: "Diana", age: 30 },
    { id: "5", name: "Eve", age: 25 },
];

const EMPTY_FORM_DATA: PersonFormData = { name: '', age: '' };
const EMPTY_ERRORS: ValidationErrors = {};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function HomeScreen() {
    // State management
    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

    const [editModal, setEditModal] = useState<ModalState>({
        visible: false,
        data: EMPTY_FORM_DATA,
        errors: EMPTY_ERRORS,
    });

    const [addModal, setAddModal] = useState<ModalState>({
        visible: false,
        data: EMPTY_FORM_DATA,
        errors: EMPTY_ERRORS,
    });

    // ========================================================================
    // LIFECYCLE
    // ========================================================================
    useEffect(() => {
        fetchPersons();
    }, []);

    // ========================================================================
    // DATA FETCHING
    // ========================================================================
    const fetchPersons = useCallback(() => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setPersons(INITIAL_PERSONS);
            setIsLoading(false);
        }, 1000);
    }, []);

    // ========================================================================
    // VALIDATION
    // ========================================================================
    const validatePerson = (data: PersonFormData): { isValid: boolean; errors: ValidationErrors } => {
        const errors: ValidationErrors = {};
        let isValid = true;

        if (!data.name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        }

        if (!data.age.trim()) {
            errors.age = 'Age is required';
            isValid = false;
        } else if (isNaN(Number(data.age)) || Number(data.age) <= 0) {
            errors.age = 'Age must be a positive number';
            isValid = false;
        }

        return { isValid, errors };
    };

    // ========================================================================
    // ADD PERSON
    // ========================================================================
    const openAddModal = useCallback(() => {
        setAddModal({
            visible: true,
            data: EMPTY_FORM_DATA,
            errors: EMPTY_ERRORS,
        });
    }, []);

    const handleAddChange = useCallback((field: 'name' | 'age', value: string) => {
        setAddModal(prev => ({
            ...prev,
            data: { ...prev.data, [field]: value },
        }));
    }, []);

    const handleAddConfirm = useCallback(() => {
        const { isValid, errors } = validatePerson(addModal.data);

        if (!isValid) {
            setAddModal(prev => ({ ...prev, errors }));
            return;
        }

        const newId = (Math.max(0, ...persons.map(p => Number(p.id))) + 1).toString();
        const newPerson: Person = {
            id: newId,
            name: addModal.data.name.trim(),
            age: Number(addModal.data.age),
        };

        setPersons(prev => [newPerson, ...prev]);
        setAddModal({ visible: false, data: EMPTY_FORM_DATA, errors: EMPTY_ERRORS });
        showToast('Person added successfully');
    }, [addModal.data, persons]);

    const closeAddModal = useCallback(() => {
        setAddModal({ visible: false, data: EMPTY_FORM_DATA, errors: EMPTY_ERRORS });
    }, []);

    // ========================================================================
    // EDIT PERSON
    // ========================================================================
    const openEditModal = useCallback((person: Person) => {
        setEditingPersonId(person.id);
        setEditModal({
            visible: true,
            data: {
                name: person.name,
                age: String(person.age),
            },
            errors: EMPTY_ERRORS,
        });
    }, []);

    const handleEditChange = useCallback((field: 'name' | 'age', value: string) => {
        setEditModal(prev => ({
            ...prev,
            data: { ...prev.data, [field]: value },
        }));
    }, []);

    const handleEditConfirm = useCallback(() => {
        if (!editingPersonId) return;

        const { isValid, errors } = validatePerson(editModal.data);

        if (!isValid) {
            setEditModal(prev => ({ ...prev, errors }));
            return;
        }

        setPersons(prev =>
            prev.map(person =>
                person.id === editingPersonId
                    ? {
                        ...person,
                        name: editModal.data.name.trim(),
                        age: Number(editModal.data.age),
                    }
                    : person
            )
        );

        setEditModal({ visible: false, data: EMPTY_FORM_DATA, errors: EMPTY_ERRORS });
        setEditingPersonId(null);
        showToast('Person updated successfully');
    }, [editingPersonId, editModal.data]);

    const closeEditModal = useCallback(() => {
        setEditModal({ visible: false, data: EMPTY_FORM_DATA, errors: EMPTY_ERRORS });
        setEditingPersonId(null);
    }, []);

    // ========================================================================
    // DELETE PERSON
    // ========================================================================
    const handleDelete = useCallback((id: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this person?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setPersons(prev => prev.filter(p => p.id !== id));
                        showToast('Person deleted successfully');
                    },
                },
            ]
        );
    }, []);

    // ========================================================================
    // RENDER FUNCTIONS
    // ========================================================================
    const renderPersonItem = useCallback(({ item }: { item: Person }) => {
        return (
            <Swipeable
                renderRightActions={() => (
                    <DeleteBtnView onPress={() => handleDelete(item.id)} />
                )}
            >
                <TouchableOpacity
                    style={styles.personItem}
                    onPress={() => openEditModal(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.personName}>{item.name}</Text>
                    <Text style={styles.personAge}>Age: {item.age}</Text>
                </TouchableOpacity>
            </Swipeable>
        );
    }, [handleDelete, openEditModal]);

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <View style={styles.container}>
            {/* Loading Spinner */}
            <Spinner
                visible={isLoading}
                textContent={'Loading...'}
                textStyle={styles.spinnerText}
            />

            {/* App Bar */}
            <View style={styles.appBar}>
                <SafeAreaView edges={['top']} style={{ paddingVertical: 24 }}>
                    <Text style={styles.appBarTitle}>Home</Text>
                </SafeAreaView>
            </View>

            {/* Person List */}
            <FlatList
                data={persons}
                keyExtractor={(item) => item.id}
                renderItem={renderPersonItem}
                contentContainerStyle={styles.listContent}
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={openAddModal}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            {/* Edit Modal */}
            <PersonModal
                visible={editModal.visible}
                title="Edit Person"
                name={editModal.data.name}
                age={editModal.data.age}
                errors={editModal.errors}
                onChange={handleEditChange}
                onCancel={closeEditModal}
                onConfirm={handleEditConfirm}
                confirmText="Save"
            />

            {/* Add Modal */}
            <PersonModal
                visible={addModal.visible}
                title="Add Person"
                name={addModal.data.name}
                age={addModal.data.age}
                errors={addModal.errors}
                onChange={handleAddChange}
                onCancel={closeAddModal}
                onConfirm={handleAddConfirm}
                confirmText="Add"
            />
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    appBar: {
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
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
        color: "#333",
    },
    personAge: {
        fontSize: 16,
        color: "#666",
        marginTop: 4,
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
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    fabIcon: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: -2,
    },
    spinnerText: {
        color: '#fff',
    },
});