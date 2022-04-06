import { ICache } from 'interfaces';

interface MapArgument<V> {
  value: V;
  date: number;
}

export default class CacheInMemory<K, V> implements ICache<K, V> {
  private map: Map<K, MapArgument<V>>;

  private ttlInMs: number;

  private lastCleanTimestamp: number;

  constructor(ttlInMs: number) {
    this.map = new Map();
    this.ttlInMs = ttlInMs;
    this.lastCleanTimestamp = Date.now();
  }

  public get(key: K): V | undefined {
    const value: V | undefined = this.map.get(key)?.value;

    this.cleanExpiredData();

    return value;
  }

  public set(key: K, value: V): void {
    const argument: MapArgument<V> = {
      value,
      date: Date.now(),
    };

    this.map.set(key, argument);
  }

  private cleanExpiredData(): void {
    const currentTimestamp: number = Date.now();

    if (this.lastCleanTimestamp + this.ttlInMs > currentTimestamp) {
      return;
    }

    this.lastCleanTimestamp = currentTimestamp;

    for (const value of this.map.entries()) {
      const key: K = value[0];
      const mapArgument: MapArgument<V> = value[1];

      if (mapArgument.date + this.ttlInMs < currentTimestamp) {
        this.map.delete(key);
      }
    }
  }
}
