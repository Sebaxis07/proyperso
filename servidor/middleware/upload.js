import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/productos/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: Solo se permiten imágenes! (jpeg, jpg, png, webp)'));
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB max
  fileFilter: fileFilter
});