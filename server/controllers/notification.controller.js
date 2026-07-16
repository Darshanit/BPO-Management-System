const asyncHandler = require('express-async-handler');
const { Notification } = require('../models/Misc');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @route  GET /api/notifications?unread=true
const getMyNotifications = asyncHandler(async (req, res) => {
  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;

  const notifications = await Notification.find(filter).sort('-createdAt').limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res
    .status(200)
    .json(new ApiResponse(200, 'Notifications fetched', notifications, { unreadCount }));
});

// @route  PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  res.status(200).json(new ApiResponse(200, 'Notification marked as read', notification));
});

// @route  PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json(new ApiResponse(200, 'All notifications marked as read'));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });
  if (!notification) throw new ApiError(404, 'Notification not found');
  res.status(200).json(new ApiResponse(200, 'Notification deleted'));
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
