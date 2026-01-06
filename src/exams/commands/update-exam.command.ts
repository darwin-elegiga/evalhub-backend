import { ExamConfigInputDto, ExamQuestionInputDto } from '../dtos';

export class UpdateExamCommand {
  constructor(
    public readonly examId: string,
    public readonly teacherId: string,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly subjectId?: string | null,
    public readonly durationMinutes?: number | null,
    public readonly config?: ExamConfigInputDto,
    public readonly questions?: ExamQuestionInputDto[],
  ) {}
}
