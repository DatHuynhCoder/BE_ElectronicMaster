import cloudinary from "../../config/cloudinary.js";
import { Electronic } from "../../models/electronic.model.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

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
    const electronicID = req.params.id

    //find the electronic to update
    const electronic = await Electronic.findById(electronicID);

    //check if electronic exist
    if (!electronic) {
      return res.status(404).json({ success: false, message: "Electronic not found" });
    }

    //Parse specifications besause it's sent as a JSON string
    let specifications = JSON.parse(req.body.specifications);

    //Parse categories because it's sent as a JSON string
    let categories = JSON.parse(req.body.categories);

    const electronicFiles = req.files['electronicImgs'] || [];

    const electronicImgs = [];

    if (electronicFiles.length > 0) {
      //Delete old electronic images from cloudinary
      for (const img of electronic.electronicImgs) {
        await cloudinary.uploader.destroy(img.public_id);
      }

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
      }
    }

    //delete temp unloaded files
    deleteTempFiles(electronicFiles);

    //Create updated electronic
    const updateData = {
      name: req.body.name,
      electronicImgs: electronicImgs,
      available: req.body.available,
      mainCategory: req.body.mainCategory,
      categories: categories,
      description: req.body.description,
      price: req.body.price,
      discount: req.body.discount,
      brandName: req.body.brandName,
      specifications: specifications
    }

    //Update electronic in database
    const updatedElectronic = await Electronic.findByIdAndUpdate(electronicID, updateData, { new: true });

    res.status(200).json({ success: true, message: "Electronic updated successfully", data: updatedElectronic });
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