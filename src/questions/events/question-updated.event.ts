export class QuestionUpdatedEvent {
  constructor(
    public readonly questionId: string,
    public readonly teacherId: string,
  ) {}
}
