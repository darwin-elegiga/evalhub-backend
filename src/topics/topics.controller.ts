import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  CreateTopicCommand,
  UpdateTopicCommand,
  DeleteTopicCommand,
} from './commands';
import { GetTopicsQuery, GetTopicByIdQuery } from './queries';
import {
  CreateTopicDto,
  UpdateTopicDto,
  TopicResponseDto,
  DeleteResponseDto,
} from './dtos';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';

@ApiTags('topics')
@ApiBearerAuth('JWT-auth')
@Controller('topics')
export class TopicsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar temas',
    description: 'Obtiene todos los temas del profesor autenticado. Puede filtrar por asignatura.',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    description: 'ID de la asignatura para filtrar',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de temas',
    type: [TopicResponseDto],
  })
  async getTopics(
    @CurrentUser() user: JwtUser,
    @Query('subjectId') subjectId?: string,
  ): Promise<TopicResponseDto[]> {
    return this.queryBus.execute(new GetTopicsQuery(user.id, subjectId));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener tema por ID',
    description: 'Obtiene un tema específico por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID del tema', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Tema encontrado',
    type: TopicResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver este tema',
  })
  async getTopicById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<TopicResponseDto> {
    return this.queryBus.execute(new GetTopicByIdQuery(id, user.id));
  }

  @Post()
  @ApiOperation({
    summary: 'Crear tema',
    description: 'Crea un nuevo tema para el profesor autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Tema creado exitosamente',
    type: TopicResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  @ApiResponse({ status: 409, description: 'El tema ya existe en esta asignatura' })
  async createTopic(
    @Body() dto: CreateTopicDto,
    @CurrentUser() user: JwtUser,
  ): Promise<TopicResponseDto> {
    return this.commandBus.execute(
      new CreateTopicCommand(
        user.id,
        dto.subjectId,
        dto.name,
        dto.description,
        dto.color,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar tema',
    description: 'Actualiza un tema existente',
  })
  @ApiParam({ name: 'id', description: 'ID del tema', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Tema actualizado exitosamente',
    type: TopicResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para actualizar' })
  @ApiResponse({ status: 409, description: 'El nombre ya existe en la asignatura' })
  async updateTopic(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTopicDto,
    @CurrentUser() user: JwtUser,
  ): Promise<TopicResponseDto> {
    return this.commandBus.execute(
      new UpdateTopicCommand(
        id,
        user.id,
        dto.name,
        dto.description,
        dto.color,
        dto.subjectId,
      ),
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar tema',
    description: 'Elimina un tema existente',
  })
  @ApiParam({ name: 'id', description: 'ID del tema', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Tema eliminado exitosamente',
    type: DeleteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar' })
  async deleteTopic(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<DeleteResponseDto> {
    return this.commandBus.execute(new DeleteTopicCommand(id, user.id));
  }
}
