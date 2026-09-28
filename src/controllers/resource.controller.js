const resourceModel = require('../models/resource.model');
const categoryModel = require('../models/category.model');
const {
  validateResourceInput,
  ALLOWED_TYPES,
} = require('../validators/resource.validators');

function apiError(statusCode, message, fields) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (fields) err.fields = fields;
  return err;
}

function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function parseOptionalCategoryId(value) {
  if (value === undefined || value === null || value === '') return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePositiveInt(value, fallback, max) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return Math.min(parsed, max);
}

/**
 * GET /api/resources
 * Supports ?search=&category=&type=&page=&limit=
 */
async function getAll(req, res, next) {
  try {
    const { search, category, type } = req.query;

    const page = parsePositiveInt(req.query.page, 1, 1000000);
    const limit = parsePositiveInt(req.query.limit, 10, 100);
    if (page === null || limit === null) {
      throw apiError(400, 'page and limit must be positive integers.');
    }

    const categoryId = category === undefined || category === ''
      ? undefined
      : Number(category);

    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) || categoryId <= 0)
    ) {
      throw apiError(400, 'category must be a positive integer.');
    }

    const normalizedType = type === undefined || type === '' ? undefined : String(type);
    if (normalizedType !== undefined && !ALLOWED_TYPES.includes(normalizedType)) {
      throw apiError(400, `type must be one of: ${ALLOWED_TYPES.join(', ')}.`);
    }

    const normalizedSearch = typeof search === 'string' ? search.trim() : '';

    const data = await resourceModel.findAllByUser(req.user.id, {
      search: normalizedSearch,
      categoryId,
      type: normalizedType,
      page,
      limit,
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/resources/:id
 */
async function getOne(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) throw apiError(404, 'Resource not found');

    const resource = await resourceModel.findByIdAndUser(id, req.user.id);
    if (!resource) throw apiError(404, 'Resource not found');

    return res.status(200).json({
      success: true,
      data: { resource },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/resources
 */
async function create(req, res, next) {
  try {
    const { title, url, type, description, categoryId } = req.body || {};

    const fields = validateResourceInput({
      title,
      url,
      type,
      description,
      categoryId,
    });

    if (Object.keys(fields).length > 0) {
      throw apiError(400, 'Validation failed', fields);
    }

    const normalizedCategoryId = parseOptionalCategoryId(categoryId);

    if (normalizedCategoryId !== null) {
      const category = await categoryModel.findByIdAndUser(
        normalizedCategoryId,
        req.user.id
      );
      if (!category) {
        throw apiError(404, 'Category not found');
      }
    }

    const resource = await resourceModel.create({
      userId: req.user.id,
      categoryId: normalizedCategoryId,
      title: title.trim(),
      url: url.trim(),
      type: type.trim(),
      description:
        typeof description === 'string' && description.trim()
          ? description.trim()
          : null,
    });

    return res.status(201).json({
      success: true,
      data: { resource },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /api/resources/:id
 */
async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) throw apiError(404, 'Resource not found');

    const { title, url, type, description, categoryId } = req.body || {};

    const fields = validateResourceInput({
      title,
      url,
      type,
      description,
      categoryId,
    });

    if (Object.keys(fields).length > 0) {
      throw apiError(400, 'Validation failed', fields);
    }

    const normalizedCategoryId = parseOptionalCategoryId(categoryId);

    if (normalizedCategoryId !== null) {
      const category = await categoryModel.findByIdAndUser(
        normalizedCategoryId,
        req.user.id
      );
      if (!category) throw apiError(404, 'Category not found');
    }

    const resource = await resourceModel.update(id, req.user.id, {
      categoryId: normalizedCategoryId,
      title: title.trim(),
      url: url.trim(),
      type: type.trim(),
      description:
        typeof description === 'string' && description.trim()
          ? description.trim()
          : null,
    });

    if (!resource) throw apiError(404, 'Resource not found');

    return res.status(200).json({
      success: true,
      data: { resource },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/resources/:id
 */
async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) throw apiError(404, 'Resource not found');

    const deleted = await resourceModel.remove(id, req.user.id);
    if (!deleted) throw apiError(404, 'Resource not found');

    return res.status(200).json({
      success: true,
      data: { message: 'Resource deleted successfully' },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
