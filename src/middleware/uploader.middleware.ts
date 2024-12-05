import multer from "multer";

const FILE_SIZE = 52428800;

var uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: FILE_SIZE },
});

export default uploader;
