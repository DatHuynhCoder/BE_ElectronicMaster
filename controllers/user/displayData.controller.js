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
      keyword,
      slugCates,
      brandNames,
      sort = 'publishDate', // Default sort by publishDate
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    const query = {};

    // Handle keyword search if provided
    if (keyword) {
      const searchOptions = search(keyword);
      if (searchOptions) {
        query.slugName = { $regex: searchOptions.regex };
      }
    }

    // Handle category filter if provided
    if (slugCates && slugCates.trim() !== "") {
      const slugList = slugCates.split(",").map((slug) => slug.trim()).filter(Boolean);
      if (slugList.length > 0) {
        query.slugCate = { $in: slugList };
      }
    }

    // Handle brand filter if provided
    if (brandNames && brandNames.trim() !== "") {
      const brandList = brandNames.split(",").map((b) => b.trim()).filter(Boolean);
      if (brandList.length > 0) {
        query.brandName = { $in: brandList };
      }
    }

    // Handle sorting
    let sortCriteria = {};

    // Parse sort parameter (can be comma-separated for multiple sort criteria)
    const sortFields = sort.split(',');

    // Build sort object
    sortFields.forEach(field => {
      const [fieldName, order] = field.split(':');

      // Only allow valid fields
      if (['quantitySold', 'price', 'rating', 'publishDate'].includes(fieldName)) {
        sortCriteria[fieldName] = order === 'asc' ? 1 : -1; // Default to desc if not specified
      }
    });

    // If no valid sort criteria were provided, default to publishDate descending
    if (Object.keys(sortCriteria).length === 0) {
      sortCriteria = { publishDate: -1 };
    }

    // Apply pagination
    const totalItems = await Electronic.countDocuments(query);
    const paginationInfo = pagination(
      { sort: sortCriteria },
      totalItems,
      { page, limit }
    );

    // Execute the query with pagination
    const electronics = await Electronic.find(query)
      .sort(paginationInfo.paginatedQuery.sort)
      .skip(paginationInfo.paginatedQuery.skip)
      .limit(paginationInfo.paginatedQuery.limit);

    // Return the results
    res.status(200).json({
      success: true,
      electronics,
      pagination: {
        currentPage: paginationInfo.currentPage,
        totalPages: paginationInfo.totalPages,
        hasNextPage: paginationInfo.hasNextPage,
        hasPreviousPage: paginationInfo.hasPreviousPage,
        nextPage: paginationInfo.nextPage,
        previousPage: paginationInfo.previousPage
      }
    });

  } catch (error) {
    console.error('Error searching electronics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search electronics',
      error: error.message
    });
  }
}