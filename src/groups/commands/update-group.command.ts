export class UpdateGroupCommand {
  constructor(
    public readonly groupId: string,
    public readonly teacherId: string,
    public readonly name?: string,
    public readonly year?: string,
    public readonly career?: string,
  ) {}
}
