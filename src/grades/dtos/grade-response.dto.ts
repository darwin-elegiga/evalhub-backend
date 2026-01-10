import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeStudentInfoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  career: string | null;
}

export class GradeExamInfoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  title: string;
}

export class GradeListItemDto {
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

  @ApiProperty()
  gradedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  gradedBy: string | null;

  @ApiProperty({ type: GradeStudentInfoDto })
  student: GradeStudentInfoDto;

  @ApiProperty({ type: GradeExamInfoDto })
  exam: GradeExamInfoDto;
}

export class GradeAnswerResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  assignmentId: string;

  @ApiProperty({ format: 'uuid' })
  questionId: string;

  @ApiPropertyOptional({ nullable: true })
  score: number | null;

  @ApiPropertyOptional({ nullable: true })
  feedback: string | null;

  @ApiProperty()
  updatedAt: Date;
}

export class SubmitGradeResponseDto {
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

  @ApiProperty()
  gradedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  gradedBy: string | null;
}
