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
  BadRequestException,
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
  CreateStudentCommand,
  CreateStudentsBatchCommand,
  UpdateStudentCommand,
  DeleteStudentCommand,
} from './commands';
import { GetStudentsQuery, GetStudentByIdQuery } from './queries';
import {
  CreateStudentDto,
  CreateStudentsBatchDto,
  ImportStudentsCsvDto,
  UpdateStudentDto,
  StudentResponseDto,
  BatchResultDto,
  StudentItemDto,
} from './dtos';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';

@ApiTags('students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar estudiantes',
    description:
      'Obtiene todos los estudiantes del profesor autenticado con filtros opcionales',
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'Filtrar por ID de grupo',
  })
  @ApiQuery({
    name: 'career',
    required: false,
    description: 'Filtrar por carrera (búsqueda parcial)',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Filtrar por año',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre o email',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes',
    type: [StudentResponseDto],
  })
  async getStudents(
    @CurrentUser() user: JwtUser,
    @Query('groupId') groupId?: string,
    @Query('career') career?: string,
    @Query('year') year?: string,
    @Query('search') search?: string,
  ): Promise<StudentResponseDto[]> {
    return this.queryBus.execute(
      new GetStudentsQuery(user.id, groupId, career, year, search),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener estudiante por ID',
    description: 'Obtiene un estudiante específico por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID del estudiante', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Estudiante encontrado',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para ver este estudiante',
  })
  async getStudentById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<StudentResponseDto> {
    return this.queryBus.execute(new GetStudentByIdQuery(id, user.id));
  }

  @Post()
  @ApiOperation({
    summary: 'Crear estudiante',
    description: 'Crea un nuevo estudiante para el profesor autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Estudiante creado exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async createStudent(
    @Body() dto: CreateStudentDto,
    @CurrentUser() user: JwtUser,
  ): Promise<StudentResponseDto> {
    return this.commandBus.execute(
      new CreateStudentCommand(
        user.id,
        dto.fullName,
        dto.email,
        dto.year,
        dto.career,
        dto.groupIds,
      ),
    );
  }

  @Post('batch')
  @ApiOperation({
    summary: 'Crear múltiples estudiantes',
    description:
      'Crea múltiples estudiantes en lote. Retorna un resumen con los creados y los que fallaron.',
  })
  @ApiResponse({
    status: 201,
    description: 'Resultado de la operación en lote',
    type: BatchResultDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async createStudentsBatch(
    @Body() dto: CreateStudentsBatchDto,
    @CurrentUser() user: JwtUser,
  ): Promise<BatchResultDto> {
    return this.commandBus.execute(
      new CreateStudentsBatchCommand(user.id, dto.students),
    );
  }

  @Post('import/csv')
  @ApiOperation({
    summary: 'Importar estudiantes desde CSV',
    description:
      'Importa estudiantes desde contenido CSV. Columnas: fullName, email, year (opcional), career (opcional). La primera fila debe ser el header.',
  })
  @ApiResponse({
    status: 201,
    description: 'Resultado de la importación',
    type: BatchResultDto,
  })
  @ApiResponse({ status: 400, description: 'CSV inválido o mal formateado' })
  async importStudentsFromCsv(
    @Body() dto: ImportStudentsCsvDto,
    @CurrentUser() user: JwtUser,
  ): Promise<BatchResultDto> {
    const students = this.parseCsv(dto.csv, dto.groupIds);
    return this.commandBus.execute(
      new CreateStudentsBatchCommand(user.id, students),
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar estudiante',
    description: 'Actualiza un estudiante existente',
  })
  @ApiParam({ name: 'id', description: 'ID del estudiante', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Estudiante actualizado exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para actualizar' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async updateStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: JwtUser,
  ): Promise<StudentResponseDto> {
    return this.commandBus.execute(
      new UpdateStudentCommand(
        id,
        user.id,
        dto.fullName,
        dto.email,
        dto.year,
        dto.career,
        dto.groupIds,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar estudiante',
    description: 'Elimina un estudiante existente',
  })
  @ApiParam({ name: 'id', description: 'ID del estudiante', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Estudiante eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar' })
  async deleteStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteStudentCommand(id, user.id));
  }

  private parseCsv(csv: string, groupIds?: string[]): StudentItemDto[] {
    const lines = csv.trim().split('\n');

    if (lines.length < 2) {
      throw new BadRequestException(
        'CSV must have at least a header row and one data row',
      );
    }

    const headerLine = lines[0].trim();
    const headers = this.parseCsvLine(headerLine).map((h) =>
      h.toLowerCase().trim(),
    );

    // Validate required headers
    const fullNameIndex = headers.findIndex(
      (h) => h === 'fullname' || h === 'full_name' || h === 'nombre',
    );
    const emailIndex = headers.findIndex(
      (h) => h === 'email' || h === 'correo',
    );

    if (fullNameIndex === -1) {
      throw new BadRequestException(
        'CSV must have a "fullName" or "nombre" column',
      );
    }

    if (emailIndex === -1) {
      throw new BadRequestException('CSV must have an "email" or "correo" column');
    }

    // Find optional columns
    const yearIndex = headers.findIndex(
      (h) => h === 'year' || h === 'año' || h === 'anio',
    );
    const careerIndex = headers.findIndex(
      (h) => h === 'career' || h === 'carrera',
    );

    const students: StudentItemDto[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = this.parseCsvLine(line);

      const fullName = values[fullNameIndex]?.trim();
      const email = values[emailIndex]?.trim();

      if (!fullName || !email) {
        throw new BadRequestException(
          `Row ${i + 1}: fullName and email are required`,
        );
      }

      const student: StudentItemDto = {
        fullName,
        email,
        year: yearIndex !== -1 ? values[yearIndex]?.trim() || undefined : undefined,
        career:
          careerIndex !== -1 ? values[careerIndex]?.trim() || undefined : undefined,
        groupIds,
      };

      students.push(student);
    }

    if (students.length === 0) {
      throw new BadRequestException('No valid students found in CSV');
    }

    return students;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }
}
