import express from "express";
import notificationController from "../controller/notificationController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, notificationController.getNotifications);
router.patch("/read-all", auth, notificationController.markAllAsRead);
router.patch("/:id/read", auth, notificationController.markAsRead);
router.delete("/delete-all", auth, notificationController.deleteAll);
router.delete("/:id", auth, notificationController.deleteNotification);

export default router;
