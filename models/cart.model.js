import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
    unique: true
  },
  listElectronics: [
    {
      electronicID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Electronic',
        required: true
      },
      quantity: { type: Number, required: true }
    }
  ],
}, {
  timestamps: true
})

export const Cart = mongoose.model('Cart', CartSchema);