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