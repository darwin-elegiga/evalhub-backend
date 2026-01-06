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
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateCareerCommand,
  UpdateCareerCommand,
  DeleteCareerCommand,
} from './commands';
import { GetCareersQuery, GetCareerByIdQuery } from './queries';
import { CreateCareerDto, UpdateCareerDto, CareerResponseDto } from './dtos';
import { Public } from '../auth/decorators';

@ApiTags('careers')
@Controller('careers')
@Public()
export class CareersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar carreras',
    description: 'Obtiene todas las carreras disponibles',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Incluir carreras inactivas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de carreras',
    type: [CareerResponseDto],
  })
  async getCareers(
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ): Promise<CareerResponseDto[]> {
    return this.queryBus.execute(new GetCareersQuery(includeInactive ?? false));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener carrera por ID',
    description: 'Obtiene una carrera específica por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID de la carrera', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Carrera encontrada',
    type: CareerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  async getCareerById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CareerResponseDto> {
    return this.queryBus.execute(new GetCareerByIdQuery(id));
  }

  @Post()
  @ApiOperation({
    summary: 'Crear carrera',
    description: 'Crea una nueva carrera',
  })
  @ApiResponse({
    status: 201,
    description: 'Carrera creada exitosamente',
    type: CareerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'La carrera ya existe' })
  async createCareer(
    @Body() dto: CreateCareerDto,
  ): Promise<CareerResponseDto> {
    return this.commandBus.execute(
      new CreateCareerCommand(dto.name, dto.code),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar carrera',
    description: 'Actualiza una carrera existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la carrera', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Carrera actualizada exitosamente',
    type: CareerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  @ApiResponse({ status: 409, description: 'El nombre o código ya existe' })
  async updateCareer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCareerDto,
  ): Promise<CareerResponseDto> {
    return this.commandBus.execute(
      new UpdateCareerCommand(id, dto.name, dto.code, dto.isActive),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar carrera',
    description: 'Elimina una carrera existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la carrera', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Carrera eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  async deleteCareer(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCareerCommand(id));
  }
}
