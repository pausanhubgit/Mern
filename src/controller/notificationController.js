import notificationService from "../services/notificationService.js";

const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = await notificationService.getNotifications(userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notifId = req.params.id;
        const userId = req.user._id;
        const updated = await notificationService.markAsRead(notifId, userId);
        if (!updated) return res.status(404).json({ message: "Notification not found" });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update notification", error: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notifId = req.params.id;
        const userId = req.user._id;
        const deleted = await notificationService.deleteNotification(notifId, userId);
        if (!deleted) return res.status(404).json({ message: "Notification not found" });
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete notification", error: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        await notificationService.markAllRead(userId);
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notifications", error: error.message });
    }
};

const deleteAll = async (req, res) => {
    try {
        const userId = req.user._id;
        await notificationService.deleteAll(userId);
        res.status(200).json({ message: "All notifications deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete notifications", error: error.message });
    }
};

export default { getNotifications, markAsRead, deleteNotification, markAllAsRead, deleteAll };
