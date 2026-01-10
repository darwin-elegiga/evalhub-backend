export class GradeAnswerCommand {
  constructor(
    public readonly answerId: string,
    public readonly teacherId: string,
    public readonly score: number,
    public readonly feedback?: string,
  ) {}
}
