const mongoose = require('mongoose');

/** Uploaded file metadata (Multer stores the physical file on disk under /uploads). */
const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileUrl: { type: String, required: true }, // relative path e.g. /uploads/documents/xyz.pdf
    fileType: String, // mime type
    fileSize: Number, // bytes
    category: {
      type: String,
      enum: ['identity', 'education', 'employment', 'contract', 'invoice', 'other'],
      default: 'other',
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relatedTo: {
      // polymorphic reference: which entity this document belongs to
      kind: { type: String, enum: ['Employee', 'Client', 'Project', 'Task'] },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

/** In-app notification, always tied to a recipient user. */
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['task', 'leave', 'attendance', 'payroll', 'project', 'ticket', 'chat', 'system'],
      default: 'system',
    },
    link: String, // frontend route to deep-link to
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

/** Scheduled meeting. */
const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    meetingLink: String,
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  },
  { timestamps: true }
);

/** Client support ticket. */
const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true }, // e.g. TCK-2026-0001
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    replies: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  },
  { timestamps: true }
);

module.exports = {
  Document: mongoose.model('Document', documentSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Meeting: mongoose.model('Meeting', meetingSchema),
  Ticket: mongoose.model('Ticket', ticketSchema),
};
