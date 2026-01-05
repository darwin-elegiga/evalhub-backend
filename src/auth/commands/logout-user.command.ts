export class LogoutUserCommand {
  constructor(
    public readonly userId: string,
    public readonly refreshToken: string,
  ) {}
}
