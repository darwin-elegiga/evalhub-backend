export class ExamDeletedEvent {
  constructor(
    public readonly examId: string,
    public readonly teacherId: string,
  ) {}
}
