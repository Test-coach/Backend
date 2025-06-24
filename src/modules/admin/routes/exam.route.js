const express = require('express');
const examController = require('../controllers/exam.controller');
const { isAdmin } = require('../middleware/admin.auth.middleware');

const router = express.Router();

// POST /admin/exams
router.post('/exams', isAdmin, examController.createExam);

module.exports = router; 