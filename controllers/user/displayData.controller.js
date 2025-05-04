import { Electronic } from "../../models/electronic.model.js";
import {Review} from "../../models/review.model.js"

export const getElectronicById = async (req, res) => {
  try {
    //get electronic id
    const electronicID = req.params.id;
    const electronic = await Electronic.findById(electronicID);

    //check if electronic exist
    if (!electronic) {
      return res.status(404).json({ success: false, message: `Electronic with id: ${electronicID} not found` });
    }

    res.status(200).json({ success: true, data: electronic })
  } catch (error) {
    console.error("Error in get electronic: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getAllCategories = async (req, res) => {
  try {
    //get all categories
    const catergories = await Electronic.distinct('mainCategory');

    //check if can find at least 1 category
    if(!catergories){
      return res.status(404).json({ success: false, message: "Categories not found" });
    }

    res.status(200).json({success: true, data: catergories});
  } catch (error) {
    console.error("Error get all categories", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getCommentsByElectronicID = async (req, res) => {
  try {
    const electronicID = req.params.id;
    const comments = await Review.find({electronicID: electronicID});

    //check if comments exist
    if(!comments){
      return res.status(200).json({success: true, data: comments})
    }

    res.status(200).json({success: true, data: comments})
  } catch (error) {
    console.error("Error get comments by electronicID", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}