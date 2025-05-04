import fs from "fs";
import path from "path";

const UPLOADS_FOLDER = "uploads";

// Delete specific temporary files
const deleteTempFiles = (files) => {
  try {
    if (!files || !Array.isArray(files)) return;
    
    files.forEach(file => {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
  } catch (error) {
    console.error("Error deleting temp files:", error);
  }
};

// Delete all files in the uploads/ folder
const clearUploadsFolder = () => {
  fs.readdir(UPLOADS_FOLDER, (err, files) => {
    if (err) {
      console.error("Failed to read uploads folder:", err.message);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(UPLOADS_FOLDER, file);
      fs.unlink(filePath, (err) => {
        if (err) console.log("Failed to delete file", filePath, err.message);
      });
    });
  });
};

// Call `clearUploadsFolder` when the server starts to clean up old temporary files
// clearUploadsFolder();

export { deleteTempFiles, clearUploadsFolder };
