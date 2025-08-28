import CertificateRequest from "../models/CertificateRequest.js";
import User from "../models/User.js";


export const createCertificateRequest = async (req, res) => {
  try {
    
    const existingRequest = await CertificateRequest.findOne({
      tutor: req.user._id,
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You have already submitted a certificate request." });
    }

    const { name, experience, specialization, university } = req.body;
    const newRequest = new CertificateRequest({
      tutor: req.user._id,
      name,
      experience,
      specialization,
      university,
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all certificate requests (for admin)
// @route   GET /api/certificates/certificate-requests
// @access  Private/Admin
export const getAllCertificateRequests = async (req, res) => {
  try {
    const requests = await CertificateRequest.find().populate(
      "tutor",
      "name email"
    );
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my certificate request (for tutor)
// @route   GET /api/certificates/certificate-request/my
// @access  Private/Tutor
export const getMyCertificateRequest = async (req, res) => {
  try {
    const request = await CertificateRequest.findOne({ tutor: req.user._id });
    if (!request) {
      return res
        .status(404)
        .json({ message: "No certificate request found for this tutor." });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificateRequest = await CertificateRequest.findById(id);
    if (!certificateRequest) {
      return res.status(404).json({ message: "Certificate request not found." });
    }

    if (certificateRequest.status !== "pending") {
      return res.status(400).json({
        message: `Certificate request is already ${certificateRequest.status}.`,
      });
    }

    certificateRequest.status = "approved";
    await certificateRequest.save();

    const tutor = await User.findById(certificateRequest.tutor);
    if (tutor) {
      tutor.isCertified = true; // ✅ mark certified instead of changing role
      await tutor.save();
    }

    res.status(200).json({
      message: "Certificate approved successfully.",
      certificateRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateCertificateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await CertificateRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status provided." });
    }

    request.status = status;
    await request.save();

    // Optionally update the user's role to 'certified_tutor' if approved
    if (status === "approved") {
      const user = await User.findById(request.tutor);
      if (user) {
        user.role = "certified_tutor";
        await user.save();
      }
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};