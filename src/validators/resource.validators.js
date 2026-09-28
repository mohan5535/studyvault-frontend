const ALLOWED_TYPES = [
  'documentation',
  'article',
  'video',
  'course',
  'website',
  'other',
];

const URL_REGEX = /^https?:\/\/[^\s]+$/i;

function validateResourceInput(
  { title, url, type, description, categoryId },
  { partial = false } = {}
) {
  const fields = {};

  const titleProvided = title !== undefined;
  const urlProvided = url !== undefined;
  const typeProvided = type !== undefined;

  if (!partial || titleProvided) {
    if (
      typeof title !== 'string' ||
      title.trim().length < 3 ||
      title.trim().length > 200
    ) {
      fields.title = 'Title is required and must be between 3 and 200 characters.';
    }
  }

  if (!partial || urlProvided) {
    if (typeof url !== 'string' || !URL_REGEX.test(url.trim())) {
      fields.url = 'URL is required and must start with http:// or https://.';
    }
  }

  if (!partial || typeProvided) {
    if (typeof type !== 'string' || !ALLOWED_TYPES.includes(type.trim())) {
      fields.type = `Type must be one of: ${ALLOWED_TYPES.join(', ')}.`;
    }
  }

  if (description !== undefined && description !== null && description !== '') {
    if (typeof description !== 'string' || description.trim().length > 1000) {
      fields.description = 'Description must be at most 1000 characters.';
    }
  }

  if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
    const numericCategoryId = Number(categoryId);
    if (!Number.isInteger(numericCategoryId) || numericCategoryId <= 0) {
      fields.categoryId = 'Category ID must be a positive integer or null.';
    }
  }

  return fields;
}

module.exports = { validateResourceInput, ALLOWED_TYPES, URL_REGEX };
