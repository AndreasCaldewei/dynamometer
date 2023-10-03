import { Dynamometer } from '../src/Dynamometer';

interface User {
  username: string;
}

interface Todo {
  text: string;
}

const db = Dynamometer.create({
  tableName: 'test',
});

const userCol = () => db.collection<User>('USERS');
const todoCol = (userId: string) =>
  userCol().doc(userId).collection<Todo>('TODOS');

// USER
export const getUsers = () => {
  return userCol().get();
};

export const getUserById = (userId: string) => {
  return userCol().doc(userId).get();
};

export const createUser = (user: User) => {
  return userCol().add(user);
};

export const updateUser = (userId: string, user: User) => {
  return userCol().doc(userId).update(user);
};

export const deleteUser = (userId: string) => {
  return userCol().doc(userId).delete();
};

// TODOS

export const getTodosForUser = (userId: string) => {
  return todoCol(userId).get();
};

export const getTodoForUser = (userId: string, todoId: string) => {
  return todoCol(userId).doc(todoId).get();
};

export const createTodo = (userId: string, todo: Todo) => {
  return todoCol(userId).add(todo);
};

export const updateTodo = (userId: string, todoId: string, todo: Todo) => {
  return todoCol(userId).doc(todoId).update(todo);
};

export const deleteTodo = (userId: string, todoId: string) => {
  return todoCol(userId).doc(todoId).delete();
};
