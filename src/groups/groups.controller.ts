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
  CreateGroupCommand,
  UpdateGroupCommand,
  DeleteGroupCommand,
  AddStudentsToGroupCommand,
  RemoveStudentsFromGroupCommand,
} from './commands';
import {
  GetGroupsQuery,
  GetGroupByIdQuery,
  GetGroupStudentsQuery,
} from './queries';
import {
  CreateGroupDto,
  UpdateGroupDto,
  GroupResponseDto,
  ManageStudentsDto,
} from './dtos';
import { StudentResponseDto } from '../students/dtos';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';

@ApiTags('groups')
@ApiBearerAuth('JWT-auth')
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar grupos',
    description: 'Obtiene todos los grupos del profesor autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos',
    type: [GroupResponseDto],
  })
  async getGroups(@CurrentUser() user: JwtUser): Promise<GroupResponseDto[]> {
    return this.queryBus.execute(new GetGroupsQuery(user.id));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener grupo por ID',
    description: 'Obtiene un grupo específico con sus estudiantes',
  })
  @ApiParam({ name: 'id', description: 'ID del grupo', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Grupo encontrado',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver este grupo' })
  async getGroupById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<GroupResponseDto> {
    return this.queryBus.execute(new GetGroupByIdQuery(id, user.id));
  }

  @Post()
  @ApiOperation({
    summary: 'Crear grupo',
    description: 'Crea un nuevo grupo para el profesor autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Grupo creado exitosamente',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El grupo ya existe' })
  async createGroup(
    @Body() dto: CreateGroupDto,
    @CurrentUser() user: JwtUser,
  ): Promise<GroupResponseDto> {
    return this.commandBus.execute(
      new CreateGroupCommand(user.id, dto.name, dto.year, dto.career),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar grupo',
    description: 'Actualiza un grupo existente',
  })
  @ApiParam({ name: 'id', description: 'ID del grupo', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Grupo actualizado exitosamente',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para actualizar' })
  @ApiResponse({ status: 409, description: 'El grupo ya existe' })
  async updateGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() user: JwtUser,
  ): Promise<GroupResponseDto> {
    return this.commandBus.execute(
      new UpdateGroupCommand(id, user.id, dto.name, dto.year, dto.career),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar grupo',
    description: 'Elimina un grupo existente',
  })
  @ApiParam({ name: 'id', description: 'ID del grupo', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Grupo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar' })
  async deleteGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteGroupCommand(id, user.id));
  }

  @Get(':id/students')
  @ApiOperation({
    summary: 'Obtener estudiantes del grupo',
    description:
      'Obtiene todos los estudiantes de un grupo con información completa',
  })
  @ApiParam({ name: 'id', description: 'ID del grupo', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes del grupo',
    type: [StudentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver este grupo' })
  async getGroupStudents(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<StudentResponseDto[]> {
    return this.queryBus.execute(new GetGroupStudentsQuery(id, user.id));
  }

  @Post(':id/students')
  @ApiOperation({
    summary: 'Agregar estudiantes al grupo',
    description: 'Agrega uno o más estudiantes a un grupo',
  })
  @ApiParam({ name: 'id', description: 'ID del grupo', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Estudiantes agregados exitosamente',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo o estudiantes no encontrados',
  })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async addStudentsToGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ManageStudentsDto,
    @CurrentUser() user: JwtUser,
  ): Promise<GroupResponseDto> {
    return this.commandBus.execute(
      new AddStudentsToGroupCommand(id, user.id, dto.studentIds),
    );
  }

  @Delete(':id/students')
  @ApiOperation({
    summary: 'Remover estudiantes del grupo',
    description: 'Remueve uno o más estudiantes de un grupo',
  })
  @ApiParam({ name: 'id', description: 'ID del grupo', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Estudiantes removidos exitosamente',
    type: GroupResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async removeStudentsFromGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ManageStudentsDto,
    @CurrentUser() user: JwtUser,
  ): Promise<GroupResponseDto> {
    return this.commandBus.execute(
      new RemoveStudentsFromGroupCommand(id, user.id, dto.studentIds),
    );
  }
}
