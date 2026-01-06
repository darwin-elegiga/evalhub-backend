export class QuestionDeletedEvent {
  constructor(
    public readonly questionId: string,
    public readonly teacherId: string,
  ) {}
}
