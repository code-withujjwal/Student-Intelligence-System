import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-quiz')
  @UseGuards(JwtAuthGuard)
  generateQuiz(@Body() dto: GenerateQuizDto, @Request() req: any) {
    return this.aiService.generateQuiz(dto, req.user.id);
  }
}
