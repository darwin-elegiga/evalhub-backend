export class GetAssignmentByIdQuery {
  constructor(
    public readonly assignmentId: string,
    public readonly teacherId: string,
  ) {}
}
