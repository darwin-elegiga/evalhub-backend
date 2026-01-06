export class CreateStudentCommand {
  constructor(
    public readonly teacherId: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly year?: string,
    public readonly career?: string,
    public readonly groupIds?: string[],
  ) {}
}
