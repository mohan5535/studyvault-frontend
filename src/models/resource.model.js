const pool = require('../config/db');

/**
 * Resource queries are always scoped by user_id.
 * Dynamic filtering only changes the WHERE clauses; all values are
 * parameterized to prevent SQL injection.
 */

const RESOURCE_COLUMNS = `
  r.id,
  r.user_id,
  r.category_id,
  r.title,
  r.url,
  r.type,
  r.description,
  r.created_at,
  r.updated_at,
  c.name AS category_name,
  c.color AS category_color
`;

async function findAllByUser(userId, { search, categoryId, type, page, limit }) {
  const conditions = ['r.user_id = $1'];
  const values = [userId];
  let paramIndex = 2;

  if (search) {
    conditions.push(`(r.title ILIKE $${paramIndex} OR COALESCE(r.description, '') ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex += 1;
  }

  if (categoryId !== undefined && categoryId !== null) {
    conditions.push(`r.category_id = $${paramIndex}`);
    values.push(categoryId);
    paramIndex += 1;
  }

  if (type) {
    conditions.push(`r.type = $${paramIndex}`);
    values.push(type);
    paramIndex += 1;
  }

  const whereClause = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM resources r
     WHERE ${whereClause}`,
    values
  );

  const dataValues = [...values, limit, offset];
  const result = await pool.query(
    `SELECT ${RESOURCE_COLUMNS}
     FROM resources r
     LEFT JOIN categories c ON c.id = r.category_id
     WHERE ${whereClause}
     ORDER BY r.created_at DESC, r.id DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    dataValues
  );

  const total = countResult.rows[0].total;

  return {
    resources: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

async function findByIdAndUser(id, userId) {
  const result = await pool.query(
    `SELECT ${RESOURCE_COLUMNS}
     FROM resources r
     LEFT JOIN categories c ON c.id = r.category_id
     WHERE r.id = $1 AND r.user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function create({ userId, categoryId, title, url, type, description }) {
  const result = await pool.query(
    `INSERT INTO resources
       (user_id, category_id, title, url, type, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, category_id, title, url, type, description,
               created_at, updated_at`,
    [userId, categoryId || null, title, url, type, description || null]
  );

  return findByIdAndUser(result.rows[0].id, userId);
}

async function update(id, userId, { categoryId, title, url, type, description }) {
  const result = await pool.query(
    `UPDATE resources
     SET category_id = $1,
         title = $2,
         url = $3,
         type = $4,
         description = $5,
         updated_at = now()
     WHERE id = $6 AND user_id = $7
     RETURNING id`,
    [categoryId || null, title, url, type, description || null, id, userId]
  );

  if (result.rowCount === 0) return null;
  return findByIdAndUser(id, userId);
}

async function remove(id, userId) {
  const result = await pool.query(
    `DELETE FROM resources
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  findAllByUser,
  findByIdAndUser,
  create,
  update,
  remove,
};
