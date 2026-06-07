import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttemptDto, SubmitAnswerDto, CompleteAttemptDto } from './dto/attempt.dto';

@Injectable()
export class AttemptService {
  constructor(private prisma: PrismaService) {}

  async createAttempt(userId: string, dto: CreateAttemptDto) {
    // Check if quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    // Check for existing in-progress attempt
    const existing = await this.prisma.attempt.findFirst({
      where: { userId, quizId: dto.quizId, status: 'IN_PROGRESS' },
    });
    if (existing) return existing;

    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    return this.prisma.attempt.create({
      data: {
        userId,
        quizId: dto.quizId,
        maxScore,
        status: 'IN_PROGRESS',
      },
    });
  }

  async submitAnswer(attemptId: string, userId: string, dto: SubmitAnswerDto) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { questions: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) throw new BadRequestException('Not your attempt');
    if (attempt.status !== 'IN_PROGRESS') throw new BadRequestException('Attempt already completed');

    const question = attempt.quiz.questions.find((q) => q.id === dto.questionId);
    if (!question) throw new NotFoundException('Question not found in this quiz');

    const correctAnswer = question.correctAnswer as any;
    const userAns = dto.userAnswer;
    let isCorrect = false;

    if (Array.isArray(correctAnswer)) {
      // MSQ
      if (Array.isArray(userAns)) {
        isCorrect =
          correctAnswer.length === userAns.length &&
          correctAnswer.every((a: string) => (userAns as string[]).includes(a));
      }
    } else {
      isCorrect = String(userAns).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
    }

    // Upsert answer (allow changing answer while in progress)
    return this.prisma.answer.upsert({
      where: {
        // We need a unique constraint. Using findFirst + update fallback:
        // The prisma schema doesn't have a unique on (attemptId, questionId), so we'll use create/update manually.
        id: (
          await this.prisma.answer.findFirst({
            where: { attemptId, questionId: dto.questionId },
          })
        )?.id ?? 'none',
      },
      create: {
        attemptId,
        questionId: dto.questionId,
        userAnswer: userAns as any,
        isCorrect,
        timeSpent: dto.timeSpent ?? 0,
        confidence: dto.confidence,
      },
      update: {
        userAnswer: userAns as any,
        isCorrect,
        timeSpent: dto.timeSpent ?? 0,
        confidence: dto.confidence,
      },
    });
  }

  async completeAttempt(attemptId: string, userId: string, dto: CompleteAttemptDto) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        quiz: { include: { questions: true } },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) throw new BadRequestException('Not your attempt');
    if (attempt.status !== 'IN_PROGRESS') return attempt;

    // Calculate score
    let score = 0;
    for (const answer of attempt.answers) {
      const question = attempt.quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;
      if (answer.isCorrect) {
        score += question.points;
      } else if (answer.userAnswer !== null) {
        score -= question.negativePoints;
      }
    }
    score = Math.max(0, score);

    const accuracy =
      attempt.answers.length > 0
        ? (attempt.answers.filter((a) => a.isCorrect).length / attempt.answers.length) * 100
        : 0;

    const timeTaken = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    const updatedAttempt = await this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        score,
        accuracy,
        timeTaken,
        completedAt: new Date(),
        behaviorData: dto.behaviorData,
      },
      include: {
        answers: true,
        quiz: { include: { questions: { orderBy: { order: 'asc' } } } },
      },
    });

    // Award XP: score / 10 + 10 base
    const xpEarned = Math.floor(score / 10) + 10;
    await this.prisma.profile.upsert({
      where: { userId },
      create: { userId, xp: xpEarned },
      update: { xp: { increment: xpEarned } },
    });

    // Update streak
    await this.updateStreak(userId);

    return { ...updatedAttempt, xpEarned };
  }

  async getAttempt(attemptId: string) {
    return this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        quiz: { include: { questions: { orderBy: { order: 'asc' } } } },
      },
    });
  }

  async getUserHistory(userId: string, page = 1, limit = 10) {
    const [attempts, total] = await this.prisma.$transaction([
      this.prisma.attempt.findMany({
        where: { userId },
        include: { quiz: { select: { title: true, subject: true } } },
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.attempt.count({ where: { userId } }),
    ]);
    return { attempts, total, page };
  }

  private async updateStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await this.prisma.streak.findUnique({ where: { userId } });
    if (!streak) {
      await this.prisma.streak.create({ data: { userId, current: 1, longest: 1, lastActiveAt: new Date() } });
      return;
    }

    const lastActive = new Date(streak.lastActiveAt);
    lastActive.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) return; // Already active today
    const newCurrent = dayDiff === 1 ? streak.current + 1 : 1;
    const newLongest = Math.max(newCurrent, streak.longest);

    await this.prisma.streak.update({
      where: { userId },
      data: { current: newCurrent, longest: newLongest, lastActiveAt: new Date() },
    });
  }
}
