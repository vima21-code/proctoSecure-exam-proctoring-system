// routes/certificateRoutes.js

const express = require("express");
const {
  createCertificateRequest,
  getAllCertificateRequests,
  getMyCertificateRequest,
  updateCertificateStatus,
  approveCertificate,
} = require("../controllers/certificateController");
const { protect, adminOnly, tutorOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// A tutor can create a new certificate request
router.post(
  "/certificate-request",
  protect,
  tutorOnly,
  createCertificateRequest
);

// A tutor can check their own request status
router.get(
  "/certificate-request/my",
  protect,
  tutorOnly,
  getMyCertificateRequest
);

// An admin can view all requests
router.get(
  "/certificate-requests",
  protect,
  adminOnly,
  getAllCertificateRequests
);
router.put(
  "/approve/:id",
  protect,
  adminOnly,
  approveCertificate 
);


// An admin can approve or reject a request
router.put(
  "/certificate-requests/:id",
  protect,
  adminOnly,
  updateCertificateStatus
);

module.exports = router;