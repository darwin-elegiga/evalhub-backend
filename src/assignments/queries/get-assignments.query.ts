export class GetAssignmentsQuery {
  constructor(
    public readonly teacherId: string,
    public readonly examId?: string,
    public readonly studentId?: string,
    public readonly status?: string,
  ) {}
}
