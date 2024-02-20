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
    // const posts = await Post.find().populate('postOwner');
    if(!post){
        {
            $match: { parentPost: { $exists: false } }
        }
    },
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
            $project: {
                _id: 1,
                postContent: 1,
                postOwner: 1,
                likesCount: { $size: '$likes' }
            }
        },
    ]
    const posts = await Post.aggregate(pipeline);
    return res.status(200).json(new ApiResponse(200, {posts}, "Posts fetched"));
});

export { createSocialUserProfile,createPost,likeUnlikePost ,getAllPosts}