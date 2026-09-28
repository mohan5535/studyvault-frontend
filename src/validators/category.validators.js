// Validation rules for Categories. Kept as small, explicit pure functions —
// no external validation library — consistent with the approach used for
// auth in Phase 2.

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

/**
 * Validates input for creating/updating a category.
 * `partial` = true allows PUT requests where only some fields are present
 * (e.g. updating color without touching name) — though in this API both
 * name and color are accepted together, this keeps the validator reusable.
 *
 * Returns a `fields` object: empty means valid, otherwise maps
 * field name -> human-readable error message.
 */
function validateCategoryInput({ name, color }, { partial = false } = {}) {
  const fields = {};

  const nameProvided = name !== undefined;

  if (!partial || nameProvided) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
      fields.name = 'Name is required and must be between 2 and 60 characters.';
    }
  }

  if (color !== undefined && color !== null && color !== '') {
    if (typeof color !== 'string' || !HEX_COLOR_REGEX.test(color.trim())) {
      fields.color = 'Color must be a valid hex code, e.g. #2563eb.';
    }
  }

  return fields;
}

module.exports = { validateCategoryInput, HEX_COLOR_REGEX };
