import {
  Controller, Get, Post, Delete, Param, Body, Query,
  UseGuards, Request, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/guards';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('quizzes')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateQuizDto, @Request() req: any) {
    return this.quizService.createQuiz(dto, req.user.id);
  }

  @Get()
  @SkipThrottle()
  findAll(
    @Query('subject') subject?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit?: number,
  ) {
    return this.quizService.findAll({ subject, difficulty, search, page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.quizService.deleteQuiz(id);
  }
}
