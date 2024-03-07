import mongoose,{Schema} from "mongoose";
const likeSchema = new Schema({
    likeBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:[true,"Like by is required"],
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:"Post",
        required:[true,"Post is required"],
    }
},{timestamps:true});
const Like=mongoose.models.Like || mongoose.model("Like",likeSchema);
export default Like;