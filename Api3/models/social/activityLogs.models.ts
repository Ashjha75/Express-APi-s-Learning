import mongoose,{Schema} from "mongoose";
const activityLogsSchema = new Schema({
    type:{
        type: String,
        enum:["POST", "COMMENT", "LIKE", "SHARE", "FOLLOW","TAG","IMPRESSION"],
        required: [true, "Activity type is required"],
    },
    sender:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Sender is required"],
    },
    reciever:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Reciever is required"],
    },
    post:{
        type: Schema.Types.ObjectId,
        ref: "Post",
    },
    read:{
        type: Boolean,
        default: false,
    }
},{timestamps: true});
const ActivityLogs =mongoose.models.ActivityLogs ||  mongoose.model("ActivityLogs", activityLogsSchema);
export default ActivityLogs;
