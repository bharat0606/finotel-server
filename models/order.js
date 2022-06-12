import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    hotel: {
      type: ObjectId,
      ref: "Hotel",
    },
    session: {},
    orderedBy: { type: ObjectId, ref: "User" },
    from: {
      type: Date,
      required: "From Date is required",
    },
    to: {
      type: Date,
      required: "To Date is required",
    },
    bed: {
      type: Number,
      required: "Bed is required",
    },
  },
  { timestamps: true },  
);

export default mongoose.model("Order", orderSchema);
