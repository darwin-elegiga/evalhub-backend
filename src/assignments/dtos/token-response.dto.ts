import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentAnswerDto } from './assignment-response.dto';

export class TokenAssignmentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ['pending', 'in_progress', 'submitted', 'graded'] })
  status: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  startedAt: Date | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  submittedAt: Date | null;
}

export class TokenExamDto {
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

export class TokenStudentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  fullName: string;
}

export class TokenQuestionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({
    enum: ['multiple_choice', 'numeric', 'graph_click', 'open_text'],
  })
  questionType: string;

  @ApiProperty()
  typeConfig: Record<string, unknown>;

  @ApiProperty()
  questionOrder: number;

  @ApiProperty()
  weight: number;
}

export class TokenResponseDto {
  @ApiProperty({ type: TokenAssignmentDto })
  assignment: TokenAssignmentDto;

  @ApiProperty({ type: TokenExamDto })
  exam: TokenExamDto;

  @ApiProperty({ type: TokenStudentDto })
  student: TokenStudentDto;

  @ApiProperty({ type: [TokenQuestionDto] })
  questions: TokenQuestionDto[];

  @ApiProperty({ type: [StudentAnswerDto] })
  answers: StudentAnswerDto[];
}
