const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/TransactionController');

router.post('/', TransactionController.create);
router.get('/', TransactionController.list);
router.delete('/:id', TransactionController.delete); // <-- É essa linha que ensina o caminho!

module.exports = router;