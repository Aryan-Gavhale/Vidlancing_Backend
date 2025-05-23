import express from "express";
import {
  createJob,
  updateJob,
  deleteJob,
  getJob,
  getClientJobs,
  getAllJobs,
  applyJob,
  checkApplicationStatus,
} from "../Controllers/job.controller.js";
import { authenticateToken } from "../Middlewares/protect.middleware.js";
import { validateBody, validateQuery } from "../Middlewares/validate.middleware.js";
import { uploadSingle } from "../Middlewares/upload.middleware.js";
import Joi from "joi";

const router = express.Router();

const jobSchema = Joi.object({
  title: Joi.string().max(100).required().messages({ "string.max": "Title must be 100 characters or less" }),
  description: Joi.string().max(5000).required().messages({ "string.max": "Description must be 5000 characters or less" }),
  category: Joi.array().items(Joi.string().max(50)).min(1).required().messages({ "array.min": "At least one category is required" }),
  budgetMin: Joi.number().positive().required(),
  budgetMax: Joi.number().positive().greater(Joi.ref("budgetMin")).required(),
  deadline: Joi.date().greater("now").required(),
  jobDifficulty: Joi.string().valid("EASY", "INTERMEDIATE", "HARD").required(),
  projectLength: Joi.string().valid("SHORT_TERM", "MEDIUM_TERM", "LONG_TERM").required(),
  keyResponsibilities: Joi.array().items(Joi.string().max(100)).required(),
  requiredSkills: Joi.array().items(Joi.string().max(100)).min(1).required().messages({ "array.min": "At least one skill is required" }),
  tools: Joi.array().items(Joi.string().max(100)).optional(),
  scope: Joi.string().max(5000).required(),
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  company: Joi.string().max(100).optional(),
  note: Joi.string().max(2000).optional(),
  videoFileUrl: Joi.string().uri().optional(),
});

const updateJobSchema = jobSchema.fork(Object.keys(jobSchema.describe().keys), field => field.optional()).min(1);

const getJobsSchema = Joi.object({
  category: Joi.string().optional(),
  search: Joi.string().max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Public routes
router.get("/all", validateQuery(getJobsSchema), getAllJobs);
router.get("/:jobId", getJob);

// Protected routes
router.use(authenticateToken);
router.get("/apply/:jobId/status", authenticateToken, checkApplicationStatus);
router.post("/", uploadSingle("videoFile"), validateBody(jobSchema), createJob);
router.put("/:jobId", uploadSingle("videoFile"), validateBody(updateJobSchema), updateJob);
router.delete("/:jobId", deleteJob);
router.get("/", validateQuery(getJobsSchema), getClientJobs);
router.post("/apply/:jobId", validateBody(Joi.object({
  aboutFreelancer: Joi.string().max(5000).required(),
})), applyJob);

export default router;