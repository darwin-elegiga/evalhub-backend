import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AssignmentStatusEnum {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

export class AssignmentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  examId: string;

  @ApiPropertyOptional()
  examTitle?: string;

  @ApiProperty({ format: 'uuid' })
  studentId: string;

  @ApiPropertyOptional()
  studentName?: string;

  @ApiPropertyOptional()
  studentEmail?: string;

  @ApiProperty()
  magicToken: string;

  @ApiProperty({ enum: AssignmentStatusEnum })
  status: string;

  @ApiProperty({ format: 'date-time' })
  assignedAt: Date;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  startedAt: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  submittedAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  score: number | null;
}

export class AnswerDetailDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  questionId: string;

  @ApiProperty()
  questionTitle: string;

  @ApiProperty()
  questionType: string;

  @ApiProperty()
  questionWeight: number;

  @ApiPropertyOptional({ nullable: true })
  selectedOptionId: string | null;

  @ApiPropertyOptional({ nullable: true })
  answerText: string | null;

  @ApiPropertyOptional({ nullable: true })
  answerLatex: string | null;

  @ApiPropertyOptional({ nullable: true })
  answerNumeric: number | null;

  @ApiPropertyOptional({ nullable: true })
  answerPoint: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  score: number | null;

  @ApiPropertyOptional({ nullable: true })
  feedback: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;
}

export class AssignmentDetailResponseDto extends AssignmentResponseDto {
  @ApiProperty({ type: [AnswerDetailDto] })
  answers: AnswerDetailDto[];
}

export class StudentInfoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  year: string | null;

  @ApiPropertyOptional({ nullable: true })
  career: string | null;
}

export class ExamInfoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  durationMinutes: number | null;

  @ApiProperty()
  config: Record<string, unknown>;
}

export class StudentAnswerDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  assignmentId: string;

  @ApiProperty({ format: 'uuid' })
  questionId: string;

  @ApiPropertyOptional({ nullable: true })
  selectedOptionId: string | null;

  @ApiPropertyOptional({ nullable: true })
  answerText: string | null;

  @ApiPropertyOptional({ nullable: true })
  answerLatex: string | null;

  @ApiPropertyOptional({ nullable: true })
  answerNumeric: number | null;

  @ApiPropertyOptional({ nullable: true })
  answerPoint: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  score: number | null;

  @ApiPropertyOptional({ nullable: true })
  feedback: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;
}

export enum EventSeverityEnum {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export class AssignmentEventDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  assignmentId: string;

  @ApiProperty()
  eventType: string;

  @ApiProperty({ enum: EventSeverityEnum })
  severity: string;

  @ApiProperty({ format: 'date-time' })
  timestamp: Date;

  @ApiPropertyOptional()
  details: Record<string, unknown> | null;
}

export class AssignmentGradeDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  assignmentId: string;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  finalGrade: number;

  @ApiProperty({ enum: ['floor', 'ceil', 'round'] })
  roundingMethod: string;

  @ApiProperty({ format: 'date-time' })
  gradedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  gradedBy: string | null;
}
