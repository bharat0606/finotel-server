import Cab from "../models/cab";


export const bookCab = async (req, res) => {
    try {
      let fields = req.fields;  
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
    res.json(all);
  };


  export const cancelCab = async (req, res) => {
    let removed = await Cab.findByIdAndDelete(req.params.cabId)
      .exec();
    res.json(removed);
  };