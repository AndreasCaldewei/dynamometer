import { Dynamometer } from '../src/Dynamometer';

interface User {
  username: string;
}

const db = Dynamometer.create({
  tableName: 'test',
});

// USER
function createUserRepository() {
  const users = db.collection<User>('USER');

  function getUsers() {
    return users.get();
  }

  function getUserById(userId: string) {
    return users.doc(userId).get();
  }

  function createUser(user: User) {
    return users.doc().set(user);
  }

  function updateUser(userId: string, user: User) {
    return users.doc(userId).update(user);
  }

  function deleteUser(userId: string) {
    return users.doc(userId).delete();
  }

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
}

// TODOS

interface Todo {
  text: string;
}
function createTodoRepository(userId: string) {
  const todos = db
    .collection<User>('USER')
    .doc(userId)
    .collection<Todo>('TODO');

  function getTodosForUser() {
    return todos.get();
  }

  function getTodoForUser(todoId: string) {
    return todos.doc(todoId).get();
  }

  function createTodo(todo: Todo) {
    return todos.doc().set(todo);
  }

  function updateTodo(todoId: string, todo: Todo) {
    return todos.doc(todoId).update(todo);
  }

  function deleteTodo(todoId: string) {
    return todos.doc(todoId).delete();
  }

  return {
    getTodosForUser,
    getTodoForUser,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}
