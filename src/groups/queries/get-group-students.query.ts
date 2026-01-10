export class GetGroupStudentsQuery {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
  ) {}
}
