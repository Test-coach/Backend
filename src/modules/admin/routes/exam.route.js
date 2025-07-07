const express = require('express');
const examController = require('../controllers/exam.controller');
const { isAdmin } = require('../middleware/admin.auth.middleware');

const router = express.Router();

// POST /admin/
router.post('/course', isAdmin, examController.createCourse);
router.post('/tests', isAdmin, examController.createTest);

//Get /admin/
router.get('/courses', isAdmin, examController.getAllCourses);
router.get('/exams', isAdmin, examController.getAllExams);
router.get('/course/:courseName/tests', isAdmin, examController.getTestsByCourseName);

module.exports = router; 