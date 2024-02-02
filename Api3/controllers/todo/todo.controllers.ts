import { Todo } from "../../models/todos/todo.models";
import { Request, Response } from "express";
import { ApiError } from "../../utils/errors/ApiError";
import { asyncHandler } from "../../utils/errors/Asynchandler.errors";
import { AuthRequest } from "../../utils/allIntrefaces";
import { TodoProfile } from "../../models/todos/todoProfile.model";
import User from "../../models/auth/user.models";
import mongoose from "mongoose";

// Create a new todoUser
const createTodoUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user?.id);
    const newTodoUser = new TodoProfile({ userName: user.userName, currentUser: req.user?.id });
    await newTodoUser.save()
    res.status(201).json({
        success: true,
        message: "Todo User added successfully",
        data: newTodoUser
    });

})
// Get All Todos
const getAllTodos = asyncHandler(async (req: Request, res: Response) => {
    // take a data from req.query
    const queryParams = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pipeline = [];
    if (queryParams.title) {
        pipeline.push({
            $match: {
                title: {
                    $regex: queryParams.title,
                    $options: 'i'
                }
            }
        })
    }
    if (queryParams.assignedTo && typeof queryParams.assignedTo === 'string') {
        pipeline.push({
            $match: { assignedTo: new mongoose.Types.ObjectId(queryParams.assignedTo) }
        })
    }
    if (queryParams.isCompleted) {
        pipeline.push({
            $match: {
                isCompleted: queryParams.isCompleted === "true"
            }
        })
    }
    if (queryParams.priority) {
        pipeline.push({
            $match: {
                priority: {
                    $regex: queryParams.priority,
                    $options: 'i'
                }
            }
        })
    }
    if (queryParams.dueDate && typeof queryParams.dueDate === 'string') {
        pipeline.push({
            $match: {
                dueDate: {
                    $eq: new Date(queryParams.dueDate!)
                }
            }
        })
    }
    console.log(pipeline)
    const todos = await Todo.aggregate(pipeline)
    res.status(200).json({
        success: true,
        message: "Todos fetched successfully",
        data: todos
    });
})
// Create a new todo
const createTodo = asyncHandler(async (req: AuthRequest, res: Response) => {
    // take data from req.body
    // validate title and description


    let { title, description, assignedTo, priority, dueDate } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Provide all required fields", []);
    }
    const currentTodoUser = await TodoProfile.findOne({ currentUser: req.user?.id });
    if (!currentTodoUser) {
        throw new ApiError(404, "User not found", []);
    }
    let isValidUser = null;
    if (assignedTo) {
        isValidUser = await TodoProfile.findOne({ userName: assignedTo });
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
        createdBy: currentTodoUser._id,
        assignedTo,
    });

    await newTodo.save();

    if (isValidUser) {
        await isValidUser.assigned.push({
            task: newTodo._id,
            assignedBy: currentTodoUser?._id,
            assignedTo
        })
        await currentTodoUser.assigned.push({
            task: newTodo._id,
            assignedBy: currentTodoUser?._id,
            assignedTo
        })
        await isValidUser.save();
        await currentTodoUser.save();

    }
    res.status(201).json({
        success: true,
        message: "Todo added successfully",
        data: newTodo
    });

});
// Get Todo by it id
const getTodoByID = asyncHandler(async (req: Request, res: Response) => {
    // get id from params
    const { TodoId } = req.params
    if (!TodoId) {
        throw new ApiError(404, "Please provide Todo id", [])
    }
    // make a db call
    const TodoData = await Todo.findById(TodoId);
    // send response
    res.status(200).json({
        success: true,
        message: "Todo fetched successfully",
        data: TodoData
    })
})
const updateTodo = asyncHandler(async (req: Request, res: Response) => {
    // get the id of todo from body and other fields which needs to be updated
    const { id, ...updateBody } = req.body;

    // validate id
    if (!id) {
        throw new ApiError(400, "Id is required", []);
    }
    if (Object.keys(updateBody).length === 0) {
        throw new ApiError(400, "Nothing to update", []);
    };
    // make a db call
    const todo = await Todo.findById(id);
    console.log(todo.schema.paths)
    // Update the document
    for (let key in updateBody) {
        if (updateBody.hasOwnProperty(key) && todo.schema.paths.hasOwnProperty(key)) {
            todo[key] = updateBody[key];
        }
    }

    // Save the document
    const updatedTodo = await todo.save();

    res.status(200).json({
        success: true,
        message: "Todo Updated successfully",
        updatedTodo
    })


})
const deleteTodo = asyncHandler(async (req: Request, res: Response) => {
    const { TodoId } = req.params;
    if (!TodoId) {
        throw new ApiError(400, "Please provide id", [])
    }
    const todo = await Todo.findById(TodoId);
    if (!todo) {
        throw new ApiError(404, "Todo not found", [])
    }
    const createdBy = await TodoProfile.findById(todo.createdBy);
    const assignedTo = await TodoProfile.findById(todo.assignedTo);
    const indexOfCreated = createdBy.assigned.findIndex((assignment: any) => assignment.task.toString() === todo._id.toString());
    if (indexOfCreated > -1) {
        createdBy.assigned.splice(indexOfCreated, 1);
        await createdBy.save();
    }

    // Find the index of the task in assignedTo's assigned array
    const indexOfAssigned = assignedTo.assigned.findIndex((assignment: any) => assignment.task.toString() === todo._id.toString());
    if (indexOfAssigned > -1) {
        assignedTo.assigned.splice(indexOfAssigned, 1);
        await assignedTo.save();
    }
    await Todo.deleteOne({ _id: TodoId });
    res.status(200).json({
        success: true,
        message: "Todo deleted successfully",
        data1: createdBy,
        data2: assignedTo
    })
})
const deleteTodoUser = asyncHandler(async (req: Request, res: Response) => {
    const { TodoUser } = req.params;
    if (!TodoUser) {
        throw new ApiError(400, "Please Provide ID", [])
    }
    const deletedTodoUser = await TodoProfile.findOneAndDelete({ userName: TodoUser });
    if (!deletedTodoUser) {
        throw new ApiError(404, "User not found", [])
    }
    res.status(200).jsonp({
        success: true,
        message: `Successfully deleted ${TodoUser} `
    }
    )
})
export { createTodo, createTodoUser, getTodoByID, updateTodo, deleteTodo, deleteTodoUser, getAllTodos }

// TODO: need to make queue for activity log in every function