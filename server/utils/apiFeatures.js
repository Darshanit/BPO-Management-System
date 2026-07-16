/**
 * APIFeatures
 * Wraps a Mongoose Query to apply consistent filtering, searching, sorting,
 * field-limiting, and pagination across every "list" endpoint in the app.
 *
 * Usage:
 *   const features = new APIFeatures(Employee.find(), req.query)
 *     .filter()
 *     .search(['designation', 'skills'])
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const results = await features.query;
 *   const total = await features.countTotal(Employee);
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /** Applies exact-match / range filters from query params (excluding reserved keys). */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Support gte/gt/lte/lt operators e.g. ?salary[gte]=30000
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /** Case-insensitive partial-match search across the given fields via ?search=term */
  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const regex = new RegExp(this.queryString.search, 'i');
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  /** ?sort=field1,-field2  (prefix "-" for descending) */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /** ?fields=name,email,role */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /** ?page=2&limit=20 */
  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }

  /** Runs a count on the same filter (ignoring pagination) for building meta.total */
  async countTotal(Model) {
    const filterQuery = this.query.getFilter();
    const total = await Model.countDocuments(filterQuery);
    const limit = this.pagination?.limit || 20;
    return {
      total,
      page: this.pagination?.page || 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = APIFeatures;
