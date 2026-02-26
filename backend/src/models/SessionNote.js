const mongoose = require("mongoose");

const sessionNoteSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    sessionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

     content: {
      type: String,
      required: true,
      trim: true,
    },
  },

  { timestamps: true },
);

sessionNoteSchema.index({ ownerUserId: 1, sessionDate: -1 });
sessionNoteSchema.index({ title: 1 });

module.exports = mongoose.model("SessionNote", sessionNoteSchema);
