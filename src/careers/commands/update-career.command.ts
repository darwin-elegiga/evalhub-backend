export class UpdateCareerCommand {
  constructor(
    public readonly careerId: string,
    public readonly name?: string,
    public readonly code?: string,
    public readonly isActive?: boolean,
  ) {}
}
