import mongoose,{Schema} from "mongoose";

const userRelationsSchema = new mongoose.Schema({
    // if i give an id of user i will get all the following of that user
    follower:{
        type:Schema.Types.ObjectId,
        ref:"SocialUserFeatures",
    },
    // if i give an id of user i will get all the followers of that user
    following:{
        type:Schema.Types.ObjectId,
        ref:"SocialUserFeatures",
    },
    notificationbell:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
const UserRelations = mongoose.models.UserRelations || mongoose.model("UserRelations", userRelationsSchema);
export default UserRelations;