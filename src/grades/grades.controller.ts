import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GradeAnswerCommand, SubmitGradeCommand } from './commands';
import { GetGradesQuery } from './queries';
import {
  GradeAnswerDto,
  SubmitGradeDto,
  GradeListItemDto,
  GradeAnswerResponseDto,
  SubmitGradeResponseDto,
} from './dtos';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';

@ApiTags('grades')
@ApiBearerAuth('JWT-auth')
@Controller('grades')
export class GradesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar calificaciones',
    description:
      'Obtiene todas las calificaciones de exámenes del profesor autenticado',
  })
  @ApiQuery({
    name: 'career',
    required: false,
    description: 'Filtrar por carrera del estudiante',
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'Filtrar por ID de grupo',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Filtrar por ID de estudiante',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de calificaciones',
    type: [GradeListItemDto],
  })
  async getGrades(
    @CurrentUser() user: JwtUser,
    @Query('career') career?: string,
    @Query('groupId') groupId?: string,
    @Query('studentId') studentId?: string,
  ): Promise<GradeListItemDto[]> {
    return this.queryBus.execute(
      new GetGradesQuery(user.id, career, groupId, studentId),
    );
  }

  @Put('answer/:answerId')
  @ApiOperation({
    summary: 'Calificar respuesta',
    description: 'Asigna una calificación y retroalimentación a una respuesta',
  })
  @ApiParam({
    name: 'answerId',
    description: 'ID de la respuesta a calificar',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta calificada exitosamente',
    type: GradeAnswerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Respuesta no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para calificar esta respuesta',
  })
  async gradeAnswer(
    @Param('answerId', ParseUUIDPipe) answerId: string,
    @Body() dto: GradeAnswerDto,
    @CurrentUser() user: JwtUser,
  ): Promise<GradeAnswerResponseDto> {
    return this.commandBus.execute(
      new GradeAnswerCommand(answerId, user.id, dto.score, dto.feedback),
    );
  }

  @Post('submit')
  @ApiOperation({
    summary: 'Enviar calificación final',
    description:
      'Registra la calificación final de una asignación y cambia su estado a calificado',
  })
  @ApiResponse({
    status: 201,
    description: 'Calificación registrada exitosamente',
    type: SubmitGradeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para calificar esta asignación',
  })
  @ApiResponse({
    status: 400,
    description: 'La asignación debe estar en estado submitted para calificar',
  })
  async submitGrade(
    @Body() dto: SubmitGradeDto,
    @CurrentUser() user: JwtUser,
  ): Promise<SubmitGradeResponseDto> {
    return this.commandBus.execute(
      new SubmitGradeCommand(
        dto.assignmentId,
        user.id,
        dto.averageScore,
        dto.finalGrade,
        dto.roundingMethod,
      ),
    );
  }
}
