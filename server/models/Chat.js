const mongoose = require('mongoose');

/** A chat "room" - either a 1:1 private chat or a team group chat. */
const chatSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: String, // required if isGroup (e.g. team name)
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // set if this is a team group chat
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

/** Individual message within a Chat. */
const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, trim: true },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = {
  Chat: mongoose.model('Chat', chatSchema),
  Message: mongoose.model('Message', messageSchema),
};
