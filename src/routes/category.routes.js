const express = require('express');
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Every category route requires a valid JWT — applied once at the router
// level rather than repeated on each route.
router.use(authMiddleware);

router.get('/', categoryController.getAll);
router.post('/', categoryController.create);
router.get('/:id', categoryController.getOne);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.remove);

module.exports = router;
