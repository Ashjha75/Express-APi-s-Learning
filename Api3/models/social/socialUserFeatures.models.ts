import mongoose,{Schema} from "mongoose";

const socialUserFeaturesSchema = new Schema({
    currentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    location: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    website: {
        type: String,
        default: ""
    },
    birthDate: {
        type: Date
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    coverPhoto: {
        type: String,
        default: ""
    },
    accountType: {
        type: String,
        enum: ["PUBLIC", "PRIVATE"],
        default: "PUBLIC"
    },
    pinnedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    premiumUser: {
        type: Boolean,
        default: false
    },
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    reportedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    reportedPost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    totalProfileVisits: {
        type: Number,
        default: 0
    },
    verifiedEmail:{
        type: Boolean,
        default: false
    },
    verifiedPhone:{
        type: Boolean,
        default: false
    },
    
    
},{timestamps: true});

const SocialUserFeatures =mongoose.models.SocialUserFeatures || mongoose.model("SocialUserFeatures", socialUserFeaturesSchema);
export default SocialUserFeatures;