export class GetStudentsQuery {
  constructor(
    public readonly teacherId: string,
    public readonly groupId?: string,
    public readonly career?: string,
    public readonly year?: string,
    public readonly search?: string,
  ) {}
}
