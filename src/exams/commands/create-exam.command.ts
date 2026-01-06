import { ExamConfigInputDto, ExamQuestionInputDto } from '../dtos';

export class CreateExamCommand {
  constructor(
    public readonly teacherId: string,
    public readonly title: string,
    public readonly config: ExamConfigInputDto,
    public readonly questions: ExamQuestionInputDto[],
    public readonly description?: string,
    public readonly subjectId?: string,
    public readonly durationMinutes?: number,
  ) {}
}
