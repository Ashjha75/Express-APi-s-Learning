import { Request,Response } from "express";
import { AuthRequest } from "../../utils/allIntrefaces";
import { asyncHandler } from "../../utils/errors/Asynchandler.errors";
import { ApiResponse } from "../../utils/errors/ApiResponse";
import SocialUserFeatures from "../../models/social/socialUserFeatures.models";
import { ApiError } from "../../utils/errors/ApiError";
import Post from "../../models/social/posts.models";
import { uploadOnCloudinary } from "../../utils/cloudinary/cloudinary.services";
import Like from "../../models/social/like.models";
import mongoose from "mongoose";


// Create the spocial user profile
const createSocialUserProfile = asyncHandler(async (req: AuthRequest, res: Response) =>{
    // collect alll the valid fields from the schema
    const validFields = Object.keys(SocialUserFeatures?.schema.obj)
    const updates = Object.keys(req.body);
    // check if the fields are valid
    const isValidOperation = updates.every((update)=> validFields.includes(update));
    if(!isValidOperation){
        return res.status(400).json(new ApiResponse(400, {}, "Invalid updates! keys"))
    }

    // create the social user profile
    const socialUserProfile = new SocialUserFeatures({
        ...req.body,
        currentUser: req?.user?.id
    })
    await socialUserProfile.save();
    return res.status(200).json(
        new ApiResponse(200, {socialUserProfile}, "Social user profile created"))
});

// create the post or comment of the social user
const createPost = asyncHandler(async (req: AuthRequest, res: Response) =>{
    // collect alll the valid fields from the schema
    let {text,imageUrl,  appearnce, parentPost} = req.body;
    if(!text){
        throw new ApiError(400, "Post content is required", [])
    }
    if (req?.files) {
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map(async (file :any) => {
            const result = await uploadOnCloudinary(file.path) as string;
            return result;
        });
    
        const results = await Promise.all(uploadPromises);
    
        // results now contains an array of URLs of the uploaded images
        imageUrl = results;
    }
    const currentSocialUser = await SocialUserFeatures.findOne({currentUser:req?.user?.id});
    const post =new Post({
        postOwner: currentSocialUser._id,
        postContent:{
            text,
            media:imageUrl
        },
        appearnce,
        parentPost
    });
    await post.save();
    return res.status(200).json(new ApiResponse(200, {post}, "Post created"))

});

// like a post
const likeUnlikePost = asyncHandler(async (req: AuthRequest, res: Response) =>{
    const {postId,like} = req.body;
    const currentUser = req?.user?.id;
    const post = await Post.findById(postId);
    if(!post){
        throw new ApiError(404, "Post not found", [])
    }
    if(!like){
        throw new ApiError(400, "Like field is required", [])
    }
   if(like){
       const likePost = new Like({
           likeBy:currentUser,
           post:postId
       });
       await likePost.save();
    return res.status(200).json(new ApiResponse(200, {likePost}, "Post liked"));
   }
   else{
         const likePost = await Like.findOneAndDelete({likeBy:currentUser,post:postId});
         if(!likePost){
             throw new ApiError(404, "Like not found", [])
         }
         return res.status(200).json(new ApiResponse(200, {likePost}, "Post unliked"));
   }
}
);

// get all the posts
const getAllPosts = asyncHandler(async (req: AuthRequest, res: Response) =>{
    const post=false
    const pipeline=[
        
        {
            $lookup: {
                from: 'socialuserfeatures',
                localField: 'postOwner',
                foreignField: '_id',
                as: 'postOwner'
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'post',
                as: 'likes'
            }
        },
        {
            $lookup: {
                from: 'posts',
                localField: '_id',
                foreignField: 'parentPost',
                as: 'comments'
            }
        },
        {
            $project: {
                _id: 1,
                postContent: 1,
                postOwner: 1,
                likesCount: { $size: '$likes' },
                commentsCount: { $size: '$comments' },
            }
        },
    ]
    const posts = await Post.aggregate(pipeline);
    return res.status(200).json(new ApiResponse(200, {posts}, "Posts fetched"));
});

// get a post by ID
const getPostById = asyncHandler(async (req:AuthRequest,res:Response)=>{
    const {postID}=req.params;
    if(!postID){
        throw new ApiError(404,"Post ID is required to get Post",[])
    }
    let pipeline=[
        {
            $match: { _id: new mongoose.Types.ObjectId(postID) }
        },
        {
            $lookup: {
                from: 'socialuserfeatures',
                localField: 'postOwner',
                foreignField: '_id',
                as: 'postOwner'
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'post',
                as: 'likes'
            }
        },
        {
            $lookup: {
                from: 'posts',
                localField: '_id',
                foreignField: 'parentPost',
                as: 'comments'
            }
        },
        {
            $project: {
                _id: 1,
                postContent: 1,
                postOwner: 1,
                comments:1,
                likesCount: { $size: '$likes' },
                commentsCount: { $size: '$comments' },
            }
        },
    ]
    const post = await Post.aggregate(pipeline);
    if(!post){
        throw new ApiError(404,"Post not found",[])
    }
    return res.status(200).json(new ApiResponse(200, {post}, "Post fetched"));
})
// get the User Profile
const getUserProfile =asyncHandler(async (req:AuthRequest,res:Response)=>{
    const {userID}=req.params;
    if(!userID){
        throw new ApiError(404,"User ID is required to get User Profile",[])
    }
    let pipeline=[
        {$match: {_id: new mongoose.Types.ObjectId(userID)}},
       { $lookup: {
            from: 'users',
            localField: 'currentUser',
            foreignField: '_id',
            as: 'currentUser'
        }},
        {$unwind: '$currentUser'},
        
        {
            $project: {
                _id: 1,
                location: 1,
                bio: 1,
                website: 1,
                coverPhoto: 1,
                accountType: 1,
                pinnedPosts: 1,
                premiumUser: 1,
                'currentUser._id': 1,
                'currentUser.userName': 1,
                'currentUser.email': 1,
                'currentUser.avatar': 1,
                'currentUser.roles': 1,
                'currentUser.onboarded': 1,
                'currentUser.isEmailVerified': 1
            }
        }
    ]
    const userProfile = await SocialUserFeatures.aggregate(pipeline);
    if(!userProfile){
        throw new ApiError(404,"User Profile not found",[])
    }
    return res.status(200).json(new ApiResponse(200, {userProfile}, "User Profile fetched"));
});
// folow and unfollow the user


export { createSocialUserProfile,createPost,likeUnlikePost ,getAllPosts,getPostById,getUserProfile}