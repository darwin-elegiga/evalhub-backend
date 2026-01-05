export class TokenRefreshedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldTokenId: string,
    public readonly newTokenId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
