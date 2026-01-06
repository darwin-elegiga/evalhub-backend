export class CareerCreatedEvent {
  constructor(
    public readonly careerId: string,
    public readonly name: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
