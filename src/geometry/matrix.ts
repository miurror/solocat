import Vector from "./vector";

/**
 * Matrix class (2D)
 */
export default class Matrix {
  public xx: number;
  public xy: number;
  public yx: number;
  public yy: number;

  constructor (array: number[][] = [[1,0],[0,1]]){ // [[xx, xy],[yx, yy]]
    this.xx = array[0][0];
    this.xy = array[0][1];
    this.yx = array[1][0];
    this.yy = array[1][1];
  }

  clone(): Matrix {
    return new Matrix([[this.xx, this.xy],[this.yx, this.yy]]);
  }

  add(mat: Matrix): Matrix {
    this.xx += mat.xx; 
    this.xy += mat.xy; 
    this.yx += mat.yx; 
    this.yy += mat.yy;
    return this;
  }

  sub(mat: Matrix): Matrix {
    this.xx -= mat.xx; 
    this.xy -= mat.xy; 
    this.yx -= mat.yx; 
    this.yy -= mat.yy; 
    return this;
  }

  norm(): number {
    return Math.sqrt(
      this.xx ** 2 + this.xy ** 2 + this.yx ** 2 + this.yy ** 2
    );
  }

  dot(mat: Matrix): Matrix {
    const xx = this.xx * mat.xx + this.xy * mat.yx;
    const xy = this.xx * mat.xy + this.xy * mat.yy;
    const yx = this.yx * mat.xx + this.yy * mat.yx; 
    const yy = this.yx * mat.xy + this.yy * mat.yy;
    this.xx = xx;
    this.xy = xy;
    this.yx = yx;
    this.yy = yy;
    return this;
  }

  static dot(mat1: Matrix, mat2: Matrix): Matrix {
    return new Matrix([
      [
        mat1.xx * mat2.xx + mat1.xy * mat2.yx, 
        mat1.xx * mat2.xy + mat1.xy * mat2.yy
      ], 
      [
        mat1.yx * mat2.xx + mat1.yy * mat2.yx, 
        mat1.yx * mat2.xy + mat1.yy * mat2.yy
      ]
    ]);
  }

  determinant(): number {
    return this.xx * this.yy - this.xy * this.yx;
  }

  det(): number {
    return this.determinant();
  }

  inverse(): Matrix {
    const det = this.det();
    return new Matrix([
      [this.yy/det, -this.xy/det],
      [-this.yx/det, this.xx/det]
    ]);
  }

  toArray(): number[][] {
    return [[this.xx, this.xy], [this.yx, this.yy]];
  }

  toJSON(): any {
    return {
      xx: this.xx,
      xy: this.xy,
      yx: this.yx,
      yy: this.yy,
    };
  }

  operate<T extends Vector>(vector: T): T {
    const x = this.xx * vector.x + this.xy * vector.y;
    const y = this.yx * vector.x + this.yy * vector.y;
    vector.x = x;
    vector.y = y;
    return vector;
  }

  // static operate(mat: Matrix, v: Vector): Vector {
  //   const x = mat.xx * v.x + mat.xy * v.y;
  //   const y = mat.yx * v.x + mat.yy * v.y;
  //   return new Vector(x, y);
  // }

}

