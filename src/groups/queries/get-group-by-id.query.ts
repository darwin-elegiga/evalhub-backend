export class GetGroupByIdQuery {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
  ) {}
}
