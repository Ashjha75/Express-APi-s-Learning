import mongoose,{ Schema} from "mongoose";

const postSchema = new Schema({
    postOwner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Post owner is required"],
    },
    postContent:{
        text:{
            type: String,
            required: [true, "Content is required"],
            trim: true,
        },
        media:[{
            type: String,
            trim: true,
        }]
    },
    tags:[{
        type: String,
        trim: true,
    }],
    hashTags:[{
        type: String,
        trim: true,
    }],
    appearnce:{
        type: String,
        enum: ["PUBLIC", "PRIVATE"],
        default: "PUBLIC",
    },
    // for comments
    parentPost:{
        type: Schema.Types.ObjectId,
        ref: "Post",
    }

}, {timestamps: true});

// TAGS AND HASHTAGS WILL BE ADDED FROM THE POST CONTENT
postSchema.pre("save",async function(next){
    if(this.isModified("postContent.text")){
        const tags = this.postContent?.text.split(" ").filter((tag)=> tag.includes("@") && tag.length > 2);
        const hashTags = this.postContent?.text.split(" ").filter((tag)=> tag.includes("#") && tag.length > 2);
        this.tags = [...new Set(tags)];
        this.hashTags = [...new Set(hashTags)];
        next();
    }
    return next();
});


const Post= mongoose.models.Post || mongoose.model("Post", postSchema);
export default Post;