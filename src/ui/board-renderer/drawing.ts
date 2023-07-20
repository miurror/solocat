import { Point, Polygon, PositionType } from "@/geometry/export";
import { PolygonObject, PointShape, PointStyle,
  PolygonStyle, PolygonObjectType, PointStyleLibrary, PolygonStyleLibrary, PointObject } from "@/game-components/export";
import { Player, StageType } from "@/player/export";




export default class DrawingManager {
  constructor(private ctx: CanvasRenderingContext2D){
    this.ctx = ctx;
  }

  backgroundColor(stageType: StageType): string {
    switch (stageType){
      case StageType.Canonical:
        return "rgba(220,255,255,1)";
      case StageType.Terminal:
        return "rgba(255,220,220,1)";
    }
  }

  getPointStyle(point: Point, player: Player): PointStyle {
    if (player.polygon) {
      const type = player.polygon.positionType(point);
      switch (type) {
        case PositionType.Vertex:
          return PointStyleLibrary.Vertex;
        case PositionType.OnEdge:
          return PointStyleLibrary.OnEdge;
        case PositionType.Internal:
          return PointStyleLibrary.Internal;
      }
    }
    return PointStyleLibrary.Default;
  }

  getPlayerPolygonStyle(polygon: PolygonObject): PolygonStyle {
    if (polygon && polygon.type === PolygonObjectType.Normal) {
      if (polygon.style === PolygonStyleLibrary.Default) {
        return PolygonStyleLibrary.PlayerDefault;
      } else {
        return polygon.style;
      }
    } else {
      return PolygonStyleLibrary.Default;
    }
  }

  drawPoint(point: Point, style: PointStyle, scaleUnit: number, viewCoord: (point: Point) => number[]) {
    const ctx = this.ctx;
    const radius = style.radius;
    ctx.beginPath();
    if (style.shape === PointShape.Arc) {
      ctx.arc(viewCoord(point)[0], viewCoord(point)[1] - scaleUnit / 12, // a little lower
        radius * scaleUnit, Math.PI * (1 / 2 - 0.2), Math.PI * (1 / 2 + 0.2), false);
      ctx.moveTo(viewCoord(point)[0], viewCoord(point)[1] - scaleUnit / 12);
      ctx.closePath();
    }  else if (style.shape === PointShape.Cat) {
      const x = viewCoord(point)[0];
      const y = viewCoord(point)[1];
      const r = radius * scaleUnit;
      
      // draw head (a circle)
      ctx.arc(x, y, r, 0, Math.PI * 2, true);

      // draw left ear (a triangle)
      ctx.moveTo(x - 3 * r / 4, y - 2 * r / 3);
      ctx.lineTo(x - r / 2, y - r * 1.3);
      ctx.lineTo(x - r / 7, y - r);
      
      // draw right ear (a triangle)
      ctx.moveTo(x + 3 * r / 4, y - 2 * r / 3);
      ctx.lineTo(x + r / 2, y - r * 1.3);
      ctx.lineTo(x + r / 7, y - r);
    } else {
      ctx.arc(viewCoord(point)[0], viewCoord(point)[1],
        radius * scaleUnit, 0, Math.PI * 2, true);
      ctx.closePath();
    }
    ctx.fillStyle = style.fillColor;
    ctx.strokeStyle = style.strokeColor;
    ctx.fill();
    ctx.stroke();
  }

  drawPolygon(polygon: Polygon, style: PolygonStyle, viewCoord: (point: Point) => number[]) {
    const ctx = this.ctx;
    const vertices = polygon.vertices();

    // make edges
    ctx.beginPath();
    const firstVertex = viewCoord(vertices[0]);
    ctx.moveTo(firstVertex[0], firstVertex[1]);
    for (let pi = 1; pi < vertices.length; pi++) {
      const vertex = viewCoord(vertices[pi]);
      ctx.lineTo(vertex[0], vertex[1]);
    }
    ctx.closePath();

    ctx.fillStyle = style.fillColor;
    ctx.strokeStyle = style.strokeColor;
    ctx.fill();
    ctx.stroke();
  }
}
