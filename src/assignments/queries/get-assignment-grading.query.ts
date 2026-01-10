export class GetAssignmentGradingQuery {
  constructor(
    public readonly assignmentId: string,
    public readonly teacherId: string,
  ) {}
}
