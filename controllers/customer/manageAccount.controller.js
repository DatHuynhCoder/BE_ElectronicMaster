import { Account } from "../../models/account.model.js";
import cloudinary from "../../config/cloudinary.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

export const getAccountById = async (req, res) => {
  try {
    //get userID
    const userID = req.user.id;
    const account = await Account.findById(userID);

    //check if account exist
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }
    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Error in get account: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateAccount = async (req, res) => {
  try {
    //get account id from request
    const userID = req.user.id;

    //get update account info from request
    const updateAccount = { ...req.body };

    //Prevent updating email and password
    delete updateAccount.email;
    delete updateAccount.password;

    //upload avatar
    const avatar = req.file;
    if (avatar) {
      const account = await Account.findById(userID);
      //Check if account exist
      if (!account) {
        return res.status(404).json({ success: false, message: "account not found" });
      }
      //Delete old avatar if exist
      if (account.avatar && account.avatar.public_id) {
        await cloudinary.uploader.destroy(account.avatar.public_id);
      }

      //Upload new avatar
      const avatarCloudinary = await cloudinary.uploader.upload(avatar.path, {
        folder: "ElectronicMaster/Avatar",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      });

      updateAccount.avatar = {
        url: avatarCloudinary.secure_url,
        public_id: avatarCloudinary.public_id
      };
    }

    //delete temporary file
    deleteTempFiles([req.file?.avatar]);

    //Parse addressList to array of objects - Handle both string and array
    if (updateAccount.addressList) {
      let addressList;
      
      // Check if addressList is already an array (sent as JSON) or a string
      if (typeof updateAccount.addressList === 'string') {
        try {
          addressList = JSON.parse(updateAccount.addressList);
        } catch (error) {
          console.error("Error parsing addressList JSON:", error);
          return res.status(400).json({ success: false, message: "Invalid addressList format" });
        }
      } else if (Array.isArray(updateAccount.addressList)) {
        // Already an array, use it directly
        addressList = updateAccount.addressList;
      } else {
        return res.status(400).json({ success: false, message: "addressList must be an array or JSON string" });
      }

      //Check if addressList is an array
      if (!Array.isArray(addressList)) {
        return res.status(400).json({ success: false, message: "addressList must be an array" });
      }

      updateAccount.addressList = addressList.map((address) => {
        return {
          name: address.name,
          address: address.address,
          phone: address.phone
        }
      });
      
    }


    //update account info
    const account = await Account.findByIdAndUpdate(userID, updateAccount, { new: true });
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }
    
    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Error in update account info: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const changePassword = async (req, res) => {
  try {
    //get userID
    const userID = req.user.id;
    const account = await Account.findById(userID);
    //check if account exist
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }

    //get pass and new pass
    const { password, newpassword } = req.body;

    //Check if pasword match account password
    const isMatch = await account.matchPassword(password);

    //if password not match
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password doesn't match" });
    }

    //Change to new password (account has hash function so we dont need to use it here)
    account.password = newpassword;

    //update account
    await account.save();

    res.status(200).json({ success: true, message: "Account updated sucessfully!" });
  } catch (error) {
    console.error('Error in change password', error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteAccount = async (req, res) => {
  try {
    //get userID
    const userID = req.user.id;

    //find account and delete
    const account = await Account.findByIdAndDelete(userID);

    //Check if delete account successfully
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }
    res.status(200).json({ success: true, message: "Delete account successfully", data: account });
  } catch (error) {
    console.error('Error in change password', error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

