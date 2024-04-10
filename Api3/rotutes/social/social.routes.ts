import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import { createPost, createSocialUserProfile, getAllPosts, likeUnlikePost, getPostById, getUserProfile, followAndUnfollowUser, getAllFollowedUsers } from "../../controllers/social/socialApp.contollers";
const { verifyToken } = require("../../middleware/verifyToken.middleware");


const socialRouter = Router();

socialRouter.route("/createSocialUserProfile").post(createSocialUserProfile);
socialRouter.post("/createPost", upload.array('imageUrl', 4), createPost);
socialRouter.post("/likeUnlikePost", likeUnlikePost);
socialRouter.get("/getAllPosts", getAllPosts);
socialRouter.get("/getPostById/:postID", getPostById);
socialRouter.get("/getUserProfile/:userID", getUserProfile);
socialRouter.post("/followAndUnfollowUser", followAndUnfollowUser);
socialRouter.get("/getAllFollowedUsers/:userID", getAllFollowedUsers);

// socialRouter.post("/queueTest",queueTest);``
export { socialRouter }