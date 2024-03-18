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
import UserRelations from "../../models/social/userRelations.models";


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
const followAndUnfollowUser = asyncHandler(async (req:AuthRequest,res:Response)=>{
    const {userID,notifyMe}=req.body;
    const currentUserId=req?.user?.id;
    if(!userID){
        throw new ApiError(404,"User ID is required to follow or unfollow",[])
    }
    // check that is userID is valid or not
    const user = await SocialUserFeatures.findById(userID);
    if(!user){
        throw new ApiError(404,"Please provide valid user",[])
    }
    // fetch the current user _id
    const currentUser = await SocialUserFeatures.findOne({currentUser:currentUserId});
    if(!currentUser){
        throw new ApiError(404,"User not found",[])
    }
    // check if the user is already following
    const isAlreadyFollowing = await UserRelations.findOne({follower:currentUser._id,following:userID});
    if(!isAlreadyFollowing){
        const followUser = new UserRelations({
            follower:currentUser._id,
            following:userID,
            notificationbell:notifyMe
        });
        await followUser.save();
        return res.status(200).json(new ApiResponse(200, {followUser}, "User followed"));
    }
    else{
        const unfollowUser = await UserRelations.findOneAndDelete({follower:currentUser._id,following:userID});
        if(!unfollowUser){
            throw new ApiError(404,"User not found to unfollow",[])
        }
        return res.status(200).json(new ApiResponse(200, {unfollowUser}, "User unfollowed"));
}});
// get All followed users
const getAllFollowedUsers = asyncHandler(async (req:AuthRequest,res:Response)=>{
    const {userID,verifiedUser}=req.params;
    if(!userID){
        throw new ApiError(404,"User ID is required to get followed and following users",[])
    }
    // check that is userID is valid or not
    const user = await SocialUserFeatures.findById(userID);
    if(!user){
        throw new ApiError(404,"Please provide valid user",[])
    }
    const pipeline=[
        // match the user id for finding the followers
        {
            $match:{follower:new mongoose.Types.ObjectId(userID.trim())}
        },
        {
            $lookup: {
                from: 'socialuserfeatures',
                localField: 'following',
                foreignField: '_id',
                as: 'followers'
            }
        },
        {
            $lookup: {
                from: "users", // Replace "users" with the actual collection name
                localField: "followers.currentUser",
                foreignField: "_id",
                as: "currentUserDetails"
            }
        },
        {
            $unwind: "$followers" // Unwind the "followers" array
          },
              {
                $unwind: "$currentUserDetails" // Unwind the "userDetails" array
              },
              
        // project the required fields
        {
            $project: {
                _id: "$followers._id",
                userName:"$currentUserDetails.userName",
                email:"$currentUserDetails.email",
                avatar:"$currentUserDetails.avatar",
                bio:"$followers.bio",
                premiumUser:"$followers.premiumUser"
            }
        }
       
    ];
    // const followedUsers = await UserRelations.aggregate(pipeline);
    const followedUsers = await UserRelations.find({ following: userID})
      .populate({
        path: 'following',
        select: ' location bio currentUser', // Select desired fields
        populate: {
          path: 'currentUser', // Populate the 'currentUser' field
          select: 'userName email' // Select desired fields from 'currentUser'
        }
      });
    if(!followedUsers){
        throw new ApiError(404,"No followed users found",[])
    }
    return res.status(200).json(new ApiResponse(200, {followedUsers}, "Followed Users fetched"));

})
// get all folling users

// get all th liked posts

// get all the commented posts

// block and unblock the user

// report the user

// report the post

// edit the user profile

// all the post which contains the media

// get all notifications

// get list and count of followers you know

// who to fllow or my network


// procedure queue code
// import Procedure from "../../utils/Queues/rabbitMqSetup.utils";
// const procedure = new Procedure();
// const queueTest= asyncHandler(async (req:Request,res:Response)=>{
//     await procedure.publishMessage(req.body.logType,req.body.message);
//     return res.status(200).json(new ApiResponse(200, {}, "Message sent to the queue"));
// });
export { createSocialUserProfile,createPost,likeUnlikePost ,getAllPosts,getPostById,getUserProfile,followAndUnfollowUser,getAllFollowedUsers}