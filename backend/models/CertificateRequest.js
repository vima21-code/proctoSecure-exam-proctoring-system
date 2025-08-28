const mongoose = require("mongoose");

const certificateRequestSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model for tutors and admins
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const CertificateRequest = mongoose.model(
  "CertificateRequest",
  certificateRequestSchema
);
module.exports = mongoose.model("CertificateRequest", certificateRequestSchema);

