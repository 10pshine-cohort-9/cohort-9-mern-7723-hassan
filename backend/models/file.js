const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    extension: {
      type: String,
      default: "txt",
    },

    size: {
      type: Number,
      default: 0, // Size in bytes
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ user: 1, name: 1 }, { unique: true });


const File = mongoose.models.File|| mongoose.model("File", fileSchema);
module.exports = File;