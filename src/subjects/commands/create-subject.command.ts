export class CreateSubjectCommand {
  constructor(
    public readonly teacherId: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly color?: string,
  ) {}
}
