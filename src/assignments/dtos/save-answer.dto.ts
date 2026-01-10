import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { StudentAnswerDto } from './assignment-response.dto';

export class SaveAnswerDto {
  @ApiProperty({
    description: 'ID de la asignación',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @ApiProperty({
    description: 'ID de la pregunta',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiPropertyOptional({
    description: 'ID de la opción seleccionada (para multiple_choice)',
  })
  @IsString()
  @IsOptional()
  selectedOptionId?: string | null;

  @ApiPropertyOptional({
    description: 'Texto de la respuesta (para open_text)',
  })
  @IsString()
  @IsOptional()
  answerText?: string | null;

  @ApiPropertyOptional({
    description: 'Respuesta en formato LaTeX',
  })
  @IsString()
  @IsOptional()
  answerLatex?: string | null;

  @ApiPropertyOptional({
    description: 'Respuesta numérica (para numeric)',
  })
  @IsNumber()
  @IsOptional()
  answerNumeric?: number | null;

  @ApiPropertyOptional({
    description: 'Punto seleccionado en gráfica (para graph_click)',
  })
  @IsObject()
  @IsOptional()
  answerPoint?: Record<string, unknown> | null;
}

export class SaveAnswerResponseDto {
  @ApiProperty({ type: StudentAnswerDto })
  answer: StudentAnswerDto;
}
