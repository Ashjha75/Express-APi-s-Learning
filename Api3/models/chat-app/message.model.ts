import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({

    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sender is required"],
    },
    content: {
        type: String,
        required: [true, "Content is required"],
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: [true, "Chat is required"],
    },
    attachment: {
        type: [{
            url: String,
            localPath: String,
        },
        ],
        default: [],
    }
}, { timestamps: true });

const ChatMessages = mongoose.models.ChatMessages || mongoose.model("ChatMessages", messageSchema);