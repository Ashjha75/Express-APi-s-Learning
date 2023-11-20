import mongoose, { model } from "mongoose";
const categorySchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true,
    unique:true,
  },
  description:{
    type:String,
    required:true,
    trim:true,
  },
  // this is for sub category if any e.g. electronics->mobiles->samsung
  parent:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category",
  }
});
export const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);


const reviewSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  review:{
    type:String,
    required:true,
    trim:true,
    minLength: [3, "Review should be minimum 3 characters."],
    maxLength: [500, "Review should be maximum 500 characters."]
  },
  rating:{
    type:Number,
    required:true,
    trim:true,
    minLegth:0,
    maxLength:5,
  },
  children:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Review",
  }]

});

export const Review= mongoose.models.Review||mongoose.model("Review",reviewSchema);