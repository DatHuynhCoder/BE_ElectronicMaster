import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  OrderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  title: {type: String, default:""},
  content: {type: String,default:""}
},{
  timestamps: true
})

export const Notification = mongoose.model('Notification', NotificationSchema);