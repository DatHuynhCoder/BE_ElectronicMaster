import { Electronic } from "../../models/electronic.model.js";
import { Order } from "../../models/order.model.js";

export const getWebStatistics = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const data = {};

    // Get total number of electronics
    const totalElectronics = await Electronic.countDocuments({});
    data.totalElectronics = totalElectronics;

    // Revenue and orders for today (based on delivered orders)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const deliveredOrdersToday = await Order.aggregate([
      { 
        $match: { 
          status: "delivered", 
          createdAt: { 
            $gte: startOfDay,
            $lt: endOfDay
          } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        } 
      }
    ]);
    
    data.deliveredOrdersToday = {
      totalRevenue: deliveredOrdersToday.length > 0 ? deliveredOrdersToday[0].totalRevenue : 0,
      totalOrders: deliveredOrdersToday.length > 0 ? deliveredOrdersToday[0].totalOrders : 0
    };

    // Revenue and orders for each month of the target year
    const deliveredOrdersByMonth = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: {
            $gte: new Date(targetYear, 0, 1),
            $lt: new Date(targetYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    // Create array with all 12 months, filling missing months with 0 values
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = deliveredOrdersByMonth.find(item => item._id.month === month);
      monthlyData.push({
        month: month,
        totalRevenue: monthData ? monthData.totalRevenue : 0,
        totalOrders: monthData ? monthData.totalOrders : 0
      });
    }
    
    data.deliveredOrdersByMonth = monthlyData;

    // Revenue and orders for the target year (total for the year)
    const deliveredOrdersForYear = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: {
            $gte: new Date(targetYear, 0, 1),
            $lt: new Date(targetYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    data.deliveredOrdersForYear = {
      year: targetYear,
      totalRevenue: deliveredOrdersForYear.length > 0 ? deliveredOrdersForYear[0].totalRevenue : 0,
      totalOrders: deliveredOrdersForYear.length > 0 ? deliveredOrdersForYear[0].totalOrders : 0
    };

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error("Error in getting web statistics:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error in getting web statistics",
      error: error.message 
    });
  }
}