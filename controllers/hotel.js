import Hotel from "../models/hotel";
import Order from "../models/order";
import fs from "fs";

export const bookHotel = async (req, res) => {
  try {
    const { hotelId, amount, bookingDetails } = req.body;
    let order = new Order();
    order.orderedBy = req.user._id;
    order.hotel = hotelId;
    order.bookingDetails = JSON.parse(bookingDetails);
    order.bed = order.bookingDetails.bed
    order.from = order.bookingDetails.from
    order.to = order.bookingDetails.to
    order.session = {
      "payment_status": "PAID",
      "currency": "INR",
      "amount_total": amount
    };
    order.save((err, result) => {
      if (err) {
        console.log("saving order err => ", err);
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

export const create = async (req, res) => {
  try {
    let fields = req.fields;
    let files = req.files;
    let hotel = new Hotel(fields);
    hotel.postedBy = req.user._id;
    // handle image
    if (files.image) {
      hotel.image.data = fs.readFileSync(files.image.path);
      hotel.image.contentType = files.image.type;
    }

    hotel.save((err, result) => {
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

export const hotels = async (req, res) => {
  let all = await Hotel.find({})
    .limit(24)
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  res.json(all);
};

export const image = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  if (hotel && hotel.image && hotel.image.data !== null) {
    res.set("Content-Type", hotel.image.contentType);
    return res.send(hotel.image.data);
  }
};

export const sellerHotels = async (req, res) => {
  let all = await Hotel.find({ postedBy: req.user._id })
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  // console.log(all);
  res.send(all);
};

export const remove = async (req, res) => {
  // First find if hotel has orders history : can't delete
  const ordersCount = await Order.countDocuments({ hotel: req.params.hotelId }).exec();
  if (ordersCount) {
    return res.status(400).send("Can't delete, this has orders history");
  }
  let removed = await Hotel.findByIdAndDelete(req.params.hotelId)
    .select("-image.data")
    .exec();
  res.json(removed);
};

export const read = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId)
    .populate("postedBy", "_id name")
    .select("-image.data")
    .exec();
  res.json(hotel);
};

export const update = async (req, res) => {
  try {
    let fields = req.fields;
    let files = req.files;

    let data = { ...fields };

    if (files.image) {
      let image = {};
      image.data = fs.readFileSync(files.image.path);
      image.contentType = files.image.type;

      data.image = image;
    }

    let updated = await Hotel.findByIdAndUpdate(req.params.hotelId, data, {
      new: true,
    }).select("-image.data");

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send("Hotel update failed. Try again.");
  }
};

export const userHotelBookings = async (req, res) => {
  const all = await Order.find({ orderedBy: req.user._id })
    .select("session bed from to bookingDetails")
    .populate("hotel", "-image.data")
    .populate("orderedBy", "_id name")
    .exec();
  res.json(all);
};

export const isAlreadyBooked = async (req, res) => {
  const { hotelId } = req.params;
  // find orders of the currently logged in user
  const userOrders = await Order.find({ orderedBy: req.user._id })
    .select("hotel")
    .exec();
  // check if hotel id is found in userOrders array
  let ids = [];
  for (let i = 0; i < userOrders.length; i++) {
    ids.push(userOrders[i].hotel.toString());
  }
  res.json({
    ok: ids.includes(hotelId),
  });
};

export const searchListings = async (req, res) => {
  const { location, date, bed } = req.body;
  let where = { location };

  if (date) {
    const fromDate = date.split(",");
    if (fromDate && fromDate[0]) {
      where = { ...where, from: { $lte: new Date(fromDate[0]) } }
    }

    if (fromDate && fromDate[1]) {
      where = { ...where, to: { $gte: new Date(fromDate[1]) } }
    }
  }

  if (bed) {
    where = { ...where, bed: { $gte: bed } }
  }

  const fromDate = date.split(",");
  let result = await Hotel.find(where)
    .select("-image.data")
    .exec();
  res.json(result);
};

export const cancelBooking = async (req, res) => {
  let removed = await Order.findByIdAndDelete(req.params.orderId)
    .exec();
  res.json(removed);
};

export const checkHotelAvailability = async (req, res) => {
  const { from, to, bed, hotelId } = req.body;
  let hotelObj = await Hotel.findById(hotelId).exec();
  let bookedBeds = 0;
  let where = { hotel: hotelId };

  if (from && to) { // CASE 1
    where = { hotel: hotelId };
    where = { ...where, from: { $lte: new Date(from) } }
    where = { ...where, to: { $gte: new Date(from) } }
  }

  let result1 = await Order.find(where).select("from to bed").exec();
  where = {};

  if (from && to) { // CASE 2
    where = { hotel: hotelId };
    where = { ...where, from: { $gte: new Date(from) } }
    where = { ...where, to: { $lte: new Date(to) } }
  }

  let result2 = await Order.find(where).select("from to bed").exec();
  where = {};
 

  if (from && to) { // CASE 3
    where = { hotel: hotelId };
    where = { ...where, from: { $lte: new Date(to) } }
    where = { ...where, to: { $gte: new Date(to) } }
  }

  let result3 = await Order.find(where).select("from to bed").exec();
  where = {};

  if (from && to) { // CASE 4
    where = { hotel: hotelId };
    where = { ...where, from: { $lte: new Date(from) } }
    where = { ...where, to: { $gte: new Date(to) } }
  }

  let result4 = await Order.find(where).select("from to bed").exec();
  where = {};
 

  let result = await Order.find(where).select("from to bed").exec();
  // console.log("result1",result1)
  // console.log("result2",result2)
  // console.log("result3",result3)
  // console.log("result4",result4)

  const finalResult = [
    ...result1,...result2,...result3,...result4
  ]

  if(finalResult.length) {
    for (let i = 0; i < finalResult.length; i++) {
      bookedBeds += finalResult[i].bed;
    }
  } else {
    console.log("yes i can book")
  }

  if(!bookedBeds) {
    return res.json({
      canBook: true
    });
  }

  

  const remaingBeds = hotelObj.bed - bookedBeds;
  console.log(remaingBeds, hotelObj.bed , bookedBeds,parseInt(bed))
  if(parseInt(bed) <= remaingBeds) {
    return res.json({
      canBook: true
    });
  }

  return res.json({
    canBook: false
  });
};

export const getHotelBookings = async (req, res) => {
  let all = await Order.find({ hotel: req.params.hotelId })
    .limit(24)
    .select("bed from to bookingDetails session")
    .populate("orderedBy", "name")
    .exec();
  res.json(all);
};


export const getCompletedOrdersCount = async (req, res) => {
  let ordersCount = await Order.countDocuments({ to: { $lt: new Date() }, orderedBy: req.params.userlId }).exec();
  res.json(ordersCount)
};

