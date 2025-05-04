import mongoose, { Schema } from "mongoose"

const ReviewSchema = new mongoose.Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  content: {type: String, default: ''},
  electronicID: {
    type: Schema.Types.ObjectId,
    ref: 'Electronic',
    required: true
  },
  rating: {type: Number, default: 0},
  reviewImgs: [
    {
      url: String,
      public_id: String
    }
  ]
},{
  timestamps: true
});

export const Review = mongoose.model('Review', ReviewSchema)