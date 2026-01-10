import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { AuthModule, JwtAuthGuard } from './auth';
import { CareersModule } from './careers';
import { SubjectsModule } from './subjects';
import { StudentsModule } from './students';
import { GroupsModule } from './groups';
import { QuestionsModule } from './questions';
import { ExamsModule } from './exams';
import { TopicsModule } from './topics';
import { ConfigEndpointsModule } from './config-endpoints';
import { AssignmentsModule } from './assignments';
import { GradesModule } from './grades';
import { jwtConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CareersModule,
    SubjectsModule,
    StudentsModule,
    GroupsModule,
    QuestionsModule,
    ExamsModule,
    TopicsModule,
    ConfigEndpointsModule,
    AssignmentsModule,
    GradesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
