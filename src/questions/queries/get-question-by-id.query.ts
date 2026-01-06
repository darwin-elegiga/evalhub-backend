export class GetQuestionByIdQuery {
  constructor(
    public readonly questionId: string,
    public readonly teacherId: string,
  ) {}
}
