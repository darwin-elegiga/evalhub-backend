import { StudentItemDto } from '../dtos';

export class CreateStudentsBatchCommand {
  constructor(
    public readonly teacherId: string,
    public readonly students: StudentItemDto[],
  ) {}
}
