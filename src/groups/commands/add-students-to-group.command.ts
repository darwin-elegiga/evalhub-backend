export class AddStudentsToGroupCommand {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
    public readonly studentIds: string[],
  ) {}
}
