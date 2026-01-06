export class QuestionCreatedEvent {
  constructor(
    public readonly questionId: string,
    public readonly teacherId: string,
    public readonly title: string,
  ) {}
}
