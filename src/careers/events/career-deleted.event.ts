export class CareerDeletedEvent {
  constructor(
    public readonly careerId: string,
    public readonly name: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
