export class AssignExamCommand {
  constructor(
    public readonly teacherId: string,
    public readonly examId: string,
    public readonly studentIds: string[],
  ) {}
}
