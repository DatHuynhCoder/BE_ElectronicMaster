import { Electronic } from "../../models/electronic.model.js";
import { Review } from "../../models/review.model.js"
import { search } from "../../utils/search.js"
import { pagination } from "../../utils/pagination.js";
import { removeHtmlTagsPreserveBreaks } from "../../utils/removeHTMLtags.js";
export const getElectronicById = async (req, res) => {
  try {
    //get electronic id
    const electronicID = req.params.id;
    const electronic = await Electronic.findById(electronicID);


    //check if electronic exist
    if (!electronic) {
      return res.status(404).json({ success: false, message: `Electronic with id: ${electronicID} not found` });
    }
    //Format description to remove HTML tags and preserve line breaks
    electronic.description = removeHtmlTagsPreserveBreaks(electronic.description);
    res.status(200).json({ success: true, data: electronic })
  } catch (error) {
    console.error("Error in get electronic: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getAllCategories = async (req, res) => {
  try {
    //get all categories
    const catergories = await Electronic.distinct('mainCategory');

    //check if can find at least 1 category
    if (!catergories) {
      return res.status(404).json({ success: false, message: "Categories not found" });
    }

    res.status(200).json({ success: true, data: catergories });
  } catch (error) {
    console.error("Error get all categories", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getCommentsByElectronicID = async (req, res) => {
  try {
    const electronicID = req.params.id;
    const comments = await Review.find({ electronicID: electronicID });

    //check if comments exist
    if (!comments) {
      return res.status(200).json({ success: true, data: comments })
    }

    res.status(200).json({ success: true, data: comments })
  } catch (error) {
    console.error("Error get comments by electronicID", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const searchElectronic = async (req, res) => {
  try {
    const {
      keyword = "",
      slugCates = "",       // dạng "slug1,slug2"
      brandNames = "",      // dạng "Apple,Samsung"
      sortBy = "publishDate", // quantitySold | rating | price | publishDate
      sortOrder = "desc",     // asc | desc
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Tìm theo tên sản phẩm (không dấu)
    if (keyword && keyword.trim() !== "") {
      const keywordSearch = search(keyword);
      if (keywordSearch && keywordSearch.regex) {
        query.slugName = { $regex: keywordSearch.regex };
      }
    }

    // Lọc theo slugCate (cho phép nhiều)
    if (slugCates && slugCates.trim() !== "") {
      const slugList = slugCates.split(",").map((slug) => slug.trim()).filter(Boolean);
      if (slugList.length > 0) {
        query.slugCate = { $in: slugList };
      }
    }

    // Lọc theo brandName (cho phép nhiều)
    if (brandNames && brandNames.trim() !== "") {
      const brandList = brandNames.split(",").map((b) => b.trim()).filter(Boolean);
      if (brandList.length > 0) {
        query.brandName = { $in: brandList };
      }
    }

    // Tổng số kết quả để phân trang
    const totalItems = await Electronic.countDocuments(query);

    // Phân trang
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const { paginatedQuery, ...pageData } = pagination(query, totalItems, {
      page: pageInt,
      limit: limitInt,
    });

    // Sắp xếp
    const sortField = ["quantitySold", "rating", "price", "publishDate"].includes(sortBy)
      ? sortBy
      : "publishDate";

    const sortValue = sortOrder === "asc" ? 1 : -1;

    // Truy vấn dữ liệu
    const results = await Electronic.find(query)
      .sort({ [sortField]: sortValue })
      .skip(paginatedQuery.skip)
      .limit(paginatedQuery.limit);

    return res.status(200).json({
      success: true,
      data: results,
      totalItems,
      ...pageData,
    });
  } catch (error) {
    console.error("Error get search electronic", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}