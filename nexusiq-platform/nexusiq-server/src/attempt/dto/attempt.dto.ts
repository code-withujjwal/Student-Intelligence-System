import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAttemptDto {
  @IsString()
  quizId: string;
}

export class SubmitAnswerDto {
  @IsString()
  questionId: string;

  userAnswer: string | string[] | null;

  @IsNumber()
  @IsOptional()
  timeSpent?: number;

  @IsNumber()
  @IsOptional()
  confidence?: number;
}

export class CompleteAttemptDto {
  @IsOptional()
  behaviorData?: any;
}
