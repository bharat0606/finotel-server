import express from "express";
import formidable from "express-formidable";

const router = express.Router();
import { requireSignin } from "../middlewares";

const { bookCab, getBookedCabs, cancelCab } = require("../controllers/cab");

router.post("/book-cab", requireSignin, formidable(), bookCab);
router.get("/get-booked-cabs", requireSignin, getBookedCabs);
router.delete("/cancel-cab/:cabId", requireSignin, cancelCab);

module.exports = router;
