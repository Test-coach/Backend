const prisma = require('../../../db/prisma');
const { AuthError } = require('../../shared/utils/error');
const SuccessResponse = require('../../shared/utils/success');

class ExamController {
  async createCourse(req, res, next) {
    try {
      const {
        name,
        slug,
        examType,
        description,
        price,
        discountPrice,
        language = 'en',
        validityMonths,
        tests = [],
        coverImageUrl
      } = req.body;

      if (!name ) {
        const error = new AuthError('Missing required fields: name.', 400);
        return error.sendResponse(res);
      }
      
      // Generate slug if not provided
      const finalSlug = slug && slug.length > 0 ? slug : slugify(name);

      if (!examType) {
        const error = new AuthError('Missing required fields: examType.', 400);
        return error.sendResponse(res);
      }

      if (price === undefined) {
        const error = new AuthError('Missing required fields: price.', 400);
        return error.sendResponse(res);
      }

      // Check if an exam with the same slug already exists
      const existingExam = await prisma.govtExam.findUnique({ where: { slug: finalSlug } });
      if (existingExam) {
        const error = new AuthError('An exam with this slug already exists.', 409);
        return error.sendResponse(res);
      }

      const dataForPrisma = {
        name,
        slug: finalSlug,
        examType,
        description,
        price,
        discountPrice,
        language,
        validityMonths,
        coverImageUrl,
        tests: tests && tests.length > 0 ? {
          create: tests.map(test => ({
            name: test.name,
            slug: test.slug || slugify(test.name),
            durationMinutes: test.duration || test.durationMinutes || 0,
            isActive: true
          }))
        } : undefined
      };
    
      const exam = await prisma.govtExam.create({
        data: dataForPrisma,
        include: { tests: true }
      });

      return new SuccessResponse('Exam created successfully', { exam }, 201).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      // Handle unique constraint error from Prisma
      if (error.code === 'P2002' && error.meta && error.meta.target && error.meta.target.includes('slug')) {
        const err = new AuthError('An exam with this slug already exists.', 409);
        return err.sendResponse(res);
      }
      next(error);
    }
  }

  async createTest(req,res,next){
    try {
      let {
        examId, 
        name, 
        slug, 
        description, 
        durationMinutes,
        language,
        instructions,
      } = req.body;

      if(!name){
        const error = new AuthError('Missing required fields: test name.', 400);
        return error.sendResponse(res);
      }

      if(!examId){
        const error = new AuthError('A examId is compulsary.', 400);
        return error.sendResponse(res);
      }

      if(!durationMinutes){
        const error = new AuthError('Missing required fields: durationMinutes', 400);
        return error.sendResponse(res);
      }

      if(!slug){
        slug = slugify(name);
      }

      const test = await prisma.test.create({
        data: {
          examId, 
          name, 
          slug, 
          description, 
          durationMinutes,
          language,
          instructions
        }
      });

      return new SuccessResponse('Test created successfully', { test }, 201).sendResponse(res);

    } catch (error) {
      if(error instanceof AuthError){
        return error.sendResponse(res);
      }
      next(error);
    }
  }

  async getAllCourses(req,res,next){
    try {
      const allExams = await prisma.govtExam.findMany({
        select: {
          examType: true,
          name: true,
          description: true,
          isActive: true,
          price: true,
          validityMonths:true
        }
      });

      return new SuccessResponse('All exams data fetched successfully', {allExams}, 201).sendResponse(res);
    } catch (error) {
      if(error instanceof AuthError){
        return error.sendResponse(res);
      }
      next(error);
    }
  }

  async getAllExams(req, res, next) {
    try {
      const exams = await prisma.govtExam.findMany({
        include: { tests: true }
      });
      return new SuccessResponse('All exams fetched successfully', { exams }, 200).sendResponse(res);
    } catch (error) {
      if(error instanceof AuthError){
        return error.sendResponse(res);
      }
      next(error);
    }
  }

  async getTestsByCourseName(req, res, next) {
    try {
      const { courseName } = req.params;
      if (!courseName) {
        return new AuthError('Course name is required.', 400).sendResponse(res);
      }
      const course = await prisma.govtExam.findUnique({
        where: { name: courseName },
        include: { tests: true }
      });
      if (!course) {
        return new AuthError('Course not found.', 404).sendResponse(res);
      }
      return new SuccessResponse('Tests fetched successfully', { tests: course.tests }, 200).sendResponse(res);
    } catch (error) {
      if(error instanceof AuthError){
        return error.sendResponse(res);
      }
      next(error);
    }
  }

  async updateCourseDeleteTest(req, res, next) {
    try {
      const { courseName, testName } = req.body;
    
      if (!courseName) {
        return new AuthError('Course name is required.', 400).sendResponse(res);
      }

      if (!testName) {
        return new AuthError('Test name is required.', 400).sendResponse(res);
      }
      
      const testToRemove = await prisma.test.findFirst({
        where: {
          name: testName,
          exam: {
            name: courseName
          }
        }
      });

      if(!testToRemove){
        return new AuthError('Test not found in this course.', 404).sendResponse(res);
      }
       await prisma.test.delete({
        where: { id: testToRemove.id }
      });

      const updatedCourse = await prisma.govtExam.findUnique({
        where: { name: courseName },
        include: { tests: true }
      });

      return new SuccessResponse('Test removed successfully', { 
        course: updatedCourse,
        removedTest: testName 
      }, 200).sendResponse(res);

    } catch (error) {
      if(error instanceof AuthError){
        return error.sendResponse(res);
      }
      next(error);
    }
  }

  async setTestActiveStatus(req, res, next) {
    try {
      const { courseName, testName, active } = req.body;

      if (!courseName) {
        return new AuthError('Course name is required.', 400).sendResponse(res);
      }
      if (!testName) {
        return new AuthError('Test name is required.', 400).sendResponse(res);
      }
      if (typeof active !== 'boolean') {
        return new AuthError('Active field must be true or false.', 400).sendResponse(res);
      }

      const testToUpdate = await prisma.test.findFirst({
        where: {
          name: testName,
          exam: {
            name: courseName
          }
        }
      });

      if (!testToUpdate) {
        return new AuthError('Test not found in this course.', 404).sendResponse(res);
      }

      await prisma.test.update({
        where: { id: testToUpdate.id },
        data: { isActive: active }
      });

      const updatedTest = await prisma.test.findUnique({
        where: { id: testToUpdate.id }
      });

      return new SuccessResponse(
        `Test ${active ? 'activated' : 'deactivated'} successfully`,
        { test: updatedTest },
        200
      ).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      next(error);
    }
  }

  async updateTestByName(req, res, next) {
    try {
      const { testName, courseName, ...updateFields } = req.body;
  
      if (!testName) {
        return new AuthError('Test name is required.', 400).sendResponse(res);
      }
  
      let testToUpdate;
      if (courseName) {
        testToUpdate = await prisma.test.findFirst({
          where: {
            name: testName,
            exam: { name: courseName }
          }
        });
      } else {
        testToUpdate = await prisma.test.findFirst({
          where: { name: testName }
        });
      }
  
      if (!testToUpdate) {
        return new AuthError('Test not found.', 404).sendResponse(res);
      }
  
      // Remove testName and courseName from updateFields if present
      delete updateFields.testName;
      delete updateFields.courseName;
  
      // Update the test with the provided fields
      const updatedTest = await prisma.test.update({
        where: { id: testToUpdate.id },
        data: updateFields
      });
  
      return new SuccessResponse('Test updated successfully', { test: updatedTest }, 200).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      next(error);
    }
  }

  async updateCourseDeleteCourse(req, res, next) {
    try {
      const { courseName } = req.body;
      if (!courseName) {
        return new AuthError('Course name is required.', 400).sendResponse(res);
      }

      const course = await prisma.govtExam.findUnique({ where: { name: courseName } });
      if (!course) {
        return new AuthError('Course not found.', 404).sendResponse(res);
      }

      await prisma.test.deleteMany({ where: { examId: course.id } });

      await prisma.govtExam.delete({ where: { id: course.id } });

      return new SuccessResponse('Course and its tests deleted successfully', { courseName }, 200).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      return next(error);
    }
  }

  async createCourseCoupon(req, res, next) {
    try {
      const {
        courseName,
        couponCode,
        discountType = 'percentage', // 'percentage' or 'fixed'
        discountValue,
        maxDiscount, // for percentage type
        minPurchase,
        startDate,
        endDate,
        maxUses,
        maxUsesPerUser,
        isActive = true
      } = req.body;

      if (!courseName || !couponCode || discountValue === undefined) {
        return new AuthError('Missing required fields: courseName, couponCode, discountValue.', 400).sendResponse(res);
      }
      if (discountType !== 'percentage' && discountType !== 'fixed') {
        return new AuthError('discountType must be either "percentage" or "fixed".', 400).sendResponse(res);
      }
      if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
        return new AuthError('For percentage coupons, discountValue must be between 1 and 100.', 400).sendResponse(res);
      }
      if (discountType === 'fixed' && discountValue < 1) {
        return new AuthError('For fixed coupons, discountValue must be at least 1.', 400).sendResponse(res);
      }

      // Find the course by name
      const course = await prisma.govtExam.findUnique({ where: { name: courseName } });
      if (!course) {
        return new AuthError('Course not found.', 404).sendResponse(res);
      }

      // Check if coupon code already exists
      const existingCoupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (existingCoupon) {
        return new AuthError('Coupon code already exists.', 409).sendResponse(res);
      }

      // Set coupon validity
      const now = new Date();
      const couponStartDate = startDate ? new Date(startDate) : now;
      const couponEndDate = endDate ? new Date(endDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

      // Prepare coupon data
      const couponData = {
        code: couponCode,
        type: discountType,
        value: discountValue,
        start_date: couponStartDate,
        end_date: couponEndDate,
        is_active: isActive,
      };
      if (maxDiscount !== undefined) couponData.max_discount = maxDiscount;
      if (minPurchase !== undefined) couponData.min_purchase = minPurchase;
      if (maxUses !== undefined) couponData.max_uses = maxUses;
      if (maxUsesPerUser !== undefined) couponData.max_uses_per_user = maxUsesPerUser;

      // Create the coupon
      const coupon = await prisma.coupon.create({ data: couponData });

      return new SuccessResponse('Coupon created successfully', { coupon }, 201).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      return next(error);
    }
  }

  async createCoupon(req, res, next) {
    try {
      const {
        couponCode,
        discountType = 'percentage', // 'percentage' or 'fixed'
        discountValue,
        maxDiscount,
        minPurchase,
        startDate,
        endDate,
        maxUses,
        maxUsesPerUser,
        isActive = true
      } = req.body;

      if (!couponCode || discountValue === undefined) {
        return new AuthError('Missing required fields: couponCode, discountValue.', 400).sendResponse(res);
      }
      if (discountType !== 'percentage' && discountType !== 'fixed') {
        return new AuthError('discountType must be either "percentage" or "fixed".', 400).sendResponse(res);
      }
      if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
        return new AuthError('For percentage coupons, discountValue must be between 1 and 100.', 400).sendResponse(res);
      }
      if (discountType === 'fixed' && discountValue < 1) {
        return new AuthError('For fixed coupons, discountValue must be at least 1.', 400).sendResponse(res);
      }

      const existingCoupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (existingCoupon) {
        return new AuthError('Coupon code already exists.', 409).sendResponse(res);
      }

      const now = new Date();
      const couponStartDate = startDate ? new Date(startDate) : now;
      const couponEndDate = endDate ? new Date(endDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

      const couponData = {
        code: couponCode,
        type: discountType,
        value: discountValue,
        start_date: couponStartDate,
        end_date: couponEndDate,
        is_active: isActive,
      };
      if (maxDiscount !== undefined) couponData.max_discount = maxDiscount;
      if (minPurchase !== undefined) couponData.min_purchase = minPurchase;
      if (maxUses !== undefined) couponData.max_uses = maxUses;
      if (maxUsesPerUser !== undefined) couponData.max_uses_per_user = maxUsesPerUser;

      // Create the coupon (global, not tied to any course)
      const coupon = await prisma.coupon.create({ data: couponData });

      return new SuccessResponse('Global coupon created successfully', { coupon }, 201).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      return next(error);
    }
  }

  async getAllCoupons(req, res, next) {
    try {
      const coupons = await prisma.coupon.findMany();
      return new SuccessResponse('All coupons fetched successfully', { coupons }, 200).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      return next(error);
    }
  }

  async getCouponByCode(req, res, next) {
    try {
      const { code } = req.params;
      if (!code) {
        return new AuthError('Coupon code is required.', 400).sendResponse(res);
      }
      const coupon = await prisma.coupon.findUnique({ where: { code } });
      if (!coupon) {
        return new AuthError('Coupon not found.', 404).sendResponse(res);
      }
      return new SuccessResponse('Coupon fetched successfully', { coupon }, 200).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      return next(error);
    }
  }

  async deleteCoupon(req, res, next) {
    try {
      const { code } = req.params;
      if (!code) {
        return new AuthError('Coupon code is required.', 400).sendResponse(res);
      }
      await prisma.coupon.delete({ where: { code } });
      return new SuccessResponse('Coupon deleted successfully', { code }, 200).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      return next(error);
    }
  }

  async getCourse(req, res, next) {
    try {
      const { courseName } = req.params;
      if (!courseName) {
        return new AuthError('courseName code is required.', 400).sendResponse(res);
      }
      const courseData = await prisma.govtExam.findFirst({ where: { name: courseName } });
      return new SuccessResponse('Course Data fetched', { courseData }, 200).sendResponse(res);
    } catch (error) {
      if (error instanceof AuthError) {
        return error.sendResponse(res);
      }
      return next(error);
    }
  }
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = new ExamController(); 