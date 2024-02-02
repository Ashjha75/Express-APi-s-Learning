import mongoose from "mongoose";


const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        index: true,
        unique: true,
    },
    description: {
        type: String,
        required: [true, "Description is reqired."],
        trim: true,
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Low"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TodoProfile",
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "TodoProfile",
    }],
    tags: [String],


}, { timestamps: true });

// method which will add tags from description and title if there is @ symbol.
todoSchema.pre("save", async function (next) {
    if (this.isModified("title") || this.isModified("description")) {
        // by splitting the description and title (if there is @ symbol) we will get tags
        // this methode is simple and not efficient as regex but it will work for now.
        const tags = [...this.description.split(" "), ...this.title.split(" ")].filter((word) => (word.includes("@") && word.length > 2));
        this.tags = [...new Set(tags)];
        console.log("running")
        next();
    }

    return next();

})

const Todo = mongoose.models.Todo || mongoose.model("Todo", todoSchema);
export { Todo }



