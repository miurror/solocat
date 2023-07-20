// Entity Types
export enum PointObjectType {
  Cat = "cat",
  Snake = "snake",
  Wave = "wave",
  Ring = "ring",
  Aroma = "aroma",
}

export enum PolygonObjectType {
  Normal = "normal",
  LifeUp = "lifeUp",
}


// Entity Styles
export enum PointShape {
  Circle,
  Arc,
  Cat,
}

export class PointStyle {
  shape: PointShape;
  fillColor: string;
  strokeColor: string;
  radius: number;
  constructor(shape: PointShape, fillColor: string, strokeColor: string, radius: number) {
    this.shape = shape;
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.radius = radius;
  }
}

export class PointStyleLibrary {
  static readonly Default = new PointStyle(PointShape.Arc, "transparent", "rgb(69,139,19)", 1/12);
  static readonly Vertex = new PointStyle(PointShape.Circle, "rgba(20,20,70,0.8)", "black", 1/12);
  static readonly OnEdge = new PointStyle(PointShape.Circle, "rgba(20,20,70,0.8)", "gray", 1/20);
  static readonly Internal = new PointStyle(PointShape.Circle, "gray", "gray", 1/20);
  static readonly Cat = new PointStyle(PointShape.Cat, "rgba(255, 150, 80, 0.8)", "black", 1/12);
  static readonly CatHappy = new PointStyle(PointShape.Cat, "rgba(0, 255, 100, 0.8)", "black", 1/12);
  static readonly CatDamaged = new PointStyle(PointShape.Cat, "red", "black", 1/12);
  static readonly CatOnEdge = new PointStyle(PointShape.Cat, "red", "black", 1/12);
  static readonly CatOnVertex = new PointStyle(PointShape.Cat, "red", "black", 1/12);
  static readonly CatDead = new PointStyle(PointShape.Cat, "black", "black", 1/12);
  static readonly Snake = new PointStyle(PointShape.Circle, "green", "black", 1/8);
  static readonly Wave = new PointStyle(PointShape.Circle, "blue", "black", 1/8);
  static readonly Ring = new PointStyle(PointShape.Circle, "yellow", "black", 1/12);

  static defaultStyle(type: PointObjectType){
    switch(type){
      case PointObjectType.Cat:
        return PointStyleLibrary.Cat;
      case PointObjectType.Ring:
        return PointStyleLibrary.Ring;
      case PointObjectType.Snake:
        return PointStyleLibrary.Snake;
      case PointObjectType.Wave:
        return PointStyleLibrary.Wave;
      default:
        return PointStyleLibrary.Default;
    }
  }
}

export class PolygonStyle {
  fillColor: string;
  strokeColor: string;
  constructor(fillColor: string, strokeColor: string) {
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
  }
}

export class PolygonStyleLibrary {
  static readonly Default = new PolygonStyle("rgba(220,220,220, 0.2)", "rgba(0,0,0,0.3)");
  static readonly LifeUp = new PolygonStyle("rgba(127,245,0,0.1)", "rgba(0,0,0,0.5)");
  static readonly PlayerDefault = new PolygonStyle("rgba(255,255,255,0.8)", "black");
  static readonly PlayerMatch = new PolygonStyle("yellow", "black");
  static readonly PlayerInclusion = new PolygonStyle("rgba(255,255,204,0.5)", "black");
  static readonly PlayerDead = new PolygonStyle("gray", "black");

  static defaultStyle(type: PolygonObjectType){
    switch(type){
      case PolygonObjectType.LifeUp:
        return PolygonStyleLibrary.LifeUp;
      default:
        return PolygonStyleLibrary.Default;
    }
  }
}