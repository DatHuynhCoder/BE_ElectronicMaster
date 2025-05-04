import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
    unique: true
  },
  electronicIDs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Electronic"
    }
  ]
  
}, {
  timestamps: true
});

export const Favorite = mongoose.model('Favorite', FavoriteSchema)