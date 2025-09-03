import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import TodoScreen from '../src/screens/TodoScreen';
import * as authUtils from '../src/utils/auth';
import {useTodoStore} from '../src/store/todoStore';

jest.mock('../src/utils/auth');
jest.mock('../src/store/todoStore');

const mockTodos = [
  {id: '1', title: 'Test 1', done: false},
  {id: '2', title: 'Test 2', done: true},
];

describe('TodoScreen', () => {
  beforeEach(() => {
    (useTodoStore as unknown as jest.Mock).mockReturnValue({
      todos: mockTodos,
      isUnlocked: true,
      unlock: jest.fn(),
      lock: jest.fn(),
      addTodo: jest.fn(),
      updateTodo: jest.fn(),
      removeTodo: jest.fn(),
      toggleDone: jest.fn(),
    });
    (authUtils.requestAuth as jest.Mock).mockResolvedValue(true);
  });

  it('renders title and todos', () => {
    const {getByText} = render(<TodoScreen />);
    expect(getByText('Secured TODO List')).toBeTruthy();
    expect(getByText('Test 1')).toBeTruthy();
    expect(getByText('Test 2')).toBeTruthy();
  });

  it('disables add button when locked', () => {
    (useTodoStore as unknown as jest.Mock).mockReturnValue({
      ...useTodoStore(),
      isUnlocked: false,
    });
    const {getByText} = render(<TodoScreen />);
    const addBtn = getByText('Add');
    expect(addBtn).toBeDisabled();
  });

  it('calls addTodo when adding a new todo', () => {
    const addTodo = jest.fn();
    (useTodoStore as unknown as jest.Mock).mockReturnValue({
      ...useTodoStore(),
      addTodo,
      isUnlocked: true,
    });
    const {getByPlaceholderText, getByText} = render(<TodoScreen />);
    const input = getByPlaceholderText('New TODO…');
    fireEvent.changeText(input, 'New Task');
    fireEvent.press(getByText('Add'));
    expect(addTodo).toHaveBeenCalledWith('New Task');
  });

  it('shows lock/unlock button and toggles state', async () => {
    const lock = jest.fn();
    const unlock = jest.fn();
    (useTodoStore as unknown as jest.Mock).mockReturnValue({
      ...useTodoStore(),
      isUnlocked: true,
      lock,
      unlock,
    });
    const {getByText} = render(<TodoScreen />);
    fireEvent.press(getByText('Lock'));
    expect(lock).toHaveBeenCalled();
  });

  it('calls requestAuth when unlocking', async () => {
    const unlock = jest.fn();
    (useTodoStore as unknown as jest.Mock).mockReturnValue({
      ...useTodoStore(),
      isUnlocked: false,
      unlock,
    });
    (authUtils.requestAuth as jest.Mock).mockResolvedValue(true);
    const {getByText} = render(<TodoScreen />);
    fireEvent.press(getByText('Unlock'));
    await waitFor(() => expect(unlock).toHaveBeenCalled());
  });
});
