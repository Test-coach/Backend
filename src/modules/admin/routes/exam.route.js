const express = require('express');
const examController = require('../controllers/exam.controller');
const { isAdmin } = require('../middleware/admin.auth.middleware');

const router = express.Router();

// POST /admin/
router.post('/exams', isAdmin, examController.createExam);
router.post('/tests', isAdmin, examController.createTest);

//Get /admin/
router.get('/exams', isAdmin, examController.getAllExamName);

module.exports = router; 