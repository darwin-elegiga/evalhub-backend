export class ExamUpdatedEvent {
  constructor(
    public readonly examId: string,
    public readonly teacherId: string,
  ) {}
}
