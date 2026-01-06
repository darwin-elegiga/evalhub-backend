export class RemoveStudentsFromGroupCommand {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
    public readonly studentIds: string[],
  ) {}
}
