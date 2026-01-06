export class GetSubjectByIdQuery {
  constructor(
    public readonly subjectId: string,
    public readonly teacherId: string,
  ) {}
}
