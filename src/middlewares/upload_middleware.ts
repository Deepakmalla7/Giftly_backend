import multer from "multer";
import uuid from "uuid";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { HttpError } from "../errors/http-error";

// Ensure the uploads directory exists
// Save uploads to src/uploads folder
const uploadDir = path.resolve(__dirname, '../uploads');
console.log('Upload directory:', uploadDir);

if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Uploads directory created:', uploadDir);
    } catch (err) {
        console.error('Failed to create uploads directory:', err);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Destination callback - setting upload dir:', uploadDir);
        cb(null, uploadDir); // set upload directory
    },
    filename: function (req: Request, file, cb) {
        const ext = path.extname(file.originalname); // get file extension
        const filename = `${uuid.v4()}${ext}`;
        console.log('Generated filename:', filename);
        cb(null, filename); // set unique file name
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images only
    console.log('File filter - checking mimetype:', file.mimetype);
    if (!file.mimetype.startsWith('image/')) {
        console.error('Invalid file type:', file.mimetype);
        return cb(new HttpError(400, 'Only image files are allowed!'));
    }
    cb(null, true);
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};