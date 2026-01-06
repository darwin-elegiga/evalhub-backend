export class ExamCreatedEvent {
  constructor(
    public readonly examId: string,
    public readonly teacherId: string,
    public readonly title: string,
  ) {}
}
