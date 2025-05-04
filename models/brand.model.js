import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
  name: { type: String },
  avatar: {
    url: String,
    public_id: String
  },
  description: String,
  itemList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Electronic',
  }]
}, {
  timestamps: true
})

export const Brand = mongoose.model('Brand', BrandSchema)