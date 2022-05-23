import Cab from "../models/cab";


export const bookCab = async (req, res) => {
    //   console.log("req.fields", req.fields);
    //   console.log("req.files", req.files);
    try {
      let fields = req.fields;

      console.log("fields", fields)
  
      let cab = new Cab(fields);
      cab.bookedBy = req.user._id;     
  
      cab.save((err, result) => {
        if (err) {
          console.log("saving hotel err => ", err);
          res.status(400).send("Error saving");
        }
        res.json(result);
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        err: err.message,
      });
    }
  };



  export const getBookedCabs = async (req, res) => {
    let all = await Cab.find({ bookedBy: req.user._id })
      .limit(24)
      .populate("bookedBy", "_id name")
      .exec();
    // console.log(all);
    res.json(all);
  };