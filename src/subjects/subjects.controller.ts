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
  CreateSubjectCommand,
  UpdateSubjectCommand,
  DeleteSubjectCommand,
} from './commands';
import { GetSubjectsQuery, GetSubjectByIdQuery } from './queries';
import { CreateSubjectDto, UpdateSubjectDto, SubjectResponseDto } from './dtos';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';

@ApiTags('subjects')
@ApiBearerAuth('JWT-auth')
@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar asignaturas',
    description: 'Obtiene todas las asignaturas del profesor autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaturas',
    type: [SubjectResponseDto],
  })
  async getSubjects(
    @CurrentUser() user: JwtUser,
  ): Promise<SubjectResponseDto[]> {
    return this.queryBus.execute(new GetSubjectsQuery(user.id));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener asignatura por ID',
    description: 'Obtiene una asignatura específica por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID de la asignatura', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Asignatura encontrada',
    type: SubjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver esta asignatura',
  })
  async getSubjectById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<SubjectResponseDto> {
    return this.queryBus.execute(new GetSubjectByIdQuery(id, user.id));
  }

  @Post()
  @ApiOperation({
    summary: 'Crear asignatura',
    description: 'Crea una nueva asignatura para el profesor autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Asignatura creada exitosamente',
    type: SubjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'La asignatura ya existe' })
  async createSubject(
    @Body() dto: CreateSubjectDto,
    @CurrentUser() user: JwtUser,
  ): Promise<SubjectResponseDto> {
    return this.commandBus.execute(
      new CreateSubjectCommand(user.id, dto.name, dto.description, dto.color),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar asignatura',
    description: 'Actualiza una asignatura existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la asignatura', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Asignatura actualizada exitosamente',
    type: SubjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para actualizar' })
  @ApiResponse({ status: 409, description: 'El nombre ya existe' })
  async updateSubject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubjectDto,
    @CurrentUser() user: JwtUser,
  ): Promise<SubjectResponseDto> {
    return this.commandBus.execute(
      new UpdateSubjectCommand(
        id,
        user.id,
        dto.name,
        dto.description,
        dto.color,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar asignatura',
    description: 'Elimina una asignatura existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la asignatura', format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Asignatura eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Asignatura no encontrada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar' })
  async deleteSubject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteSubjectCommand(id, user.id));
  }
}
