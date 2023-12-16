import { Todo } from "../../models/todos/todo.models";
import { Request, Response } from "express";
import { ApiError } from "../../utils/errors/ApiError";
import { asyncHandler } from "../../utils/errors/Asynchandler.errors";
import { AuthRequest } from "../../utils/allIntrefaces";
import { TodoProfile } from "../../models/todos/todoProfile.model";

// Create a new todoUser
const createTodoUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const newTodoUser = new TodoProfile({ user: req.user?.id });
    await newTodoUser.save()
    res.status(201).json({
        success: true,
        message: "Todo User added successfully",
        data: newTodoUser
    });

})

// Create a new todo
const createTodo = asyncHandler(async (req: AuthRequest, res: Response) => {
    // take data from req.body
    // validate title and description


    let { title, description, assignedTo, priority, dueDate, tags } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Provide all required fields", []);
    }
    const currentTodoUser = await TodoProfile.findOne({ user: req.user?.id });
    if (!currentTodoUser) {
        throw new ApiError(404, "User not found", []);
    }
    if (assignedTo) {
        const isValidUser = await TodoProfile.findOne({ username: assignedTo });
        if (!isValidUser) {
            throw new ApiError(404, "User not found", [])
        }
        assignedTo = isValidUser._id;
    }


    const newTodo = new Todo({
        title,
        description,
        priority,
        dueDate,
        tags,
        createdBy: currentTodoUser._id,
        assignedTo,
    });
    await newTodo.save();

    res.status(201).json({
        success: true,
        message: "Todo added successfully",
        data: newTodo
    });

});
export { createTodo, createTodoUser }