import { Electronic } from '../../models/electronic.model.js';
import { Favorite } from '../../models/favorite.model.js'
import {Account} from '../../models/account.model.js'

export const addFavorite = async (req, res) => {
  try {
    const userID = req.user.id;
    const {electronicID} = req.body;

    //find the electronic to increase follower
    const electronic = await Electronic.findById(electronicID);

    //check if electronic exist
    if(!electronic){
      return res.status(400).json({success: false, message: "Electronic not found"})
    }

    //increase followers of electronic
    electronic.followers += 1;

    //save new electronic
    await electronic.save();

    //update fovorite
    const favorite = await Favorite.findOneAndUpdate(
      {userID},
      {$addToSet: {electronicIDs: electronicID}},
      {new: true, upsert: true}
    );

    res.status(200).json({success: true, data: favorite});
  } catch (error) {
    console.error("Add to favorite error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteFavortie = async (req, res) => {
  try {
    //get userID
    const userID = req.user.id;
    const {electronicID} = req.body

    //find the electronic to decrease followers
    const electronic = await Electronic.findById(electronicID);

    //check if electronic exist
    if(!electronic){
      return res.status(400).json({success: false, message: "Cannot find electronic"})
    }

    //decrease followers
    electronic.followers -= 1;

    //save updated electronic
    await electronic.save();

    const favorite = await Favorite.findOneAndUpdate(
      {userID},
      {$pull: {electronicIDs: electronicID}},
      {new: true}
    );

    res.status(200).json({success: true, data: favorite});
  } catch (error) {
    console.error("Delete favorite error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ userID: req.user.id }).populate('electronicIDs');

    if (!favorite) {
      return res.status(404).json({ success: false, message: "No favorites found" });
    }

    res.status(200).json({ success: true, data: favorite.electronicIDs });
  } catch (error) {
    console.error("Get favorite error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const checkFavorite = async (req,res) => {
  try {
    const userID = req.user.id;
    const electronicID = req.query.electronicID;
    //check if book in favorite list
    const favorite = await Favorite.findOne({userID: userID});

    //If user dont have a favorite list, return status: not in favorite
    if(!favorite){
      return res.status(200).json({success: true, status: false, message: `${req.user.role} dont have a favorite list`});
    }

    //Check if electronicID in user favorite list
    const isFavorite = favorite.electronicIDs.includes(electronicID);

    //If book is not in a favorite list, return status: not in favorite
    if(!isFavorite){
      return res.status(200).json({success: true, status: false});
    }

    //return book in favorite
    res.status(200).json({success: true, status: true});
  } catch (error) {
    console.error("Get favorite error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}