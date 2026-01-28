// AngularApp\echodrop\backend\src\models\Drop.js
import mongoose from "mongoose";

const dropSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String }, // optional attachment
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentDrop: { type: mongoose.Schema.Types.ObjectId, ref: "Drop" }, // nesting
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drop" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Drop", dropSchema);
