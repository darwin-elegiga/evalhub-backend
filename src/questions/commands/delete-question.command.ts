export class DeleteQuestionCommand {
  constructor(
    public readonly questionId: string,
    public readonly teacherId: string,
  ) {}
}
