import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  Keyboard,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import {useTodoStore} from '@/store/todoStore';
import TodoItem from '@/components/TodoItem';
import {requestAuth} from '@/utils/auth';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getOSVersion} from '@/native/OSVersion';

export default function TodoScreen() {
  const {
    todos,
    isUnlocked,
    unlock,
    lock,
    addTodo,
    updateTodo,
    removeTodo,
    toggleDone,
  } = useTodoStore();
  const [input, setInput] = useState('');
  const [osVersion, setOSVersion] = useState<string>('');
  // State for Android edit modal
  const [editModal, setEditModal] = useState<{
    visible: boolean;
    id: string | null;
    value: string;
  }>({visible: false, id: null, value: ''});

  useEffect(() => {
    getOSVersion()
      .then(setOSVersion)
      .catch(err => {
        setOSVersion('');
      });
  }, []);

  const tryUnlock = async () => {
    const ok = await requestAuth('Authenticate to unlock editing');
    if (ok) {
      unlock();
    } else {
      Alert.alert(
        'Authentication failed',
        'You must authenticate to modify TODOs.',
      );
    }
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    addTodo(input);
    setInput('');
  };

  const handleEdit = (id: string) => {
    if (Platform.OS === 'ios') {
      Alert.prompt('Edit TODO', 'Update the title', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Save',
          onPress: text => {
            if (typeof text === 'string') updateTodo(id, text.trim());
          },
        },
      ]);
    } else {
      // For Android, show custom modal
      const todo = todos.find(t => t.id === id);
      setEditModal({visible: true, id, value: todo ? todo.title : ''});
    }
  };

  const handleEditSave = () => {
    if (editModal.id && editModal.value.trim()) {
      updateTodo(editModal.id, editModal.value.trim());
    }
    setEditModal({visible: false, id: null, value: ''});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Secured TODO List</Text>
      <Text style={styles.osVersion}>{osVersion + ' (Native Module)'}</Text>

      <View
        style={[
          styles.inputPanel,
          {borderColor: isUnlocked ? '#10B981' : '#374151'},
        ]}>
        <Text style={styles.inputPanelDesc}>
          {isUnlocked
            ? 'Unlocked: You can add, edit, toggle, and delete TODOs.'
            : 'Locked: Authenticate to modify TODOs.'}
        </Text>
        <View style={styles.inputRow}>
          <Pressable
            onPress={isUnlocked ? lock : tryUnlock}
            style={[
              styles.lockBtn,
              {backgroundColor: isUnlocked ? '#EF4444' : '#10B981'},
            ]}>
            <Text style={styles.lockBtnText}>
              {isUnlocked ? 'Lock' : 'Unlock'}
            </Text>
          </Pressable>
          <TextInput
            placeholder="New TODO…"
            placeholderTextColor="#6B7280"
            value={input}
            onChangeText={setInput}
            style={styles.input}
            editable={isUnlocked}
          />
          <Pressable
            onPress={handleAdd}
            disabled={!isUnlocked || !input.trim()}
            style={[
              styles.addBtn,
              {
                backgroundColor:
                  !isUnlocked || !input.trim() ? '#374151' : '#3B82F6',
              },
            ]}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        onScrollEndDrag={Keyboard.dismiss}
        renderItem={({item}) => (
          <TodoItem
            item={item}
            onToggle={() => toggleDone(item.id)}
            onEdit={() => handleEdit(item.id)}
            onDelete={() => removeTodo(item.id)}
            disabled={!isUnlocked}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No TODOs yet — add something when unlocked.
          </Text>
        }
      />

      {/* Edit Modal for Android, Alert.prompt for iOS */}
      <Modal
        visible={editModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setEditModal({visible: false, id: null, value: ''})
        }>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit TODO</Text>
            <Text style={styles.modalSubtitle}>Update the title</Text>
            <TextInput
              value={editModal.value}
              onChangeText={text => setEditModal(m => ({...m, value: text}))}
              style={styles.modalInput}
              autoFocus
              placeholder="Edit TODO..."
              placeholderTextColor="#6B7280"
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() =>
                  setEditModal({visible: false, id: null, value: ''})
                }
                style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleEditSave}
                disabled={!editModal.value.trim()}
                style={[
                  styles.modalSaveBtn,
                  {
                    backgroundColor: !editModal.value.trim()
                      ? '#374151'
                      : '#3B82F6',
                  },
                ]}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#0B0F13',
  },
  title: {
    color: '#E6EEF8',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  osVersion: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 10,
  },
  inputPanel: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  inputPanelDesc: {
    color: '#9CA3AF',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  lockBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  lockBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#E6EEF8',
    padding: 10,
    borderRadius: 10,
    borderColor: '#1F2937',
    borderWidth: 1,
  },
  addBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    color: '#E6EEF8',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalSubtitle: {
    color: '#9CA3AF',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#0F172A',
    color: '#E6EEF8',
    padding: 10,
    borderRadius: 8,
    borderColor: '#374151',
    borderWidth: 1,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#9CA3AF',
  },
  modalSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalSaveText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 12,
  },
});
