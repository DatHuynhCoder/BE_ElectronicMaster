import axios from "axios";
import { Electronic } from "../../models/electronic.model.js";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const searchElectroicWithChatbot = async (req, res) => {
  try {
    const { query, top_k = 5 } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    //get ids and scores from the chatbot
    const chatbotResponse = await axios.post(`${process.env.CHATBOT_HOST}/search_ids`, {
      query: query,
      top_k: top_k
    });

    const { ids, scores } = chatbotResponse.data;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(404).json({ success: false, message: "No electronics found" });
    }

    //Get electronics name and images from the database
    const electronics = await Electronic.find({ _id: { $in: ids } });

    if (!electronics || electronics.length === 0) {
      return res.status(404).json({ success: false, message: "No electronics found" });
    }

    res.status(200).json({ success: true, data: electronics });
  } catch (error) {
    console.error("Error in searchElectroicWithChatbot: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const searchSimilarImgs = async (req, res) => {
  let filePath = null;

  try {
    const { top_k = 5 } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    // File is saved to disk by multer, get the path
    filePath = file.path;

    const optimizedBuffer = await sharp(filePath)
      .resize({ width: 800 }) 
      .jpeg({ quality: 70 }) 
      .toBuffer();

    // Create FormData and append the file buffer
    const formData = new FormData();
    formData.append('file', optimizedBuffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    // Send the image to the chatbot for similarity search
    const chatbotResponse = await axios.post(
      `${process.env.CHATBOT_HOST}/search_image?top_k=${top_k}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 10000
      }
    );

    const { ids, scores } = chatbotResponse.data;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(404).json({ success: false, message: "No similar images found" });
    }

    //Get electronics name and images from the database
    const electronics = await Electronic.find({ _id: { $in: ids } });
    if (!electronics || electronics.length === 0) {
      return res.status(404).json({ success: false, message: "No electronics found" });
    }

    res.status(200).json({ success: true, data: electronics });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    // Clean up: delete the uploaded file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (deleteError) {
        console.error('Error deleting temporary file:', deleteError);
      }
    }
  }
}