import { Electronic } from '../../models/electronic.model.js';
import { Order } from '../../models/order.model.js';

export const createOrder = async (req, res) => {
  try {
    const userID = req.user.id;
    const { listElectronics, note, paymentMethod, address } = req.body;

    //validate data
    if (!paymentMethod || !address) {
      return res.status(400).json({
        success: false,
        message: "Payment Method and address are required"
      })
    }

    //Validate listElectronics
    if (!listElectronics || !Array.isArray(listElectronics) || listElectronics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "List electronics are required"
      })
    }

    let totalPrice = 0;
    let quantity = 0;
    const validateElectronics = [];

    //Processing all electronics
    for (const elec of listElectronics) {
      const { electronicID, quantity: qty } = elec;

      //check if electronicID and quantity is valid
      if (!electronicID || typeof qty !== "number" || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: "Each electronic must have a valid ID and quantity > 0",
        });
      }

      //Check if can find Electronic
      const foundElectronic = await Electronic.findById(electronicID);
      if (!foundElectronic) {
        return res.status(404).json({
          success: false,
          message: "Electronic not found",
        });
      }

      //check if available > quantity
      if (foundElectronic.available < qty) {
        return res.status(400).json({
          success: false,
          message: `Dish with ID ${electronicID} is not available in quantity ${qty}`,
        });
      }

      totalPrice += (foundElectronic.discount ? foundElectronic.discount : foundElectronic.price) * qty;
      quantity += qty;

      validateElectronics.push({electronicID, quantity: qty});
    }

    const order = await Order.create({
      quantity,
      status: "pending",
      totalPrice,
      listElectronics: validateElectronics,
      note: note || "",
      userID: userID,
      paymentMethod,
      address: address
    })

    return res.status(200).json({success: true, data: order});
  } catch (error) {
    console.error("Error in create order:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getOrderByUserIDandStatus = async (req, res) => {
  try {
    const userID = req.user.id;
    const {status} = req.query;

    const filter = {userID: userID};
    //if has status we filter by status
    if(status){
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("listElectronics.electronicID", "name price discount rating electronicImgs")
      .sort({time: -1});

    if(orders.length == 0) {
      return res.status(200).json({success: true, message:"There no orders"})
    }

    return res.status(200).json({success: true, data: orders});
  } catch (error) {
    console.error("Error in create reservation:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const cancelOrder = async (req, res) => {
  try {
    const userID = req.user.id;

    //get orderID
    const orderID = req.params.id;

    //get Order and check
    const order = await Order.findOne({_id: orderID, userID: userID});
    if(!order){
      return res.status(404).json({success: false, message: "Order not found"});
    }

    if(order.status != 'pending'){
      return res.status(404).json({success: false, message: "You only can cancel pending order!"});
    }

    //cancel Order
    order.status = 'canceled';

    //save order status
    await order.save();

    return res.status(200).json({success: true, message: "Your Order has been canceled"});
  } catch (error) {
    console.error("Error in create reservation:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getCart = async (req,res) => {
  try {
    const userID = req.user.id;

    //Find cart
    const cart = await Order.find({
      status: { $in: ['pending', 'confirmed', 'processing', 'in transit']},
      userID: userID
    })

    //check if find any
    if(cart.length === 0){
      return res.status(201).json({success: true, data: cart, message: "Your cart is empty"});
    }

    res.status(200).json({success: true, data: cart});
  } catch (error) {
    console.error("Error in get cart: ", error.message);
    return res.status(500), json({success: false, message: "Server error"});
  }
}