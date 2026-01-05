export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ipAddress: string | null = null,
    public readonly userAgent: string | null = null,
    public readonly timestamp: Date = new Date(),
  ) {}
}
