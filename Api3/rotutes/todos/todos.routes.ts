import { Router } from "express";
import { createTodo, createTodoUser, deleteTodo, deleteTodoUser, getAllTodos, getTodoByID, updateTodo } from "../../controllers/todo/todo.controllers";



const todoRouter = Router();
todoRouter.route("/createTodoUser").post(createTodoUser);
todoRouter.route("/createTodo").post(createTodo);
todoRouter.route("/getTodoById/:TodoId").post(getTodoByID);
todoRouter.route("/updateTodo").patch(updateTodo);
todoRouter.route("/deleteTodo/:TodoId").delete(deleteTodo);
todoRouter.route("/deleteTodoUser/:TodoUser").delete(deleteTodoUser);
todoRouter.route("/getTodos").get(getAllTodos);




export { todoRouter };