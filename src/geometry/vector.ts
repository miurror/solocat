// type Constructor<T> = new (...args: any[]) => T;

type VectorJson = {
  x: number;
  y: number;
  class: string;
}

/**
 * Vector class (2D)
 */
export default class Vector {
  constructor(public x: number = 0, public y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static fromArray<T extends Vector>(this: new (x: number, y:number) => T, array : number[]): T{
    return new this(array[0], array[1]);
  }

  setCoordinate(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vector): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }


  equal(v: Vector): boolean { 
    return this.x === v.x && this.y === v.y;
  }

  static equal<T extends Vector>(v1: T, v2: T): boolean {
    return v1.x === v2.x && v1.y === v2.y;
  }

  add(v: Vector): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  // static add<T extends Vector>(this: new (x: number, y:number) => T, v1: T, v2: T): T {
  //   return new this(v1.x + v2.x, v1.y + v2.y);
  // }

  sub(v: Vector): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  static sub<T extends Vector>(this: new(x: number, y:number) => T, v1: T, v2: T): T {
    return new this(v1.x - v2.x, v1.y - v2.y);
  }

  multiply(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  static multiply<T extends Vector>(this: new(x: number, y: number) => T,  scalar: number, v: T): T {
    return new this(scalar * v.x, scalar * v.y);
  }

  dot(v: Vector): number { // 内積
    return (this.x * v.x + this.y * v.y);
  }

  static dot(v1: Vector, v2: Vector): number { // 内積
    return (v1.x * v2.x + v1.y * v2.y);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  squareLength(): number {
    return this.x * this.x + this.y * this.y;
  }

  arg(): number {
    return Math.atan2(this.y, this.x);
  }

  round(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }


  integralLength(): number {
    if (this.x === 0 && this.y === 0) {
      return 0;
    }else if(this.x === 0 || this.y === 0){
      return Math.max(Math.abs(this.x), Math.abs(this.y));
    }else{
      // 最大公約数 
      const gcd = (x: number, y: number ): number => y === 0 ? x: gcd(y, x % y);
      return Math.abs(gcd(this.x, this.y));
    }
  }

  reduce(): this { // primitive lattice vectorを返す
    if (this.x === 0 && this.y === 0){
      return this;
    }else{
      return this.multiply(1/this.integralLength());
    }
  }

  rightOrthogonalVector(): Vector {
    const v = new Vector(this.y, -this.x);
    return v.reduce();
  }

  toArray(): number[] {
    return [this.x, this.y];
  }

  toJSON(): VectorJson {
    return {
      "x": this.x,
      "y": this.y,
      "class": "Vector",
    };
  }
}