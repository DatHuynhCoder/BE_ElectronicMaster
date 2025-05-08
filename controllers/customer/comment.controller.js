import { Electronic } from '../../models/electronic.model.js'
import { Review } from '../../models/review.model.js';
import cloudinary from "../../config/cloudinary.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

export const createComment = async (req, res) => {
  try {
    //get userid
    const userID = req.user.id;
    let { rating, content, electronicID } = req.body;

    //check if rating is valid
    if (rating) {
      //check if rating is valid
      try {
        rating = parseInt(rating);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Rating must be a number" });
      }

      if (rating < 0 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be in range 0-5" });
      }

      //Get electronic
      const electronic = await Electronic.findById(electronicID);

      //check if electronic exist
      if (!electronic) {
        return res.status(404).json({ success: false, message: "Electronic not found" });
      }

      //update electronic rating
      electronic.rating = (electronic.rating * electronic.numReview + rating) / (electronic.numReview + 1);
      electronic.numReview++;

      //save electronic
      await electronic.save();
    }

    //upload reviewImgs to cloudinary
    const reviewFiles = req.files['reviewImgs'] || [];
    const reviewImgs = [];
    for (const file of reviewFiles) {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
          folder: "ElectronicMaster/ReviewImages",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });

        stream.end(file.buffer); // Upload từ buffer
      });

      reviewImgs.push({ url: uploaded.secure_url, public_id: uploaded.public_id });
    }


    //create a new comment
    const newComment = await Review.create({
      userID: userID,
      content: content,
      electronicID: electronicID,
      rating: rating,
      reviewImgs: reviewImgs
    })

    res.status(200).json({ success: true, data: newComment });
  } catch (error) {
    console.error("Error in create comment: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateComment = async (req, res) => {
  try {
    //get userid
    const userID = req.user.id;
    let { rating, content, electronicID, commentID } = req.body;

    // Check if required fields are provided
    if (!commentID || !electronicID || !userID) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    //find comment
    const comment = await Review.findOne({ _id: commentID, userID: userID, electronicID: electronicID });
    if (!comment) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    //Validate rating
    if (rating) {
      try {
        rating = parseInt(rating);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Rating must be a number" });
      }

      if (rating < 0 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be in range 0-5" });
      }
    }

    const reviewFiles = req.files['reviewImgs'] || [];
    const reviewImgs = [];

    if (reviewFiles.length > 0) {
      //Delete old review images from cloudinary
      for (const img of comment.reviewImgs) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      //upload reviewImgs to cloudinary
      for (const file of reviewFiles) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({
            folder: "ElectronicMaster/ReviewImages",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }
            ]
          }, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });

          stream.end(file.buffer);
        });

        reviewImgs.push({ url: uploaded.secure_url, public_id: uploaded.public_id });
      }

    }

    //Update comment
    const updateComment = await Review.findByIdAndUpdate(
      commentID,
      {
        rating: rating,
        content: content,
        reviewImgs: reviewImgs
      },
      { new: true }
    )

    //Recalculate the electronic rating
    const allReviews = await Review.find({ electronicID: electronicID });
    const totalRating = allReviews.reduce((sum, comment) => sum + comment.rating, 0);
    const averageRating = totalRating / allReviews.length;

    //Update electronic with new average rating
    const electronic = await Electronic.findByIdAndUpdate(
      electronicID,
      { rating: averageRating, numReview: allReviews.length },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Update comment and electronic rating successfully",
      comment: updateComment,
      electronic
    });
  } catch (error) {
    console.error("Error in update comment: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteComment = async (req, res) => {
  try {
    //get data
    const userID = req.user.id;
    const { electronicID, commentID } = req.body;

    // Check if required fields are provided
    if (!commentID || !electronicID || !userID) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    //find the comment to delete
    const comment = await Review.findOne({ _id: commentID, electronicID: electronicID });

    //check if comment exist
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    //delete all reviews image on cloudinary
    if (comment.reviewImgs) {
      for (const img of comment.reviewImgs) {
        await cloudinary.uploader.destroy(img.public_id)
      }
    }

    //delete comment
    await Review.findByIdAndDelete(commentID);

    //Recalculate the electronic rating
    const allReviews = await Review.find({ electronicID: electronicID });
    const totalRating = allReviews.reduce((sum, comment) => sum + comment.rating, 0);
    const averageRating = totalRating / allReviews.length;

    //Update electronic with new average rating
    const electronic = await Electronic.findByIdAndUpdate(
      electronicID,
      { rating: averageRating, numReview: allReviews.length },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Delete comment and update electronic rating successfully" })
  } catch (error) {
    console.error("Error in delete comment: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}