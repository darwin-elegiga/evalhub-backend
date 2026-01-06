import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuestionResponseDto {
  @ApiProperty({
    description: 'ID único de la pregunta',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID del profesor',
    format: 'uuid',
  })
  teacherId: string;

  @ApiPropertyOptional({
    description: 'ID de la asignatura',
    format: 'uuid',
    nullable: true,
  })
  subjectId: string | null;

  @ApiPropertyOptional({
    description: 'ID del tema',
    format: 'uuid',
    nullable: true,
  })
  topicId: string | null;

  @ApiProperty({
    description: 'Título de la pregunta',
    example: 'Derivada de función compuesta',
  })
  title: string;

  @ApiProperty({
    description: 'Contenido de la pregunta (HTML)',
    example: '<p>Calcula la derivada de f(x) = sin(x²)</p>',
  })
  content: string;

  @ApiProperty({
    description: 'Tipo de pregunta',
    enum: ['multiple_choice', 'numeric', 'graph_click', 'open_text'],
  })
  questionType: string;

  @ApiProperty({
    description: 'Configuración específica del tipo de pregunta',
  })
  typeConfig: Record<string, unknown>;

  @ApiProperty({
    description: 'Dificultad de la pregunta',
    enum: ['easy', 'medium', 'hard'],
  })
  difficulty: string;

  @ApiPropertyOptional({
    description: 'Tiempo estimado en minutos',
    nullable: true,
  })
  estimatedTimeMinutes: number | null;

  @ApiProperty({
    description: 'Etiquetas de la pregunta',
    example: ['cálculo', 'derivadas'],
  })
  tags: string[];

  @ApiProperty({
    description: 'Peso de la pregunta (1-10)',
    example: 5,
  })
  weight: number;

  @ApiProperty({
    description: 'Número de veces usada',
    example: 10,
  })
  timesUsed: number;

  @ApiPropertyOptional({
    description: 'Puntuación promedio',
    nullable: true,
  })
  averageScore: number | null;

  @ApiProperty({
    description: 'Fecha de creación',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    format: 'date-time',
  })
  updatedAt: Date;
}
