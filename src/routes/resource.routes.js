const express = require('express');
const resourceController = require('../controllers/resource.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All resource endpoints are protected.
router.use(authMiddleware);

router.get('/', resourceController.getAll);
router.post('/', resourceController.create);
router.get('/:id', resourceController.getOne);
router.put('/:id', resourceController.update);
router.delete('/:id', resourceController.remove);

module.exports = router;
