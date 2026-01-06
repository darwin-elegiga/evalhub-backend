import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExamQuestionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  examId: string;

  @ApiProperty({ format: 'uuid' })
  questionId: string;

  @ApiProperty()
  questionOrder: number;

  @ApiProperty()
  weight: number;

  @ApiPropertyOptional({
    description: 'Datos de la pregunta del banco (incluidos en GET by ID)',
  })
  question?: Record<string, unknown>;
}

export class ExamConfigResponseDto {
  @ApiProperty()
  shuffleQuestions: boolean;

  @ApiProperty()
  shuffleOptions: boolean;

  @ApiProperty()
  showResultsImmediately: boolean;

  @ApiProperty()
  allowReview: boolean;

  @ApiPropertyOptional({ nullable: true })
  penaltyPerWrongAnswer: number | null;

  @ApiProperty()
  passingPercentage: number;
}

export class ExamResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  teacherId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  subjectId: string | null;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  durationMinutes: number | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;
}

export class ExamDetailResponseDto extends ExamResponseDto {
  @ApiProperty({ type: ExamConfigResponseDto })
  config: ExamConfigResponseDto;

  @ApiProperty({ type: [ExamQuestionResponseDto] })
  questions: ExamQuestionResponseDto[];
}

export class CreateExamResponseDto {
  @ApiProperty({ type: ExamResponseDto })
  exam: ExamResponseDto;

  @ApiProperty({ type: [ExamQuestionResponseDto] })
  questions: ExamQuestionResponseDto[];
}
