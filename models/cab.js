import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema;

const cabSchema = new Schema(
  {
    source: {
      type: String,
      required: "Source is required",
    },
    destination: {
      type: String,
      required: "Destination is required",
    },    
    fair: {
      type: Number,
      required: "Fair is required",
      trim: true,
    },
    distance: {
        type: Number,
        required: "Distance is required",
        trim: true,
      },
      bookedBy: {
      type: ObjectId,
      ref: "User",
    },   
    time: {
      type: String,
      required: "Time is required",
    },
    departureDate: {
      type: Date,
      required: "DepartureDate is required",
    },    
  },
  { timestamps: true }
);

export default mongoose.model("Cab", cabSchema);
