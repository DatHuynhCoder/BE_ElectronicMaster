import { Account } from "../../models/account.model.js";
import { pagination } from "../../utils/pagination.js";

export const getAllUser = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    //get user number
    const totalUser = await Account.countDocuments({});

    //Apply pagination
    const paginationUser = pagination(
      {},
      totalUser,
      { page, limit }
    )

    //FInd all users with pagination
    const users = await Account.find({})
      .skip(paginationUser.paginatedQuery.skip)
      .limit(paginationUser.paginatedQuery.limit)

    //return result
    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: paginationUser.currentPage,
        totalPages: paginationUser.totalPages,
        hasNextPage: paginationUser.hasNextPage,
        hasPreviousPage: paginationUser.hasPreviousPage,
        nextPage: paginationUser.nextPage,
        previousPage: paginationUser.previousPage
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" })
  }
}