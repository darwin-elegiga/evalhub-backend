# NestJS Backend Architecture Skill

## 📋 Cuándo Usar Esta Guía

Activa esta guía cuando:
- Diseñes nuevas features o módulos
- Implementes modelos de dominio (agregados, entidades, value objects)
- Crees controllers, services, commands o queries
- Estructures organización de módulos
- Diseñes tablas de base de datos y schemas
- Implementes repositorios o patrones de acceso a datos
- Tomes decisiones arquitectónicas
- Refactorices código existente
- Revises código para cumplimiento arquitectónico

## 🗃️ Stack Tecnológico

- **Framework:** NestJS con inyección de dependencias
- **ORM:** TypeORM para operaciones de base de datos
- **Patrones:** DDD, CQRS, Repository Pattern
- **Lenguaje:** TypeScript con tipado estricto
- **Colas (opcional):** BullMQ para trabajos en background
- **Caché (opcional):** Redis

## ⚡ Reglas Fundamentales

### 1. Tipado Estricto
❌ **NUNCA** uses `any`  
✅ **SIEMPRE** define tipos explícitos

```typescript
// ❌ MAL
function process(data: any) { }

// ✅ BIEN
interface UserData {
  id: string;
  email: string;
  name: string;
}
function process(data: UserData): void { }
```

### 2. Aislamiento de Módulos
Los módulos se comunican **SOLO** via CommandBus/QueryBus, nunca directamente.

```typescript
// ❌ MAL - Dependencia directa entre módulos
@Injectable()
export class OrderService {
  constructor(private readonly userService: UserService) {}
}

// ✅ BIEN - Comunicación via buses
@Injectable()
export class OrderService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async createOrder(userId: string) {
    const user = await this.queryBus.execute(new GetUserQuery(userId));
  }
}
```

### 3. Lógica en el Dominio
**TODA** la lógica de negocio vive en los modelos de dominio, **NO** en handlers o services.

### 4. Encapsulación
Los modelos de dominio **NUNCA** exponen campos públicos; solo getters y métodos.

### 5. Separación CQRS
Separación **completa** entre operaciones de lectura (queries) y escritura (commands).

### 6. Services Solo Orquestan
Los Application Services **SOLO** orquestan; nunca contienen lógica de negocio.

### 7. Comunicación Cross-Module

**REGLA CRÍTICA:** Al ejecutar commands/queries de otros módulos via buses, **NO** los importes en el array de imports del módulo.

```typescript
// ❌ MAL - Importar query cross-module en el módulo
@Module({
  imports: [
    CqrsModule,
    GetUserQuery, // ❌ NO HACER ESTO
  ],
})
export class OrdersModule {}

// ✅ BIEN - Solo importar CqrsModule
@Module({
  imports: [CqrsModule],
  providers: [OrderService],
})
export class OrdersModule {}

// ✅ BIEN - Usar la query en el service
@Injectable()
export class OrderService {
  constructor(private readonly queryBus: QueryBus) {}

  async createOrder(userId: string) {
    // Solo instanciar la clase (es una estructura de datos)
    const user = await this.queryBus.execute(new GetUserQuery(userId));
  }
}
```

**Por qué esta regla:**
- El bus maneja la ejecución en el módulo fuente donde está registrado el handler
- El caller solo necesita instanciar la clase command/query
- No se necesita inyección de dependencias del lado del caller
- Mantiene verdadero aislamiento entre módulos

## 🎯 Arquitectura por Capas

### Flujo de Capas
```
Cliente → Controller → Service → Command/Query Handler → Domain Model/Repository → Database
```

### 1️⃣ Controller (Capa de Presentación)

**Responsabilidades:**
- Definir contratos HTTP con decoradores OpenAPI
- Aplicar guards, validación y decoradores
- Extraer parámetros de la request
- Delegar al Application Service
- Retornar ResponseDTO tal cual lo recibe del service

```typescript
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiResponse({ status: 201, type: CreateUserResponseDTO })
  async create(
    @Body() request: CreateUserRequestDTO,
  ): Promise<CreateUserResponseDTO> {
    return this.userService.createUser(request);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async getById(@Param('id') id: string): Promise<GetUserResponseDTO> {
    return this.userService.getUserById(id);
  }
}
```

**Anti-Patrones del Controller:**
- ❌ Nunca contengas lógica de negocio
- ❌ Nunca llames repositorios directamente
- ❌ Nunca llames clientes externos directamente

### 2️⃣ Application Service (Capa de Aplicación)

**Responsabilidades:**
- Orquestar uno o múltiples commands/queries via buses
- Consolidar respuestas
- Crear ResponseDTOs
- **NUNCA** contener lógica de negocio

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createUser(request: CreateUserRequestDTO): Promise<CreateUserResponseDTO> {
    const result = await this.commandBus.execute(
      new CreateUserCommand(request.email, request.name, request.password),
    );

    return CreateUserResponseDTO.fromCommandResult(result);
  }

  async getUserById(id: string): Promise<GetUserResponseDTO> {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }
}
```

**Anti-Patrones del Service:**
- ❌ Nunca contengas lógica de negocio
- ❌ Nunca uses if/else para reglas de negocio
- ❌ Nunca llames repositorios directamente

### 3️⃣ Command Handler (Operaciones de Escritura)

**Responsabilidades:**
- Cargar agregados usando repositorios
- Delegar lógica de negocio a Domain Models
- Persistir cambios via `repository.save()`
- Validar precondiciones

```typescript
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly password: string,
  ) {}
}

export interface CreateUserCommandResult {
  userId: string;
  email: string;
  name: string;
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserCommandResult> {
    this.logger.log('Creating new user', { email: command.email });

    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = User.create({
      email: command.email,
      name: command.name,
      password: command.password,
    });

    await this.userRepository.save(user);

    this.logger.log('User created successfully', { userId: user.id });

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
```

**REGLA CRÍTICA:** Los handlers **NUNCA** llaman otros commands/queries via buses. Solo el Application Service orquesta múltiples commands/queries.

**REGLA CRÍTICA:** Los handlers **NO** deben inyectar repositorios de otros agregados o módulos. Los datos de otros agregados/módulos deben venir via parámetros del command/query, obtenidos por el Application Service.

```typescript
// ❌ MAL - Repositorios cross-module
export class CreateOrderCommandHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository, // ❌
    private readonly productRepository: ProductRepository, // ❌
  ) {}
}

// ✅ BIEN - Datos via command
export class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly userName: string, // ✅ Pasado por el service
    public readonly productId: string,
    public readonly productPrice: number, // ✅ Pasado por el service
  ) {}
}

export class CreateOrderCommandHandler {
  constructor(
    private readonly orderRepository: OrderRepository, // ✅ Solo su propio repo
  ) {}

  async execute(command: CreateOrderCommand) {
    const order = Order.create({
      userId: command.userId,
      userName: command.userName,
      productId: command.productId,
      productPrice: command.productPrice,
    });

    await this.orderRepository.save(order);
  }
}
```

### 4️⃣ Query Handler (Operaciones de Lectura)

**Responsabilidades:**
- Obtener datos del repositorio
- Mapear Domain Models a DTOs
- **NO** efectos secundarios
- **NO** mutaciones

```typescript
export class GetUserByIdQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<GetUserResponseDTO> {
    this.logger.log('Fetching user by ID', { userId: query.userId });

    const user = await this.userRepository.findOne({
      where: { id: query.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return GetUserResponseDTO.fromDomain(user);
  }
}
```

### 5️⃣ Domain Model (Capa de Dominio)

**Responsabilidades:**
- Contener **TODA** la lógica de negocio
- Proteger invariantes
- Validar reglas de negocio
- Mantener consistencia del estado

```typescript
export class User {
  private _id: string;
  private _email: string;
  private _name: string;
  private _password: string;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor() {}

  static create(params: {
    email: string;
    name: string;
    password: string;
  }): User {
    const user = new User();
    user._id = uuidv4();
    user._email = params.email.toLowerCase().trim();
    user._name = params.name.trim();
    user._password = this.hashPassword(params.password);
    user._isActive = true;
    user._createdAt = new Date();
    user._updatedAt = new Date();

    user.validateEmail();
    user.validateName();
    user.validatePassword(params.password);

    return user;
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }
    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (!this._isActive) {
      throw new BadRequestException('User is already inactive');
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  private validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  private validateName(): void {
    if (this._name.length < 2 || this._name.length > 100) {
      throw new BadRequestException('Name must be between 2 and 100 characters');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }

  private static hashPassword(password: string): string {
    return password;
  }
}
```

**Anti-Patrones del Domain Model:**
- ❌ Nunca expongas campos públicos
- ❌ Nunca permitas mutación directa de propiedades
- ❌ Nunca uses constructores públicos
- ❌ Nunca contengas preocupaciones de infraestructura

### 6️⃣ Repository (Capa de Datos)

**Responsabilidades:**
- Abstraer acceso a datos
- Métodos custom para queries complejos
- Usar métodos heredados de TypeORM

```typescript
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async searchByName(searchTerm: string): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .orderBy('user.name', 'ASC')
      .getMany();
  }
}
```

**Reglas de Uso del ORM:**
- ✅ **SIEMPRE** fetch entity, modifica via métodos de dominio, luego save
- ✅ **SIEMPRE** usa factory methods estáticos del dominio para crear entidades
- ✅ **SIEMPRE** deja que el ORM trackee cambios automáticamente
- ❌ **NUNCA** uses `repository.update()` - bypasea lógica de dominio
- ❌ **NUNCA** uses `repository.insert()` - bypasea lógica de dominio
- ❌ **NUNCA** uses `repository.create()` - usa factory methods del dominio

```typescript
// ❌ MAL - Bypasea dominio
await this.userRepository.update({ id: userId }, { name: newName });

// ✅ BIEN - Usa lógica de dominio
const user = await this.userRepository.findOneOrFail({ where: { id: userId } });
user.updateName(newName);
await this.userRepository.save(user);
```

## 📦 DTOs (Data Transfer Objects)

### Request DTO
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserRequestDTO {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
```

### Response DTO
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponseDTO {
  @ApiProperty({ description: 'ID único del usuario' })
  id: string;

  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  name: string;

  @ApiProperty({ description: 'Estado activo del usuario' })
  isActive: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  static fromDomain(user: User): GetUserResponseDTO {
    const dto = new GetUserResponseDTO();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
```

## 📁 Estructura de Módulos

```
src/
├── modules/
│   ├── users/
│   │   ├── controllers/
│   │   │   └── user.controller.ts
│   │   ├── services/
│   │   │   └── user.service.ts
│   │   ├── commands/
│   │   │   ├── create-user.command.ts
│   │   │   ├── create-user.handler.ts
│   │   │   └── update-user.command.ts
│   │   ├── queries/
│   │   │   ├── get-user-by-id.query.ts
│   │   │   ├── get-user-by-id.handler.ts
│   │   │   └── get-users.query.ts
│   │   ├── domain/
│   │   │   ├── user.entity.ts
│   │   │   └── user-status.enum.ts
│   │   ├── repositories/
│   │   │   └── user.repository.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   ├── dtos/
│   │   │   ├── requests/
│   │   │   │   └── create-user.request.dto.ts
│   │   │   └── responses/
│   │   │       └── user.response.dto.ts
│   │   └── users.module.ts
│   └── orders/
│       └── ... (misma estructura)
├── shared/
│   ├── domain/
│   ├── exceptions/
│   └── decorators/
└── app.module.ts
```

## 🔧 TypeORM Schema

**CRÍTICO:** **NUNCA** uses decoradores TypeORM en clases de dominio. **SIEMPRE** usa archivos de schema separados.

```typescript
import { EntitySchema } from 'typeorm';
import { User } from '../domain/user.entity';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
      name: 'email',
    },
    name: {
      type: 'varchar',
      length: 100,
      name: 'name',
    },
    password: {
      type: 'varchar',
      length: 255,
      name: 'password',
    },
    isActive: {
      type: 'boolean',
      default: true,
      name: 'is_active',
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at',
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
      name: 'updated_at',
    },
  },
  indices: [
    {
      name: 'idx_users_email',
      columns: ['email'],
    },
  ],
});
```

## ⚙️ Configuración del Módulo

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { UserSchema } from './schemas/user.schema';

import { CreateUserCommandHandler } from './commands/create-user.handler';
import { GetUserByIdQueryHandler } from './queries/get-user-by-id.handler';

const CommandHandlers = [CreateUserCommandHandler];
const QueryHandlers = [GetUserByIdQueryHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserSchema]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [UserService],
})
export class UsersModule {}
```

## 🎯 Principios SOLID

### 1. Single Responsibility (SRP)
Cada clase tiene **UNA** sola razón para cambiar.

```typescript
// ✅ BIEN - Cada clase tiene una responsabilidad
class UserValidator {
  validate(user: User): void { }
}

class UserRepository {
  save(user: User): Promise<void> { }
}

class UserNotificationService {
  sendWelcomeEmail(user: User): Promise<void> { }
}
```

### 2. Open/Closed (OCP)
Abierto para extensión, cerrado para modificación.

```typescript
interface NotificationStrategy {
  send(user: User, message: string): Promise<void>;
}

class EmailNotification implements NotificationStrategy {
  async send(user: User, message: string): Promise<void> { }
}

class SMSNotification implements NotificationStrategy {
  async send(user: User, message: string): Promise<void> { }
}
```

### 3. Liskov Substitution (LSP)
Las subclases deben ser sustituibles por sus clases base.

### 4. Interface Segregation (ISP)
Los clientes no deben depender de interfaces que no usan.

### 5. Dependency Inversion (DIP)
Depender de abstracciones, no de implementaciones concretas.

## ✅ Estándares de Calidad

### Uso de Enums
**Usa enums** en lugar de string unions para conjuntos fijos de valores.

```typescript
// ✅ BIEN
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

// ❌ MAL
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
```

**Convenciones:**
- Nombre del enum: `PascalCase` (e.g., `UserStatus`, `OrderType`)
- Keys del enum: `UPPER_SNAKE_CASE` (e.g., `ACTIVE`, `IN_PROGRESS`)
- Values del enum: Igual que keys (e.g., `ACTIVE = 'ACTIVE'`)

### Política de Comentarios

**Regla Absoluta:** **NUNCA** agregues comentarios `//` o `/* */`. El código debe ser 100% auto-documentado.

**Por qué están prohibidos:**
1. Comentarios obvios contaminan el código
2. Comentarios que explican lógica compleja = el método necesita refactoring

**Cómo escribir código auto-documentado:**
1. Usa nombres descriptivos de variables y métodos
2. Extrae condiciones complejas en métodos bien nombrados
3. Divide métodos complejos siguiendo SRP

**JSDoc - ALTAMENTE RECOMENDADO:**

Los comentarios JSDoc (`/** */`) son la **ÚNICA** forma aceptable de documentación:

```typescript
/**
 * Creates a new user account with validated email and password
 * @param email - User's email address
 * @param name - User's full name
 * @param password - User's password (will be hashed)
 * @returns Newly created user entity
 * @throws BadRequestException if validation fails
 */
static create(params: { email: string; name: string; password: string }): User {
  // implementación
}
```

**Reglas de Enforcement:**
- ❌ **NUNCA** agregues comentarios `//`
- ❌ **NUNCA** agregues comentarios `/* */`
- ❌ **NUNCA** uses comentarios para explicar lógica compleja - refactoriza
- ✅ **SIEMPRE** escribe código auto-documentado
- ✅ **SIEMPRE** usa JSDoc (`/** */`) para APIs públicas

### Formato de Bloques de Código

**Regla Absoluta:** **SIEMPRE** usa llaves `{}` para todas las declaraciones de control de flujo, incluso para declaraciones de una sola línea.

```typescript
// ❌ MAL
if (user) return;

// ✅ BIEN
if (user) {
  return;
}

// ❌ MAL
for (const item of items) item.validate();

// ✅ BIEN
for (const item of items) {
  item.validate();
}
```

### Convenciones de Nombres

- Controllers: `{nombre-modulo}.controller.ts`
- Services: `{nombre-modulo}.service.ts`
- Commands: `{nombre-command}.command.ts`
- Command Handlers: `{nombre-command}.handler.ts`
- Queries: `{nombre-query}.query.ts`
- Query Handlers: `{nombre-query}.handler.ts`
- Entities: `{nombre-entidad}.entity.ts`
- Value Objects: `{nombre-vo}.vo.ts`
- Enums: `{nombre-enum}.enum.ts`
- Repositories: `{nombre-entidad}.repository.ts`
- Schemas: `{nombre-entidad}.schema.ts`

## 🔄 Flujo Completo de Ejemplo

Veamos cómo todos los componentes trabajan juntos para crear un usuario:

```
1. Cliente → POST /users { email, name, password }
2. UserController → Valida request con class-validator
3. UserController → Delega a UserService.createUser()
4. UserService → Ejecuta CreateUserCommand via CommandBus
5. CreateUserCommandHandler → Valida email único en repositorio
6. CreateUserCommandHandler → User.create() (aplica lógica de negocio)
7. CreateUserCommandHandler → userRepository.save(user)
8. CreateUserCommandHandler → Retorna CreateUserCommandResult
9. UserService → Crea CreateUserResponseDTO.fromCommandResult()
10. UserController → Retorna 201 con CreateUserResponseDTO
```

## 🔍 Manejo de Errores y Excepciones

### Principios de Manejo de Errores

1. **Lanzar errores en el dominio:** Las reglas de negocio violadas se lanzan como excepciones desde el domain model
2. **Validaciones en handlers:** Los handlers validan precondiciones (ej: registro duplicado)
3. **Propagar hacia arriba:** Controllers no atrapan excepciones, dejan que NestJS las maneje
4. **Usar excepciones de NestJS:** Siempre usa las excepciones built-in de NestJS

```typescript
// ✅ BIEN - Excepción en el dominio
export class User {
  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new BadRequestException('Invalid email format');
    }
    this._email = newEmail;
  }
}

// ✅ BIEN - Validación en handler
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler {
  async execute(command: CreateUserCommand) {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    
    const user = User.create(command);
    return this.userRepository.save(user);
  }
}
```

### Excepciones Comunes de NestJS

- `BadRequestException` (400): Datos de entrada inválidos
- `UnauthorizedException` (401): Usuario no autenticado
- `ForbiddenException` (403): Usuario sin permisos
- `NotFoundException` (404): Recurso no encontrado
- `ConflictException` (409): Conflicto con estado actual (ej: duplicado)
- `InternalServerErrorException` (500): Error interno del servidor

## 🔐 Autenticación y Autorización

### Guards

Los guards manejan autenticación y autorización en controllers:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return this.matchRoles(roles, user.roles);
  }

  private matchRoles(requiredRoles: string[], userRoles: string[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }
}
```

### Uso en Controllers

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  @Post()
  @Roles('admin')
  async create(@Body() request: CreateUserRequestDTO) {
    return this.userService.createUser(request);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return this.userService.getUserById(user.id);
  }
}
```

## 📊 Paginación y Filtrado

### DTOs de Paginación

```typescript
export class PaginationRequestDTO {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginationMetaDTO {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrevious: boolean;
}

export class PaginatedResponseDTO<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  meta: PaginationMetaDTO;

  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDTO<T> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
}
```

### Implementación en Repository

```typescript
@Injectable()
export class UserRepository extends Repository<User> {
  async findPaginated(
    page: number,
    limit: number,
    filters?: { isActive?: boolean; searchTerm?: string },
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const query = this.repository.createQueryBuilder('user');
    
    if (filters?.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }
    
    if (filters?.searchTerm) {
      query.andWhere('user.name ILIKE :searchTerm', { 
        searchTerm: `%${filters.searchTerm}%` 
      });
    }
    
    const [users, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();
    
    return { users, total };
  }
}
```

## 🔄 Transacciones

### Uso de Transacciones en Handlers

Para operaciones que requieren múltiples cambios atómicos:

```typescript
@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreateOrderCommandResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = Order.create(command);
      const savedOrder = await queryRunner.manager.save(order);
      
      for (const item of command.items) {
        const orderItem = OrderItem.create(savedOrder.id, item);
        await queryRunner.manager.save(orderItem);
      }
      
      await queryRunner.commitTransaction();
      
      return {
        orderId: savedOrder.id,
        totalAmount: savedOrder.totalAmount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

## 📝 Logging

### Implementación de Logger

```typescript
@Injectable()
export class ApplicationLogger {
  private logger = new Logger(ApplicationLogger.name);

  log(message: string, context?: Record<string, any>): void {
    this.logger.log(message, JSON.stringify(context));
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.logger.error(
      message,
      error?.stack,
      JSON.stringify({ ...context, error: error?.message }),
    );
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(message, JSON.stringify(context));
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(message, JSON.stringify(context));
  }
}
```

### Uso en Handlers

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: ApplicationLogger,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserCommandResult> {
    this.logger.log('Creating new user', { email: command.email });

    try {
      const user = User.create(command);
      await this.userRepository.save(user);
      
      this.logger.log('User created successfully', { 
        userId: user.id,
        email: user.email 
      });
      
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      this.logger.error('Failed to create user', error, { email: command.email });
      throw error;
    }
  }
}
```

## 🧪 Testing

### Unit Tests para Domain Models

```typescript
describe('User', () => {
  describe('create', () => {
    it('should create user with valid data', () => {
      const user = User.create({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.isActive).toBe(true);
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        User.create({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123',
        });
      }).toThrow(BadRequestException);
    });
  });

  describe('updateName', () => {
    it('should update name successfully', () => {
      const user = User.create({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      user.updateName('New Name');

      expect(user.name).toBe('New Name');
    });

    it('should throw error for empty name', () => {
      const user = User.create({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(() => user.updateName('')).toThrow(BadRequestException);
    });
  });
});
```

### Integration Tests para Handlers

```typescript
describe('CreateUserCommandHandler', () => {
  let handler: CreateUserCommandHandler;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserCommandHandler,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ApplicationLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateUserCommandHandler>(CreateUserCommandHandler);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should create user successfully', async () => {
    const command = new CreateUserCommand(
      'test@example.com',
      'Test User',
      'password123',
    );

    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(userRepository, 'save').mockResolvedValue(undefined);

    const result = await handler.execute(command);

    expect(result).toHaveProperty('userId');
    expect(result.email).toBe('test@example.com');
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('should throw error if email exists', async () => {
    const command = new CreateUserCommand(
      'test@example.com',
      'Test User',
      'password123',
    );

    const existingUser = User.create({
      email: 'test@example.com',
      name: 'Existing User',
      password: 'password123',
    });

    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(existingUser);

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });
});
```

## 🌐 Variables de Entorno

### Configuration Module

```typescript
import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
}));
```

### Uso en Módulos

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        synchronize: false,
        entities: [],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## 🚦 Middleware y Interceptors

### Request Logging Middleware

```typescript
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: ApplicationLogger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      this.logger.log('HTTP Request', {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  }
}
```

### Transform Response Interceptor

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
```

## ⚡ Background Jobs (BullMQ)

### Queue Configuration

```typescript
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
})
export class EmailModule {}
```

### Job Producer (en Command Handler)

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserCommandResult> {
    const user = User.create(command);
    await this.userRepository.save(user);

    await this.emailQueue.add('welcome', {
      email: user.email,
      name: user.name,
    });

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
```

### Job Consumer

```typescript
@Processor('email')
export class EmailConsumer {
  constructor(private readonly logger: ApplicationLogger) {}

  @Process('welcome')
  async sendWelcomeEmail(job: Job<{ email: string; name: string }>): Promise<void> {
    this.logger.log('Sending welcome email', { email: job.data.email });

    try {
      this.logger.log('Welcome email sent successfully', { email: job.data.email });
    } catch (error) {
      this.logger.error('Failed to send welcome email', error, { 
        email: job.data.email 
      });
      throw error;
    }
  }
}
```

## 📚 Value Objects

Value Objects son objetos inmutables que representan conceptos sin identidad.

```typescript
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Email {
    if (!this.isValid(value)) {
      throw new BadRequestException('Invalid email format');
    }
    return new Email(value.toLowerCase().trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  private constructor(amount: number, currency: string) {
    this._amount = amount;
    this._currency = currency;
  }

  static create(amount: number, currency: string): Money {
    if (amount < 0) {
      throw new BadRequestException('Amount cannot be negative');
    }
    if (!['USD', 'EUR', 'GBP'].includes(currency)) {
      throw new BadRequestException('Invalid currency');
    }
    return new Money(amount, currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new BadRequestException('Cannot add money with different currencies');
    }
    return Money.create(this._amount + other._amount, this._currency);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }
}
```

### Uso en Domain Models

```typescript
export class User {
  private _id: string;
  private _email: Email;
  private _name: string;

  static create(params: { email: string; name: string }): User {
    const user = new User();
    user._id = uuidv4();
    user._email = Email.create(params.email);
    user._name = params.name;
    return user;
  }

  get email(): string {
    return this._email.value;
  }

  updateEmail(newEmail: string): void {
    this._email = Email.create(newEmail);
  }
}
```

## ✅ Checklist de Implementación

Antes de considerar una feature completa, verifica:

### Domain Layer
- [ ] ¿Domain models usan campos privados con getters?
- [ ] ¿Toda la lógica de negocio está en el dominio?
- [ ] ¿Se usan factory methods estáticos para crear entidades?
- [ ] ¿Value Objects son inmutables?
- [ ] ¿Validaciones de negocio lanzan excepciones apropiadas?

### Application Layer
- [ ] ¿Commands/Queries son simples estructuras de datos?
- [ ] ¿Handlers solo inyectan su propio repositorio?
- [ ] ¿Handlers no llaman otros handlers via buses?
- [ ] ¿Services solo orquestan sin lógica de negocio?
- [ ] ¿Se usa el patrón fetch-modify-save?

### Presentation Layer
- [ ] ¿Controllers solo definen contrato HTTP?
- [ ] ¿DTOs tienen decoradores de validación?
- [ ] ¿Response DTOs tienen factory methods `fromDomain()`?
- [ ] ¿Guards manejan autenticación/autorización?

### Infrastructure Layer
- [ ] ¿Schemas TypeORM están separados de domain models?
- [ ] ¿Repositories heredan de TypeORM Repository?
- [ ] ¿Módulos se comunican solo via buses?
- [ ] ¿No se importan commands/queries cross-module en módulos?

### Code Quality
- [ ] ¿No hay uso de tipo `any`?
- [ ] ¿Código es auto-documentado sin comentarios `//`?
- [ ] ¿Se usan enums para valores fijos?
- [ ] ¿Todas las estructuras de control usan llaves `{}`?
- [ ] ¿Se siguen convenciones de nombres?

### Testing
- [ ] ¿Domain models tienen unit tests?
- [ ] ¿Handlers tienen integration tests?
- [ ] ¿Tests cubren casos de éxito y error?

## 📚 Resumen de Reglas DO/DON'T

### ✅ HACER

- Usar tipado fuerte (no `any`)
- Encapsular lógica en domain models
- Separar queries (lectura) de commands (escritura)
- Comunicar módulos via buses
- Usar factory methods estáticos en dominio
- Usar patrón fetch-modify-save
- Código auto-documentado
- Usar enums para valores fijos
- Usar JSDoc para APIs públicas
- Validar en el dominio
- Handlers solo inyectan su propio repositorio
- Usar Value Objects para conceptos sin identidad
- Implementar logging apropiado
- Usar transacciones para operaciones atómicas
- Escribir tests comprehensivos

### ❌ NO HACER

- Usar tipo `any`
- Lógica de negocio en handlers/services
- Exponer campos públicos en dominio
- Importar services de otros módulos directamente
- Bypass del flujo de capas
- Usar `repository.update()`, `repository.insert()`, `repository.create()`
- Comentarios `//` o `/* */` (solo JSDoc)
- Constructores públicos en dominio
- Handlers llamando otros handlers via buses
- Inyectar repositorios cross-module en handlers
- Mezclar operaciones de lectura y escritura
- Importar commands/queries cross-module en el array de imports

## 🚀 Pasos para Implementar una Feature

### 1. Entender el Requerimiento
- ¿Es lectura (query) o escritura (command)?
- ¿A qué módulo/bounded context pertenece?
- ¿Qué agregados y entidades están involucrados?
- ¿Necesita comunicación con otros módulos?

### 2. Diseñar el Domain Model
- Define entidades y value objects
- Identifica reglas de negocio e invariantes
- Diseña métodos para operaciones de negocio
- Asegura encapsulación (campos privados, métodos públicos)
- Considera transacciones si hay múltiples cambios atómicos

### 3. Diseñar el Schema de Base de Datos
- Crea EntitySchema separado del domain model
- Define columnas, tipos, constraints
- Agrega índices para queries frecuentes
- Considera relaciones con otras tablas

### 4. Implementar Repository
- Extiende de TypeORM Repository
- Agrega métodos custom para queries complejos
- Usa QueryBuilder para queries avanzados
- Mantén repositorio enfocado en su agregado

### 5. Implementar CQRS
- Crea command/query con parámetros requeridos
- Si necesita datos de otros módulos, el service los obtiene primero
- Implementa handler que delega al domain model
- Define return types explícitos
- Agrega logging apropiado
- Maneja errores correctamente

### 6. Implementar Application Service
- Orquesta commands/queries via buses
- Obtiene datos de otros módulos si es necesario
- Pasa todos los datos requeridos al command/query
- Consolida respuestas si es necesario
- Usa factory methods en ResponseDTO
- Considera agregar jobs a queues si es necesario

### 7. Implementar DTOs
- Crea Request DTOs con decoradores de validación
- Crea Response DTOs con factory methods
- Documenta con decoradores OpenAPI
- Considera DTOs de paginación si aplica

### 8. Implementar Controller
- Define contrato HTTP con decoradores OpenAPI
- Aplica guards y decoradores apropiados
- Delega al service
- Retorna ResponseDTO sin transformación

### 9. Configurar Módulo
- Registra controller, service, repository
- Registra handlers en arrays separados
- Importa CqrsModule y TypeORM features
- Exporta service si otros módulos lo necesitan

### 10. Escribir Tests
- Unit tests para domain models
- Integration tests para handlers
- E2E tests para endpoints críticos
- Cubre casos de éxito y error

### 11. Validar Arquitectura
- Asegura que ningún módulo acceda a otro módulo directamente
- Verifica que handlers solo inyecten su propio repositorio
- Comprueba que services no contengan lógica de negocio
- Valida que se sigan todas las convenciones de nombres
- Verifica que no haya comentarios `//` innecesarios
- Confirma que se usen enums apropiadamente

## 🎓 Conceptos Avanzados

### Domain Events

Para comunicación asíncrona entre agregados:

```typescript
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
  ) {}
}

export class User {
  static create(params: { email: string; name: string }): User {
    const user = new User();
    user.apply(new UserCreatedEvent(user.id, user.email, user.name));
    return user;
  }
}

@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailQueue.add('welcome', {
      email: event.email,
      name: event.name,
    });
  }
}
```

### Aggregate Root Pattern

Para manejar consistencia entre entidades relacionadas:

```typescript
export class Order {
  private _id: string;
  private _items: OrderItem[] = [];
  private _status: OrderStatus;

  addItem(productId: string, quantity: number, price: number): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Cannot add items to non-draft order');
    }

    const item = OrderItem.create(productId, quantity, price);
    this._items.push(item);
  }

  removeItem(itemId: string): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Cannot remove items from non-draft order');
    }

    const index = this._items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new NotFoundException('Item not found');
    }

    this._items.splice(index, 1);
  }

  submit(): void {
    if (this._items.length === 0) {
      throw new BadRequestException('Cannot submit empty order');
    }
    if (this._status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Order already submitted');
    }

    this._status = OrderStatus.PENDING;
  }
}
```

## 🎯 Resumen Final

Esta guía establece una arquitectura NestJS robusta basada en:

1. **Domain-Driven Design:** Lógica de negocio en el dominio
2. **CQRS:** Separación clara entre lecturas y escrituras
3. **Clean Architecture:** Capas bien definidas y desacopladas
4. **SOLID Principles:** Código mantenible y extensible
5. **Type Safety:** TypeScript con tipado estricto
6. **Self-Documenting Code:** Sin comentarios innecesarios
7. **Module Isolation:** Comunicación solo via buses

**El resultado es código:**
- ✅ Mantenible y escalable
- ✅ Testeable y confiable
- ✅ Auto-documentado y legible
- ✅ Type-safe y predecible
- ✅ Siguiendo mejores prácticas de la industria