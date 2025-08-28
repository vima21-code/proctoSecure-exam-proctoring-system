const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Allowed MIME types for PDFs and images
const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

// Validate both extension and MIME type
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (
    [".pdf", ".jpg", ".jpeg", ".png"].includes(ext) &&
    allowedMimeTypes.includes(mime)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed"), false);
  }
};

const fileupload = multer({ storage, fileFilter });

module.exports = fileupload;
