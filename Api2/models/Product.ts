import mongoose from "mongoose";
import { Category } from "./MiniModels";
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Product name is Required"],
    minLength: [3, "Product name should be minimum 3 characters."],
    maxLength: [50, "Product name should be maximum 50 characters."],
  },
  title: {
    type: String,
    trim: true,
    required: [true, "Product title is Required"],
    minLength: [3, "Product title should be minimum 3 characters."],
    maxLength: [50, "Product title should be maximum 50 characters."],
  },
  description: {
    type: String,
    trim: true,
    required: [true, "Product description is Required"],
    minLength: [3, "Product description should be minimum 3 characters."],
    maxLength: [50, "Product description should be maximum 50 characters."],
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    trim: true,
    default: 0,
  },
  stocks: {
    type: Number,
    required: [true, "Product stocks is required"],
    trim: true,
    default: 0,
  },
  ratings: [
    {
      types: String,
      rate: Number,
    },
  ],
  images: [
    {
      type: String,
      required: true,
    },
  ],
  categories: [
    Category.schema,
  ],
  // categories2:[{
  //   type:mongoose.Schema.Types.ObjectId,
  //   ref:"Category"
  // }]
  details:[{
   detailsName:{ type:String,
    trim:true,
    required:[true,"Product detail is required"],
    minLength:[3,"Product detail should be minimum 3 characters."],
    maxLength:[50,"Product detail should be maximum 50 characters."]},
    detailsValue:{ type:String,
      trim:true,
      required:[true,"Product detail is required"],
      minLength:[3,"Product detail should be minimum 3 characters."],
      maxLength:[50,"Product detail should be maximum 50 characters."]},
  }],
  review:[{type:mongoose.Schema.Types.ObjectId,
    ref:"Review"},],

    variants:[{
     type:mongoose.Schema.Types.ObjectId,
     ref:"Products"
    }]
});

const Products =
  mongoose.models.products || mongoose.model("Products", productSchema);
export default Products;
