import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// MULTIPLE CHOICE
// ============================================
export class MultipleChoiceOptionDto {
  @ApiProperty({
    description: 'ID de la opción (UUID)',
    example: 'a3ea8d98-0f39-4cdc-97eb-699b88283036',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Texto de la opción (HTML)',
    example: '<p>Opción A</p>',
  })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Indica si es la respuesta correcta' })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({ description: 'Orden de la opción', example: 1 })
  @IsNumber()
  order: number;
}

export class MultipleChoiceConfigDto {
  @ApiProperty({ type: [MultipleChoiceOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MultipleChoiceOptionDto)
  options: MultipleChoiceOptionDto[];

  @ApiProperty({
    description: 'Permite seleccionar múltiples opciones',
    default: false,
  })
  @IsBoolean()
  allowMultiple: boolean;

  @ApiProperty({
    description: 'Mezclar opciones al mostrar',
    default: true,
  })
  @IsBoolean()
  shuffleOptions: boolean;
}

// ============================================
// NUMERIC
// ============================================
export class NumericConfigDto {
  @ApiProperty({ description: 'Valor correcto', example: 42.5 })
  @IsNumber()
  correctValue: number;

  @ApiProperty({ description: 'Tolerancia permitida', example: 0.1 })
  @IsNumber()
  tolerance: number;

  @ApiProperty({
    description: 'Tipo de tolerancia',
    enum: ['percentage', 'absolute'],
    example: 'absolute',
  })
  @IsString()
  toleranceType: 'percentage' | 'absolute';

  @ApiPropertyOptional({ description: 'Unidad de medida', example: 'm/s' })
  @IsString()
  @IsOptional()
  unit?: string | null;

  @ApiProperty({
    description: 'Mostrar campo para unidad',
    default: false,
  })
  @IsBoolean()
  showUnitInput: boolean;
}

// ============================================
// GRAPH CLICK
// ============================================
export class PointDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  x: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  y: number;

  @ApiPropertyOptional({ example: 'Punto A' })
  @IsString()
  @IsOptional()
  label?: string;
}

export class LineDto {
  @ApiProperty({ description: 'ID de la línea', example: 'line-1' })
  @IsString()
  id: string;

  @ApiProperty({ type: [PointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  points: PointDto[];

  @ApiProperty({ description: 'Color de la línea', example: '#3b82f6' })
  @IsString()
  color: string;

  @ApiPropertyOptional({ description: 'Etiqueta de la línea' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({
    description: 'Tipo de línea',
    enum: ['line', 'curve', 'scatter'],
    example: 'line',
  })
  @IsString()
  type: 'line' | 'curve' | 'scatter';
}

export class FunctionDto {
  @ApiProperty({
    description: 'ID de la función',
    example: 'func-1704567890123',
  })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Expresión matemática', example: 'x^2' })
  @IsString()
  expression: string;

  @ApiProperty({ description: 'Color de la función', example: '#3b82f6' })
  @IsString()
  color: string;

  @ApiPropertyOptional({
    description: 'Etiqueta de la función',
    example: 'y = x²',
  })
  @IsString()
  @IsOptional()
  label?: string;
}

export class AreaDto {
  @ApiProperty({ example: -2 })
  @IsNumber()
  x1: number;

  @ApiProperty({ example: -2 })
  @IsNumber()
  y1: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  x2: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  y2: number;
}

export class GraphClickConfigDto {
  @ApiProperty({
    description: 'Tipo de gráfico',
    enum: ['cartesian'],
    example: 'cartesian',
  })
  @IsString()
  graphType: 'cartesian';

  @ApiPropertyOptional({ description: 'URL de imagen personalizada' })
  @IsString()
  @IsOptional()
  imageUrl?: string | null;

  // Ejes
  @ApiProperty({ description: 'Rango del eje X', example: [-10, 10] })
  @IsArray()
  xRange: [number, number];

  @ApiProperty({ description: 'Rango del eje Y', example: [-10, 10] })
  @IsArray()
  yRange: [number, number];

  @ApiProperty({ description: 'Etiqueta del eje X', example: 'x' })
  @IsString()
  xLabel: string;

  @ApiProperty({ description: 'Etiqueta del eje Y', example: 'y' })
  @IsString()
  yLabel: string;

  @ApiPropertyOptional({ description: 'Título del gráfico' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Mostrar cuadrícula', default: true })
  @IsBoolean()
  showGrid: boolean;

  @ApiProperty({ description: 'Paso de la cuadrícula', example: 1 })
  @IsNumber()
  gridStep: number;

  // Datos visuales
  @ApiProperty({ type: [LineDto], description: 'Líneas en el gráfico' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineDto)
  lines: LineDto[];

  @ApiProperty({ type: [FunctionDto], description: 'Funciones matemáticas' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FunctionDto)
  functions: FunctionDto[];

  // Interactividad
  @ApiProperty({ description: 'Es interactivo', default: true })
  @IsBoolean()
  isInteractive: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de respuesta',
    enum: ['point', 'function', 'area'],
  })
  @IsString()
  @IsOptional()
  answerType?: 'point' | 'function' | 'area';

  // Respuesta tipo punto
  @ApiPropertyOptional({ type: PointDto, description: 'Punto correcto' })
  @ValidateNested()
  @Type(() => PointDto)
  @IsOptional()
  correctPoint?: PointDto;

  @ApiPropertyOptional({ description: 'Radio de tolerancia', example: 0.5 })
  @IsNumber()
  @IsOptional()
  toleranceRadius?: number;

  // Respuesta tipo función
  @ApiPropertyOptional({ description: 'ID de la función correcta' })
  @IsString()
  @IsOptional()
  correctFunctionId?: string | null;

  // Respuesta tipo área
  @ApiPropertyOptional({ type: AreaDto, description: 'Área correcta' })
  @ValidateNested()
  @Type(() => AreaDto)
  @IsOptional()
  correctArea?: AreaDto | null;
}

// ============================================
// OPEN TEXT
// ============================================
export class OpenTextConfigDto {
  // Objeto vacío - la evaluación se hace manualmente
}
