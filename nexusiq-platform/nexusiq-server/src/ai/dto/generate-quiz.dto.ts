import { IsString, IsInt, IsOptional, IsEnum, Min, Max } from 'class-validator';

export enum AIDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export class GenerateQuizDto {
  @IsString()
  subject: string;

  @IsString()
  topic: string;

  @IsEnum(AIDifficulty)
  @IsOptional()
  difficulty?: AIDifficulty;

  @IsInt()
  @Min(5)
  @Max(50)
  @IsOptional()
  questionCount?: number;
}
