import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AssignmentResponseDto,
  StudentInfoDto,
  ExamInfoDto,
  StudentAnswerDto,
  AssignmentEventDto,
  AssignmentGradeDto,
} from './assignment-response.dto';

export class QuestionAnswerDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

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
}

export class QuestionDetailDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ['multiple_choice', 'numeric', 'graph_click', 'open_text'] })
  questionType: string;

  @ApiProperty()
  typeConfig: Record<string, unknown>;

  @ApiProperty({ enum: ['easy', 'medium', 'hard'] })
  difficulty: string;

  @ApiProperty()
  weight: number;

  @ApiPropertyOptional({ type: QuestionAnswerDto, nullable: true })
  answer: QuestionAnswerDto | null;
}

export class GradingResponseDto {
  @ApiProperty({ type: AssignmentResponseDto })
  assignment: AssignmentResponseDto;

  @ApiProperty({ type: StudentInfoDto })
  student: StudentInfoDto;

  @ApiProperty({ type: ExamInfoDto })
  exam: ExamInfoDto;

  @ApiProperty({ type: [QuestionDetailDto] })
  questions: QuestionDetailDto[];

  @ApiProperty({ type: [StudentAnswerDto] })
  answers: StudentAnswerDto[];

  @ApiProperty({ type: [AssignmentEventDto] })
  events: AssignmentEventDto[];

  @ApiPropertyOptional({ type: AssignmentGradeDto, nullable: true })
  existingGrade: AssignmentGradeDto | null;
}
