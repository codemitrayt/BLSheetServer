import multer from "multer";

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 500000 },
});

export default uploader;
