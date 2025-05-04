import { Order } from "../../models/order.model.js";
import { Account } from "../../models/account.model.js"
import { Electronic } from "../../models/electronic.model.js";
export const getAllOrderByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    //if we has status, we filter by status
    if (status) {
      filter.status = status;
    }

    //get order by status or get all
    const orders = await Order.find(filter)
      .populate('userID', 'name email phone')
      .populate("listElectronics.electronicID", "name price discount rating electronicImgs")
      .sort({ time: -1 });

    if (orders.length === 0) {
      return res.status(200).json({ success: true, message: "There is no order", data: orders })
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error in get orders by status (or All)", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderID, status } = req.body;

    //check if orderID and status exist
    if (!orderID || !status) {
      return res.status(400).json({ success: false, message: "orderID and status are required !" });
    }

    //get order you want update status
    const order = await Order.findOne({ _id: orderID });
    if (!order) {
      return res.status(400).json({ success: false, message: "Cannot find order " });
    }

    //get account
    const account = await Account.findOne({_id: order.userID});
    if(!account){
      return res.status(400).json({ success: false, message: "Cannot find account" });
    }

    //If status is delivered, you cannot update
    if(order.status === 'delivered' || order.status === 'canceled' || order.status === 'rejected'){
      return res.status(400).json({ success: false, message: `The Order is ${order.status}, You cannot update` });
    }

    if(status === 'delivered'){
      //update electronic quantitySold and available
      for(const item of order.listElectronics){
        const electronic = await Electronic.findById(item.electronicID);
        if(electronic){
          electronic.quantitySold += item.quantity;
          electronic.available -= item.quantity;
          await electronic.save();
        }
      }
    }

    //update order status
    order.status = status;
    await order.save();

    return res.status(200).json({ success: true, message: "Update order status successfully" });
  } catch (error) {
    console.error("Error in update orders status", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}