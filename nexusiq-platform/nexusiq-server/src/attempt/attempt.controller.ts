import { Controller, Post, Get, Param, Body, UseGuards, Request, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { CreateAttemptDto, SubmitAnswerDto, CompleteAttemptDto } from './dto/attempt.dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptController {
  constructor(private attemptService: AttemptService) {}

  @Post()
  create(@Body() dto: CreateAttemptDto, @Request() req: any) {
    return this.attemptService.createAttempt(req.user.id, dto);
  }

  @Post(':id/answer')
  submitAnswer(@Param('id') id: string, @Body() dto: SubmitAnswerDto, @Request() req: any) {
    return this.attemptService.submitAnswer(id, req.user.id, dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompleteAttemptDto, @Request() req: any) {
    return this.attemptService.completeAttempt(id, req.user.id, dto);
  }

  @Get('history')
  history(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.attemptService.getUserHistory(req.user.id, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attemptService.getAttempt(id);
  }
}
