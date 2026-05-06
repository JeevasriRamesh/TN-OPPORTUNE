const mongoose = require("mongoose");

const reminderLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

reminderLogSchema.index({ userId: 1, schemeId: 1 }, { unique: true });

module.exports = mongoose.model("ReminderLog", reminderLogSchema);

