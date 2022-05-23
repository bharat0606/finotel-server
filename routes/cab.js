import express from "express";
import formidable from "express-formidable";

const router = express.Router();
import { requireSignin } from "../middlewares";

const { bookCab, getBookedCabs } = require("../controllers/cab");

router.post("/book-cab", requireSignin, formidable(), bookCab);
router.get("/get-booked-cabs", requireSignin, getBookedCabs);

module.exports = router;
