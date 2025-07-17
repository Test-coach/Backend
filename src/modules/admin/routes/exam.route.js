const express = require('express');
const examController = require('../controllers/exam.controller');
const { isAdmin } = require('../middleware/admin.auth.middleware');

const router = express.Router();

// POST
router.post('/course', isAdmin, examController.createCourse);
router.post('/tests', isAdmin, examController.createTest);
router.post('/add-course-coupon', isAdmin, examController.createCourseCoupon);
router.post('/add-coupon', isAdmin, examController.createCoupon);

//Get
router.get('/courses', isAdmin, examController.getAllCourses);
router.get('/exams', isAdmin, examController.getAllExams);
router.get('/course/:courseName/tests', isAdmin, examController.getTestsByCourseName);
router.get('/coupons', isAdmin, examController.getAllCoupons);
router.get('/admin/course/:courseName', isAdmin, examController.getCourse)
router.get('/coupon/:code', isAdmin, examController.getCouponByCode);

//update
router.put('/test/change-status', isAdmin, examController.setTestActiveStatus);
router.put('/update-test', isAdmin, examController.updateTestByName);

//delete
router.delete('/delete-test', isAdmin, examController.updateCourseDeleteTest);
router.delete('/delete-course', isAdmin, examController.updateCourseDeleteCourse);
router.delete('/coupon/:code', isAdmin, examController.deleteCoupon);

module.exports = router;