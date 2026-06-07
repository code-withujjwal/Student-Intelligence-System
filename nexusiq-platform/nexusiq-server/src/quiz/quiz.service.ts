import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(dto: CreateQuizDto, creatorId?: string) {
    const { questions, ...rest } = dto;
    return this.prisma.quiz.create({
      data: {
        ...rest,
        creatorId,
        questions: questions
          ? {
              create: questions.map((q, i) => ({
                ...q,
                order: q.order ?? i,
                correctAnswer: q.correctAnswer as any,
                options: q.options as any,
              })),
            }
          : undefined,
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  async findAll(filters?: {
    subject?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { subject, difficulty, search, page = 1, limit = 12 } = filters ?? {};
    const where: any = { isPublic: true };
    if (subject) where.subject = subject;
    if (difficulty) where.difficulty = difficulty;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [quizzes, total] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        where,
        include: {
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return { quizzes, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { attempts: true } },
      },
    });
    if (!quiz) throw new NotFoundException(`Quiz ${id} not found`);
    return quiz;
  }

  async deleteQuiz(id: string) {
    await this.findById(id);
    return this.prisma.quiz.delete({ where: { id } });
  }
}
