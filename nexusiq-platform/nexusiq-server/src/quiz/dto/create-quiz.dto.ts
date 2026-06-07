import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum QuestionType {
  MCQ = 'MCQ',
  MSQ = 'MSQ',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
}

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @IsString()
  content: string;

  @IsOptional()
  options?: string[];

  correctAnswer: string | string[];

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsInt()
  @IsOptional()
  points?: number;

  @IsInt()
  @IsOptional()
  negativePoints?: number;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  subject: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[];
}
