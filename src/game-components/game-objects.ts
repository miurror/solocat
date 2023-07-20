import { Point, Polygon } from "@/geometry/export";
import { PointObjectType, PointStyle, PointStyleLibrary,
  PolygonObjectType, PolygonStyleLibrary } from "@/game-components/export";

export type PointObjectJson = {
  x: number;
  y: number;
  type: PointObjectType;
  class: string;
}

export type PolygonObjectJson = {
  vertices: number[][];
  type: PolygonObjectType;
  class: string;
}

export class PointObject extends Point {
  public type: PointObjectType;
  private _style!: PointStyle;

  constructor (x=0, y=0, type: PointObjectType = PointObjectType.Cat) {
    super(x, y);
    this.type = type;
    this.style = PointStyleLibrary.defaultStyle(type);
  }

  get style(){ return this._style; }
  set style(style: PointStyle){ this._style = style; }

  static fromPoint(point: Point, type: PointObjectType){
    return new this(point.x, point.y, type);
  }

  clone(): PointObject {
    return new PointObject(this.x, this.y, this.type);
  }

  copyTypeAndStyle(point: PointObject){
    this.type = point.type;
    this.style = point.style;
  }

  toJSON(): PointObjectJson {
    return {
      "x": this.x,
      "y": this.y,
      "type": this.type,
      "class": "PointObject",
    };
  }
}


export class PolygonObject extends Polygon {
  public type: PolygonObjectType;
  public style = PolygonStyleLibrary.Default;

  constructor (points: Point[] | number[][] = [[1,0],[0,1],[-1,-1]], 
    type: PolygonObjectType = PolygonObjectType.Normal) {
    super(points);
    this.type = type;
    this.style = PolygonStyleLibrary.defaultStyle(type);
  }

  static fromPolygon(polygon: Polygon, type: PolygonObjectType = PolygonObjectType.Normal){
    return new PolygonObject(polygon.vertices(), type);
  }

  clone(): PolygonObject {
    return new PolygonObject(this.vertices(), this.type);
  }

  copyTypeAndStyle(polygon: PolygonObject){
    this.type = polygon.type;
    this.style = polygon.style;
  }

  toJSON(): PolygonObjectJson {
    const vertices = this.vertices();
    const vertArray: number[][] = [];
    for(const point of vertices){
      vertArray.push([point.x, point.y]);
    }
    return {
      "vertices": vertArray,
      "type": this.type,
      "class": "PolygonObject",
    };
  }
}