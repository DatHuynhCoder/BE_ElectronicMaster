import { Electronic } from "../../models/electronic.model.js";
import { Order } from "../../models/order.model.js";

export const getWebStatistics = async (req, res) => {
  try {
    // Get the year
    const {year} = req.query;
    const data = {};
    //get number of electronics
    const totalElectronics = await Electronic.countDocuments({});
    data.totalElectronics = totalElectronics;

    //revenue in day, month and year base on orders status dilivered
    const today = new Date();

    //electronics delivered today, number of electronics delivered today
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const deliveredElectronicsToday = await Order.aggregate([
      { $match: { status: "delivered", createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);

    //add today data to data object
    data.deliveredElectronicsToday = {
      totalRevenue: deliveredElectronicsToday.length > 0 ? deliveredElectronicsToday[0].totalRevenue : 0,
      totalElectronics: deliveredElectronicsToday.length > 0 ? deliveredElectronicsToday.length : 0
    };

    //electronics delivered each month, total revenue and number of electronics delivered each month
    const deliveredElectronicsByMonth = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: {
            $gte: new Date(today.getFullYear(), 0, 1),
            $lt: new Date(today.getFullYear() + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          totalRevenue: { $sum: "$totalPrice" },
          totalElectronics: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.month": 1 } // Sắp xếp theo tháng
      }
    ]);
    //add month data to data object
    data.deliveredElectronicsByMonth = deliveredElectronicsByMonth.map(monthData => ({
      month: monthData._id.month,
      totalRevenue: monthData.totalRevenue,
      totalElectronics: monthData.totalElectronics
    }));

    //electronics delivered each year, total revenue and number of electronics delivered each year
    const deliveredElectronicsByYear = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: {
            $gte: new Date(today.getFullYear() - 1, 0, 1),
            $lt: new Date(today.getFullYear() + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" } },
          totalRevenue: { $sum: "$totalPrice" },
          totalElectronics: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1 } // Sắp xếp theo năm
      }
    ]);
    //add year data to data object
    data.deliveredElectronicsByYear = deliveredElectronicsByYear.map(yearData => ({
      year: yearData._id.year,
      totalRevenue: yearData.totalRevenue,
      totalElectronics: yearData.totalElectronics
    }));


    res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in getting web statistics" });
  }
}