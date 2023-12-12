const newSchema = {};
const reviewSchema = {};
const detailsSchema = {};
const data = {
  name: "max50,required,unique,trim,errormessage",
  desc: "max100,required,trim,errormessage ",
  price: "number ,required,trim,errormessage,default-0",
  Image: ["image.urls", "required,errormessage"],
  stock: "number ,required,trim,errormessage,default-0",
  categories: ["enum", "required,errormessage,default-empty"],
  variants: newSchema,
  review: reviewSchema,
  ratings: ["{array of object}"],
  details: detailsSchema,
};
