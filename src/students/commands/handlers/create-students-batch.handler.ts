import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentsBatchCommand } from '../create-students-batch.command';
import { PrismaService } from '../../../prisma';
import { StudentCreatedEvent } from '../../events';
import { BatchResultDto } from '../../dtos';

@Injectable()
@CommandHandler(CreateStudentsBatchCommand)
export class CreateStudentsBatchHandler
  implements ICommandHandler<CreateStudentsBatchCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateStudentsBatchCommand): Promise<BatchResultDto> {
    const { teacherId, students } = command;

    const result: BatchResultDto = {
      created: 0,
      failed: 0,
      errors: [],
      createdIds: [],
    };

    // Collect all unique groupIds to validate
    const allGroupIds = new Set<string>();
    for (const student of students) {
      if (student.groupIds) {
        student.groupIds.forEach((id) => allGroupIds.add(id));
      }
    }

    // Validate all groups belong to teacher
    if (allGroupIds.size > 0) {
      const validGroups = await this.prisma.group.findMany({
        where: {
          id: { in: Array.from(allGroupIds) },
          teacherId,
        },
        select: { id: true },
      });

      const validGroupIds = new Set(validGroups.map((g) => g.id));
      const invalidGroupIds = Array.from(allGroupIds).filter(
        (id) => !validGroupIds.has(id),
      );

      if (invalidGroupIds.length > 0) {
        throw new NotFoundException(
          `Groups not found or do not belong to you: ${invalidGroupIds.join(', ')}`,
        );
      }
    }

    // Get existing emails to check for duplicates
    const emails = students.map((s) => s.email.toLowerCase());
    const existingStudents = await this.prisma.student.findMany({
      where: {
        teacherId,
        email: { in: emails },
      },
      select: { email: true },
    });
    const existingEmails = new Set(existingStudents.map((s) => s.email));

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      const email = studentData.email.toLowerCase();

      try {
        // Check for duplicate email
        if (existingEmails.has(email)) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            email: studentData.email,
            fullName: studentData.fullName,
            error: 'Student with this email already exists',
          });
          continue;
        }

        // Check for duplicate within same batch
        const duplicateInBatch = students
          .slice(0, i)
          .some((s) => s.email.toLowerCase() === email);
        if (duplicateInBatch) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            email: studentData.email,
            fullName: studentData.fullName,
            error: 'Duplicate email in the same batch',
          });
          continue;
        }

        // Create student
        const student = await this.prisma.student.create({
          data: {
            teacherId,
            fullName: studentData.fullName,
            email,
            year: studentData.year,
            career: studentData.career,
            groups:
              studentData.groupIds && studentData.groupIds.length > 0
                ? {
                    create: studentData.groupIds.map((groupId) => ({ groupId })),
                  }
                : undefined,
          },
        });

        // Add to existing emails to prevent duplicates within batch
        existingEmails.add(email);

        result.created++;
        result.createdIds.push(student.id);

        this.eventBus.publish(
          new StudentCreatedEvent(
            student.id,
            teacherId,
            student.fullName,
            student.email,
          ),
        );
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          email: studentData.email,
          fullName: studentData.fullName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }
}
