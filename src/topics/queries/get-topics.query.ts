export class GetTopicsQuery {
  constructor(
    public readonly teacherId: string,
    public readonly subjectId?: string,
  ) {}
}
