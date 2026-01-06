export class CreateGroupCommand {
  constructor(
    public readonly teacherId: string,
    public readonly name: string,
    public readonly year: string,
    public readonly career: string,
  ) {}
}
