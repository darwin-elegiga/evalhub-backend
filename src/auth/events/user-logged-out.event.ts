export class UserLoggedOutEvent {
  constructor(
    public readonly userId: string,
    public readonly tokenId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
