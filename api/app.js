import express from "express";
import connectToDatabase from "../src/config/database.js";
import config from "../src/config/index.js";
import artRoute from "../src/routes/artRoute.js";
import userRoute from "../src/routes/userRoute.js";
import authRoute from "../src/routes/authRoute.js";
import orderRoute from "../src/routes/orderRoute.js";
import logger from "../src/middlewares/logger.js";
import auth from "../src/middlewares/auth.js";
import multer from "multer";
import bodyParser from "body-parser";
import { connectCloudinary } from "../src/config/cloudinary.js";

const app = express();

connectCloudinary();

const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyParser.json());
app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World",
    status: "success",
    version: config.VERSION,
    name: config.NAME
  });
});

app.use("/api/auth", authRoute);
app.use("/art", upload.array("image", 5), artRoute);
app.use("/user", auth, upload.single("image"), userRoute);
app.use("/order", orderRoute);

/* VERCEL HANDLER */
export default async function handler(req, res) {
  await connectToDatabase();
  return app(req, res);
}