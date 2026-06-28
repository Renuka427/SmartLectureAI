import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import userRouter from "./user";
import lecturesRouter from "./lectures";
import flashcardsRouter from "./flashcards";
import quizzesRouter from "./quizzes";
import achievementsRouter from "./achievements";
import assistantRouter from "./assistant";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(userRouter);
router.use(lecturesRouter);
router.use(flashcardsRouter);
router.use(quizzesRouter);
router.use(achievementsRouter);
router.use(assistantRouter);
router.use(searchRouter);

export default router;
