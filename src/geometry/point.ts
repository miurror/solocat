import Vector from "./vector";

type PointJson = {
  x: number;
  y: number;
  class: string;
}

/**
 * point
 */
export default class Point extends Vector {
  private static _count = 0;

  constructor(x = 0, y = 0) {
    super(x, y);
    Point._count ++;
  }

  clone(): Point {
    return new Point(this.x, this.y);
  }

  static get count() {
    return Point._count;
  }

  isLatticePoint(): boolean {
    return Number.isInteger(this.x) && Number.isInteger(this.y);
  }

  toJSON(): PointJson {
    return {
      "x": this.x,
      "y": this.y,
      "class": "Point",
    };
  }
}

