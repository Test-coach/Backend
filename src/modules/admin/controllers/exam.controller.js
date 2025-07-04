const prisma = require('../../../db/prisma');
const { AuthError } = require('../../shared/utils/error');
const SuccessResponse = require('../../shared/utils/success');

class ExamController {
  async createExam(req, res, next) {
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

      // Debug log: print the data object sent to Prisma
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

  async getAllExamName(req,res,next){
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