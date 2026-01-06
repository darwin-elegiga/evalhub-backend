export class GetExamByIdQuery {
  constructor(
    public readonly examId: string,
    public readonly teacherId: string,
  ) {}
}
