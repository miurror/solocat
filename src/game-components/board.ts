import { PointObject, PolygonObject } from "@/game-components/export";

export class Board {
  public polygons: PolygonObject[];
  public items: PointObject[];

  constructor(polygons: PolygonObject[] = [], items: PointObject[] = []){
    this.polygons = polygons;
    this.items = items;
  }
}