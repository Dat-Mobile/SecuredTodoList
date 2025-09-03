import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Todo = {
  id: string;
  title: string;
  done: boolean;
};

type State = {
  todos: Todo[];
  isUnlocked: boolean;
};

type Actions = {
  unlock: () => void;
  lock: () => void;
  addTodo: (title: string) => void;
  updateTodo: (id: string, title: string) => void;
  toggleDone: (id: string) => void;
  removeTodo: (id: string) => void;
};

/**
 * Wraps a function and ensures it only executes if the provided `isUnlocked` predicate returns `true`.
 * If the app is locked (`isUnlocked` returns `false`), the function call is blocked and a warning is logged.
 *
 * @typeParam T - The type of the function to be guarded.
 * @param fn - The function to be guarded.
 * @param isUnlocked - A function that returns `true` if the app is unlocked and the operation should proceed.
 * @returns A new function with the same signature as `fn` that checks the lock state before executing.
 */
function guardUnlocked<T extends (...args: any[]) => void>(
  fn: T,
  isUnlocked: () => boolean,
): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: any[]) => {
    if (!isUnlocked()) {
      console.warn('Operation blocked: app is locked');
      return;
    }
    fn(...args);
  }) as T;
}

/**
 * Zustand store hook for managing a secured todo list with lock/unlock functionality.
 *
 * - Todos are only mutable when `isUnlocked` is `true`.
 * - Mutating actions (`addTodo`, `updateTodo`, `toggleDone`, `removeTodo`) are guarded and will not execute if the store is locked.
 * - Lock state (`isUnlocked`) is not persisted; only the todos are stored.
 * - Uses `AsyncStorage` for persistence under the key `'secured-todo-store'`.
 *
 * @returns Zustand store API with state and actions for secured todo management.
 */
export const useTodoStore = create<State & Actions>()(
  persist(
    (set, get) => {
      const core = {
        unlock: () => set({isUnlocked: true}),
        lock: () => set({isUnlocked: false}),
        addTodo: (title: string) =>
          set(s => ({
            todos: [
              ...s.todos,
              {id: String(Date.now()), title: title.trim(), done: false},
            ],
          })),
        updateTodo: (id: string, title: string) =>
          set(s => ({
            todos: s.todos.map(t => (t.id === id ? {...t, title} : t)),
          })),
        toggleDone: (id: string) =>
          set(s => ({
            todos: s.todos.map(t => (t.id === id ? {...t, done: !t.done} : t)),
          })),
        removeTodo: (id: string) =>
          set(s => ({todos: s.todos.filter(t => t.id !== id)})),
      };

      // Wrap mutating actions with an "isUnlocked" guard
      const guarded = {
        addTodo: guardUnlocked(core.addTodo, () => get().isUnlocked),
        updateTodo: guardUnlocked(core.updateTodo, () => get().isUnlocked),
        toggleDone: guardUnlocked(core.toggleDone, () => get().isUnlocked),
        removeTodo: guardUnlocked(core.removeTodo, () => get().isUnlocked),
      };

      return {
        todos: [],
        isUnlocked: false,
        unlock: core.unlock,
        lock: core.lock,
        ...guarded,
      };
    },
    {
      name: 'secured-todo-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({todos: state.todos}), // don't persist lock state
    },
  ),
);
