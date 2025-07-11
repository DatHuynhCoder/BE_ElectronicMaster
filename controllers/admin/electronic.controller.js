import cloudinary from "../../config/cloudinary.js";
import { Electronic } from "../../models/electronic.model.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";
import { normalizeString } from "../../utils/normalizeString.js";
import { pagination } from "../../utils/pagination.js";
import { removeHtmlTagsPreserveBreaks } from "../../utils/removeHTMLtags.js";

export const createElectronic = async (req, res) => {
  try {
    const name = req.body.name;

    //Check if electronic already exists
    const compareElectronic = await Electronic.findOne({ name: name });
    if (compareElectronic) {
      return res.status(400).json({ success: false, message: "Electronic already exists" });
    }

    //Parse specifications besause it's sent as a JSON string
    let specifications = JSON.parse(req.body.specifications);

    //Parse categories because it's sent as a JSON string
    let categories = JSON.parse(req.body.categories);

    //Upload electronic images to Cloudinary
    const electronicFiles = req.files['electronicImgs'] || [];
    const electronicImgs = [];

    for (const file of electronicFiles) {
      const electronicImg = await cloudinary.uploader.upload(file.path, {
        folder: "ElectronicMaster/ElectronicImages",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      });
      electronicImgs.push({ url: electronicImg.secure_url, public_id: electronicImg.public_id });
    }

    //delete temp uploaded files
    deleteTempFiles(electronicFiles);

    //Create a new electronic
    const newElectronic = await Electronic.create({
      name: req.body.name,
      numReview: 0,
      electronicImgs: electronicImgs,
      available: 100,
      mainCategory: req.body.mainCategory,
      categories: categories,
      description: req.body.description,
      price: req.body.price,
      discount: req.body.discount,
      brandName: req.body.brandName,
      slugName: normalizeString(req.body.name),
      slugCate: normalizeString(req.body.mainCategory),
      quantitySold: 0,
      rating: 0,
      specifications: specifications
    })

    res.status(200).json({ success: true, data: newElectronic })
  } catch (error) {
    console.error("Error in create electronic: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateElectronic = async (req, res) => {
  try {
    //get electronicID
    const electronicID = req.params.id;

    //get update data from request body
    const updateData = {
      ...req.body,
      slugName: normalizeString(req.body.name),
      slugCate: normalizeString(req.body.mainCategory),
    };

    //find the electronic to update
    const electronic = await Electronic.findById(electronicID);

    //check if electronic exist
    if (!electronic) {
      return res.status(404).json({ success: false, message: "Electronic not found" });
    }

    //Parse specifications besause it's sent as a JSON string
    if (updateData.specifications) {
      try {
        updateData.specifications = JSON.parse(updateData.specifications);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid specifications format" });
      }
    }

    //Parse categories because it's sent as a JSON string
    if (updateData.categories) {
      try {
        updateData.categories = JSON.parse(updateData.categories);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid categories format" });
      }
    }

    const electronicFiles = req.files['electronicImgsFiles'] || [];

    const electronicImgs = electronic.electronicImgs || [];

    if (electronicFiles.length > 0) {

      //Upload new electronic images to cloudinary
      for (const file of electronicFiles) {
        const electronicImg = await cloudinary.uploader.upload(file.path, {
          folder: "ElectronicMaster/ElectronicImages",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        });

        electronicImgs.push({ url: electronicImg.secure_url, public_id: electronicImg.public_id });
        updateData.electronicImgs = electronicImgs;
      }
    }

    //delete temp unloaded files
    deleteTempFiles(electronicFiles);

    //Update electronic in database
    const updatedElectronic = await Electronic.findByIdAndUpdate(electronicID, updateData, { new: true });

    return res.status(200).json({ success: true, message: "Electronic updated successfully", data: updatedElectronic });
  } catch (error) {
    console.error("Error in update electronic: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteElectronic = async (req, res) => {
  try {
    //get electronicID
    const electronicID = req.params.id;
    const electronic = await Electronic.findById(electronicID);

    //check if electronic exists
    if (!electronic) {
      return res.status(404).json({ success: false, message: "Electronic not found" });
    }

    //Delete electronicImgs on cloudinary
    if (electronic.electronicImgs && electronic.electronicImgs.length > 0) {
      for (const img of electronic.electronicImgs) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    //delete electronic
    await Electronic.findByIdAndDelete(electronicID);
    res.status(200).json({ success: true, message: "Delete electronic successfully" });
  } catch (error) {
    console.error("Error in update electronic: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getAllElectronics = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    //get electronics number
    const totalElectronics = await Electronic.countDocuments({});

    //Apply pagination
    const paginationElec = pagination(
      {},
      totalElectronics,
      { page, limit }
    )

    //Find all electronics with pagination
    const electronics = await Electronic.find({})
      .skip(paginationElec.paginatedQuery.skip)
      .limit(paginationElec.paginatedQuery.limit)

    //Format description to remove HTML tags and preserve line breaks
    electronics.forEach(electronic => {
      electronic.description = removeHtmlTagsPreserveBreaks(electronic.description);
    });

    //return result
    res.status(200).json({
      success: true,
      electronics,
      pagination: {
        currentPage: paginationElec.currentPage,
        totalPages: paginationElec.totalPages,
        hasNextPage: paginationElec.hasNextPage,
        hasPreviousPage: paginationElec.hasPreviousPage,
        nextPage: paginationElec.nextPage,
        previousPage: paginationElec.previousPage
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteElectronicImg = async (req, res) => {
  try {
    const { id } = req.params;
    const { public_id } = req.body;

    //check if electronic exist
    const electronic = await Electronic.findById(id);

    if (!electronic) {
      return res.status(404).json({ success: false, message: "Electronic doesn't exist" });
    }

    //delete image on cloudinary
    await cloudinary.uploader.destroy(public_id);

    //delete image from electronicImgs array
    electronic.electronicImgs = electronic.electronicImgs.filter(img => img.public_id !== public_id);

    //save updated electronic
    await electronic.save();
    res.status(200).json({ success: true, message: "Image deleted successfully", data: electronic });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}