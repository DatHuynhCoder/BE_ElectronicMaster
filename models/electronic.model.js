import mongoose from "mongoose"

const ElectronicSchema = new mongoose.Schema({
  name: {type: String},
  electronicImgs: [
    {
      url: String,
      public_id: String,
    }
  ],
  available: {type: Number, default: 0},
  mainCategory: {type: String},
  slugCate: {type: String},
  categories: {type: [String], default: []},
  description: {type: String, default: ""},
  price: {type: Number, default: 0},
  discount: {type: Number},
  quantitySold: {type: Number, default: 0},
  brandName: {type: String},
  publishDate: {type: Date, default: Date.now},
  rating: {type: Number, default: 0},
  followers: { type: Number, default: 0 },
  numReview: {type: Number, default: 0},
  specifications: [
    {
      name: String,
      attributes: [
        {
          code: String,
          name: String,
          value: String
        }
      ]
    }
  ]
},{
  timestamps: true
})

export const Electronic = mongoose.model('Electronic', ElectronicSchema)