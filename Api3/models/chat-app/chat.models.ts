
import mongoose, { Schema } from "mongoose"

const chatSchema = new Schema({
    isGroupChat: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    admin: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    members: [{
        type: mongoose.Types.ObjectId,
        ref: "User",
    }],
    lastMessage: {
        type: mongoose.Types.ObjectId,
        ref: "ChatMessages",
    },



}, { timestamps: true });

const chatSchemas = mongoose.models.chatSchemass || mongoose.model("chatSchemas", chatSchema);
export { chatSchemas };