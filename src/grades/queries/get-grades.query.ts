export class GetGradesQuery {
  constructor(
    public readonly teacherId: string,
    public readonly career?: string,
    public readonly groupId?: string,
    public readonly studentId?: string,
  ) {}
}
