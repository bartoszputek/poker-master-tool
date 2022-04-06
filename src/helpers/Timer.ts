export default class Timer {
  private startTime: [number, number];

  public constructor() {
    this.startTime = process.hrtime();
  }

  public start():void {
    this.startTime = process.hrtime();
  }

  public stop():number {
    const endTime: [number, number] = process.hrtime(this.startTime);

    const timeInMs: number = endTime[0] * 1000 + Math.round(endTime[1] / 1000000);

    return timeInMs;
  }
}
