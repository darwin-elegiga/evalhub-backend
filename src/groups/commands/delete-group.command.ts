export class DeleteGroupCommand {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
  ) {}
}
