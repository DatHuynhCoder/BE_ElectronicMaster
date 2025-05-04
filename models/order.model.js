import mongoose, { Schema } from "mongoose";

const OrderSchema = new mongoose.Schema({
  quantity: { type: Number, default: 0 },
  time: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  listElectronics: [
    {
      electronicID: {
        type: Schema.Types.ObjectId,
        ref: 'Electronic',
        required: true
      },
      quantity: { type: Number, required: true }
    }
  ],
  note: { type: String },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  address: {
    name:String,
    address:String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['direct','momo','banking'],
    default: 'direct'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  status:{
    type: String,
    enum: ['pending','canceled','rejected','confirmed','processing','in transit','delivered'],
    default: 'pending'
  },
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', OrderSchema)