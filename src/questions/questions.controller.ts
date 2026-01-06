import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateQuestionCommand,
  UpdateQuestionCommand,
  DeleteQuestionCommand,
} from './commands';
import { GetQuestionsQuery, GetQuestionByIdQuery } from './queries';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionResponseDto,
  GetQuestionsFilterDto,
} from './dtos';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';

@ApiTags('questions')
@ApiBearerAuth('JWT-auth')
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar preguntas',
    description:
      'Obtiene todas las preguntas del banco del profesor autenticado',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'Filtrar por asignatura',
  })
  @ApiQuery({
    name: 'topicId',
    required: false,
    description: 'Filtrar por tema',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['multiple_choice', 'numeric', 'graph_click', 'open_text'],
    description: 'Filtrar por tipo',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    enum: ['easy', 'medium', 'hard'],
    description: 'Filtrar por dificultad',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de preguntas',
    type: [QuestionResponseDto],
  })
  async getQuestions(
    @CurrentUser() user: JwtUser,
    @Query() filter: GetQuestionsFilterDto,
  ): Promise<QuestionResponseDto[]> {
    return this.queryBus.execute(
      new GetQuestionsQuery(
        user.id,
        filter.subjectId,
        filter.topicId,
        filter.type,
        filter.difficulty,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener pregunta por ID',
    description: 'Obtiene una pregunta específica por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID de la pregunta', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Pregunta encontrada',
    type: QuestionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pregunta no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver esta pregunta',
  })
  async getQuestionById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<QuestionResponseDto> {
    return this.queryBus.execute(new GetQuestionByIdQuery(id, user.id));
  }

  @Post()
  @ApiOperation({
    summary: 'Crear pregunta',
    description: 'Crea una nueva pregunta en el banco del profesor',
  })
  @ApiResponse({
    status: 201,
    description: 'Pregunta creada exitosamente',
    type: QuestionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async createQuestion(
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: JwtUser,
  ): Promise<QuestionResponseDto> {
    return this.commandBus.execute(
      new CreateQuestionCommand(
        user.id,
        dto.title,
        dto.content,
        dto.questionType,
        dto.typeConfig,
        dto.subjectId,
        dto.topicId,
        dto.difficulty,
        dto.estimatedTimeMinutes,
        dto.tags,
        dto.weight,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar pregunta',
    description: 'Actualiza una pregunta existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la pregunta', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Pregunta actualizada exitosamente',
    type: QuestionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pregunta no encontrada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para actualizar' })
  async updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: JwtUser,
  ): Promise<QuestionResponseDto> {
    return this.commandBus.execute(
      new UpdateQuestionCommand(
        id,
        user.id,
        dto.title,
        dto.content,
        dto.questionType,
        dto.typeConfig,
        dto.subjectId,
        dto.topicId,
        dto.difficulty,
        dto.estimatedTimeMinutes,
        dto.tags,
        dto.weight,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar pregunta',
    description: 'Elimina una pregunta del banco',
  })
  @ApiParam({ name: 'id', description: 'ID de la pregunta', format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Pregunta eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Pregunta no encontrada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar' })
  async deleteQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteQuestionCommand(id, user.id));
  }
}
