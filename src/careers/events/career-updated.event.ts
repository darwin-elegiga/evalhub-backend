export class CareerUpdatedEvent {
  constructor(
    public readonly careerId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
