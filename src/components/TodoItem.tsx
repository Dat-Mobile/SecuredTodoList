import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {Todo} from '@/store/todoStore';

type Props = {
  item: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export default function TodoItem({
  item,
  onToggle,
  onEdit,
  onDelete,
  disabled,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        {borderColor: item.done ? '#3DDC84' : '#263241'},
      ]}>
      <Text
        style={[
          styles.title,
          {
            color: item.done ? '#A3F7BF' : '#E6EEF8',
            textDecorationLine: item.done ? 'line-through' : 'none',
          },
        ]}>
        {item.title}
      </Text>
      <View style={styles.actionRow}>
        <Pressable onPress={onToggle} disabled={disabled}>
          <Text style={{color: disabled ? '#6B7280' : '#60A5FA'}}>
            {item.done ? 'Undo' : 'Done'}
          </Text>
        </Pressable>
        <Pressable onPress={onEdit} disabled={disabled}>
          <Text style={{color: disabled ? '#6B7280' : '#FBBF24'}}>Edit</Text>
        </Pressable>
        <Pressable onPress={onDelete} disabled={disabled}>
          <Text style={{color: disabled ? '#6B7280' : '#F87171'}}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f2542ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
