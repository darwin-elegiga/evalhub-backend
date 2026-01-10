import {
  Controller,
  Get,
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
import {
  StartAssignmentCommand,
  SaveAnswerCommand,
  SubmitAssignmentCommand,
} from './commands';
import {
  GetAssignmentsQuery,
  GetAssignmentByIdQuery,
  GetAssignmentGradingQuery,
  GetAssignmentByTokenQuery,
} from './queries';
import {
  AssignmentResponseDto,
  AssignmentDetailResponseDto,
  GradingResponseDto,
  TokenResponseDto,
  StartAssignmentDto,
  StartAssignmentResponseDto,
  SaveAnswerDto,
  SaveAnswerResponseDto,
  SubmitAssignmentDto,
  SubmitAssignmentResponseDto,
} from './dtos';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';
import { Public } from '../auth/decorators';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar asignaciones',
    description:
      'Obtiene todas las asignaciones de exámenes del profesor autenticado',
  })
  @ApiQuery({
    name: 'examId',
    required: false,
    description: 'Filtrar por ID de examen',
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Filtrar por ID de estudiante',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado (pending, in_progress, submitted, graded)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaciones',
    type: [AssignmentResponseDto],
  })
  async getAssignments(
    @CurrentUser() user: JwtUser,
    @Query('examId') examId?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ): Promise<AssignmentResponseDto[]> {
    return this.queryBus.execute(
      new GetAssignmentsQuery(user.id, examId, studentId, status),
    );
  }

  @Get('token/:token')
  @Public()
  @ApiOperation({
    summary: 'Obtener examen por token',
    description:
      'Obtiene los datos del examen usando el magic token (para estudiantes)',
  })
  @ApiParam({ name: 'token', description: 'Magic token de la asignación' })
  @ApiResponse({
    status: 200,
    description: 'Datos del examen para el estudiante',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Token inválido' })
  async getAssignmentByToken(
    @Param('token') token: string,
  ): Promise<TokenResponseDto> {
    return this.queryBus.execute(new GetAssignmentByTokenQuery(token));
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener asignación por ID',
    description: 'Obtiene los detalles de una asignación específica',
  })
  @ApiParam({ name: 'id', description: 'ID de la asignación', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la asignación',
    type: AssignmentDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver esta asignación',
  })
  async getAssignmentById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<AssignmentDetailResponseDto> {
    return this.queryBus.execute(new GetAssignmentByIdQuery(id, user.id));
  }

  @Get(':id/grading')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener datos de calificación',
    description:
      'Obtiene todos los datos necesarios para calificar una asignación',
  })
  @ApiParam({ name: 'id', description: 'ID de la asignación', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Datos de calificación',
    type: GradingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver esta asignación',
  })
  async getAssignmentGrading(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<GradingResponseDto> {
    return this.queryBus.execute(new GetAssignmentGradingQuery(id, user.id));
  }

  @Post('start')
  @Public()
  @ApiOperation({
    summary: 'Iniciar examen',
    description: 'Inicia un examen asignado usando el magic token',
  })
  @ApiResponse({
    status: 201,
    description: 'Examen iniciado exitosamente',
    type: StartAssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede iniciar el examen (estado inválido)',
  })
  async startAssignment(
    @Body() dto: StartAssignmentDto,
  ): Promise<StartAssignmentResponseDto> {
    return this.commandBus.execute(
      new StartAssignmentCommand(dto.assignmentId),
    );
  }

  @Post('answer')
  @Public()
  @ApiOperation({
    summary: 'Guardar respuesta',
    description: 'Guarda o actualiza la respuesta a una pregunta del examen',
  })
  @ApiResponse({
    status: 201,
    description: 'Respuesta guardada exitosamente',
    type: SaveAnswerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede guardar respuesta (examen no en progreso)',
  })
  async saveAnswer(@Body() dto: SaveAnswerDto): Promise<SaveAnswerResponseDto> {
    return this.commandBus.execute(
      new SaveAnswerCommand(
        dto.assignmentId,
        dto.questionId,
        dto.selectedOptionId,
        dto.answerText,
        dto.answerLatex,
        dto.answerNumeric,
        dto.answerPoint,
      ),
    );
  }

  @Post('submit')
  @Public()
  @ApiOperation({
    summary: 'Entregar examen',
    description: 'Entrega el examen para su calificación',
  })
  @ApiResponse({
    status: 201,
    description: 'Examen entregado exitosamente',
    type: SubmitAssignmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede entregar el examen (estado inválido)',
  })
  async submitAssignment(
    @Body() dto: SubmitAssignmentDto,
  ): Promise<SubmitAssignmentResponseDto> {
    return this.commandBus.execute(
      new SubmitAssignmentCommand(dto.assignmentId),
    );
  }
}
