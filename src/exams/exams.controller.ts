import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateExamCommand,
  UpdateExamCommand,
  DeleteExamCommand,
  AssignExamCommand,
} from './commands';
import { GetExamsQuery, GetExamByIdQuery } from './queries';
import {
  CreateExamDto,
  UpdateExamDto,
  AssignExamDto,
  ExamResponseDto,
  ExamDetailResponseDto,
  CreateExamResponseDto,
  AssignExamResponseDto,
} from './dtos';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';

@ApiTags('exams')
@ApiBearerAuth('JWT-auth')
@Controller('exams')
export class ExamsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar exámenes',
    description: 'Obtiene todos los exámenes del profesor autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de exámenes',
    type: [ExamResponseDto],
  })
  async getExams(@CurrentUser() user: JwtUser): Promise<ExamResponseDto[]> {
    return this.queryBus.execute(new GetExamsQuery(user.id));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener examen por ID',
    description: 'Obtiene un examen con todos sus detalles y preguntas',
  })
  @ApiParam({ name: 'id', description: 'ID del examen', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Examen encontrado',
    type: ExamDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Examen no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver este examen' })
  async getExamById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ExamDetailResponseDto> {
    return this.queryBus.execute(new GetExamByIdQuery(id, user.id));
  }

  @Post('create')
  @ApiOperation({
    summary: 'Crear examen',
    description: 'Crea un nuevo examen con preguntas',
  })
  @ApiResponse({
    status: 201,
    description: 'Examen creado exitosamente',
    type: CreateExamResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Pregunta o asignatura no encontrada' })
  async createExam(
    @Body() dto: CreateExamDto,
    @CurrentUser() user: JwtUser,
  ): Promise<CreateExamResponseDto> {
    return this.commandBus.execute(
      new CreateExamCommand(
        user.id,
        dto.title,
        dto.config,
        dto.questions,
        dto.description,
        dto.subjectId,
        dto.durationMinutes,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar examen',
    description: 'Actualiza un examen existente',
  })
  @ApiParam({ name: 'id', description: 'ID del examen', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Examen actualizado exitosamente',
    type: ExamDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Examen no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para actualizar' })
  async updateExam(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExamDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ExamDetailResponseDto> {
    return this.commandBus.execute(
      new UpdateExamCommand(
        id,
        user.id,
        dto.title,
        dto.description,
        dto.subjectId,
        dto.durationMinutes,
        dto.config,
        dto.questions,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar examen',
    description: 'Elimina un examen y todas sus asignaciones',
  })
  @ApiParam({ name: 'id', description: 'ID del examen', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Examen eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Examen no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar' })
  async deleteExam(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteExamCommand(id, user.id));
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Asignar examen a estudiantes',
    description:
      'Asigna un examen a estudiantes individuales o a un grupo completo, generando tokens únicos',
  })
  @ApiResponse({
    status: 201,
    description: 'Examen asignado exitosamente',
    type: AssignExamResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Debe proporcionar studentIds o groupId' })
  @ApiResponse({ status: 404, description: 'Examen, estudiantes o grupo no encontrados' })
  @ApiResponse({ status: 403, description: 'Sin permisos para asignar' })
  @ApiResponse({ status: 409, description: 'Todos los estudiantes ya tienen asignado el examen' })
  async assignExam(
    @Body() dto: AssignExamDto,
    @CurrentUser() user: JwtUser,
  ): Promise<AssignExamResponseDto> {
    return this.commandBus.execute(
      new AssignExamCommand(user.id, dto.examId, dto.studentIds, dto.groupId),
    );
  }
}
