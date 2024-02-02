import mongoose from "mongoose";

const todoProfileSchema = new mongoose.Schema({
    currentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    userName: {
        type: String,
        trim: true,
        unique: true
    },
    assigned: [{
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Todo",
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TodoProfile",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TodoProfile",
        }
    }],
    completedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo"
    },
    pendingTasks: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo"
    },
    actvityLog: [{
        title: {
            type: String,
            required: true,
            trim: true,
        },
        currentTime: {
            type: Date,
            default: Date.now
        },
        activityItem: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            model: {
                type: String,
                required: true,
                enum: ["Todo", "TodoProfile"]
            }
        }
    }]
}, { timestamps: true });
const TodoProfile = mongoose.models.TodoProfile || mongoose.model("Todoprofile", todoProfileSchema);
export { TodoProfile }

