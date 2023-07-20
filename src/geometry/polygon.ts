import Vector from "./vector";
import Point from "./point";
import * as MathUtils from "./math-utils";
import { PolygonEvent, PositionType } from "./constants";

type PolygonJson = {
  vertices: Point[];
  class: string;
}

/**
 * class of polygons (2-dimensional polytopes)
 */
export default class Polygon {
  protected _points!: Point[];

  constructor(points: Point[] | number[][] = [[1,0], [0,1], [-1,-1]]) { 
    this.rebuild(points);
  }

  rebuild(points: Point[] | number[][]): void {
    this._points = points.map(point => {
      return Array.isArray(point) ? new Point(point[0], point[1]) : point;
    });
    this._points = this.calcVertices();
  }

  /**
   * determine vertices by Gift wrapping algorithm.  It allows rational polytopes.
   */
  calcVertices(): Point[] { 
    const points = this._points;
    if(points.length <= 1){
      return points;
    }

    // set the lowest and left-most vertex as firstPoint (the base point)
    let firstPoint = points[0]; 
    points.forEach(
      point => {
        if (firstPoint.y > point.y || (firstPoint.y === point.y && firstPoint.x > point.x)){ 
          firstPoint = point; 
        }
      }
    );
    
    // compute the left-most vertex viewed from the base point (as nextPoint)
    function next(points: Point[], basePoint: Point) {
      let nextPoint = points[0];
      for (const point of points) {
        if (basePoint === nextPoint) {
          nextPoint = point;
        } else {
          const delta1 = Vector.sub(basePoint, nextPoint);
          const delta2 = Vector.sub(basePoint, point);
          const crossProduct =  delta1.x * delta2.y - delta2.x * delta1.y;
          const squareLength1 = delta1.squareLength();
          const squareLength2 = delta2.squareLength();
          if (crossProduct > 0 || (crossProduct === 0 && squareLength2 > squareLength1)) {
            nextPoint = point;
          }
        }
      }
      return nextPoint;
    }

    // list up all vertices by switching the base point
    const resultVertices: Point[] = [];
    let vertex = firstPoint;
    do {
      resultVertices.push(vertex);
      vertex = next(points, vertex);
    } while(firstPoint != vertex);
    return resultVertices;
  }

  vertices(): Point[] {
    return this._points;
  }

  /**
   * check the equality of polygons
   */
  static equal(polygon: Polygon, polygon2: Polygon): boolean{
    const vertices = polygon.vertices();  // already sorted
    const vertices2 = polygon2.vertices();  
    return (vertices.length === vertices2.length) &&
      vertices.every(
        (value, index) => Point.equal(value, vertices2[index])
      );
  }

  round(): void {
    for (const point of this._points){
      point.round();
    }
  }

  clone(): Polygon {
    const newVertices: Point[] = [];
    for (const point of this.vertices()){
      newVertices.push(point.clone());
    }
    return new Polygon(newVertices);
  }

  /**
   * determine the set of inequalities defining the polygon
   */
  inequalities(): [Vector, number][] {
    let inequalities: [Vector, number][] = [];
    const vertices = this.vertices();
    switch (vertices.length){
      case 1 :
        inequalities = [
          [new Vector(1, 0), vertices[0].x],
          [new Vector(-1, 0), -vertices[0].x],
          [new Vector(0, 1), vertices[0].y],
          [new Vector(0, -1), -vertices[0].y],
        ]
        break;
      case 2 : {
        let normal = new Vector();
        normal = (Vector.sub(vertices[0],vertices[1])).rightOrthogonalVector();
        normal.reduce();
        const coeff = Vector.dot(normal, vertices[0]);
        inequalities.push([normal, coeff]);
        const normal2 = Vector.multiply(-1, normal);
        const coeff2 = Vector.dot(normal2, vertices[1]);
        inequalities.push([normal2, coeff2]);
        const parallel = Vector.sub(vertices[0],vertices[1]);
        parallel.reduce();
        const coeff3 = Vector.dot(parallel, vertices[0]);
        inequalities.push([parallel, coeff3]);
        const parallel2 = Vector.multiply(-1, parallel);
        const coeff4 = Vector.dot(parallel2, vertices[1]);
        inequalities.push([parallel2, coeff4]);
        break;
      }
      default: 
        for (let i=0; i< vertices.length; i++){
          let normal = new Vector();
          (i != vertices.length -1)?
            normal = (Vector.sub(vertices[i], vertices[i+1])).rightOrthogonalVector(): 
            normal = (Vector.sub(vertices[i],vertices[0])).rightOrthogonalVector();
          normal.reduce();
          const coeff = Vector.dot(normal, vertices[i]);
          inequalities.push([normal, coeff]);
        }
        break;
    }
    return inequalities;
  }


  /**
   * polar dual polygon. necessary to include ORIGIN for a correct answer
   */
  dualize(): this {
    const inequalities = this.inequalities();
    const points: Point[] = [];
    for (const [normal, coeff] of inequalities){
      points.push(new Point(-1 * normal.x/coeff, -1 * normal.y/coeff));
    }
    this.rebuild(points);
    return this;
  }


  /**
   * whether the point is contained in this polygon
   */
  valid(point: Point): boolean {
    const inequalities = this.inequalities();
    return inequalities.every(
        (value) => Vector.dot(point, value[0]) <= value[1]
      );
  }

  /**
   * whether the point is an internal point in this polygon
   */
  strictValid(point: Point): boolean {
    const inequalities = this.inequalities();
    return inequalities.every(
        (value) => Vector.dot(point, value[0]) < value[1]
      );
  }

  /**
   *  the range of the smallest rectangle containing this polygon 
   */
  rectRange(): number[][] {
    const vertices = this.vertices();
    const xValues = vertices.map(v => v.x);
    const yValues = vertices.map(v => v.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    return [[xMin, xMax], [yMin, yMax]];
  }

  /**
   * all lattice points contained in this polygon
   */
  validPoints(): Point[] {
    const validPoints: Point[] = [];
    const rectRange = this.rectRange();
    for (let xi = Math.ceil(rectRange[0][0]); xi <= rectRange[0][1]; xi++){
      for (let yi = Math.ceil(rectRange[1][0]); yi <= rectRange[1][1]; yi++){
        const point = new Point(xi, yi);
        if (this.valid(point)){
          validPoints.push(point);
        }
      }
    }
    return validPoints;
  }



  /**
   * all internal lattice points contained in this polygon
   */
  internalPoints(): Point[] {
    const internalPoints: Point[] = [];
    const rectRange = this.rectRange();
    for (let xi = Math.ceil(rectRange[0][0]); xi < rectRange[0][1]; xi++){
      for (let yi = Math.ceil(rectRange[1][0]); yi < rectRange[1][1]; yi++){
        const point = new Point(xi, yi);
        if (this.strictValid(point)){
          internalPoints.push(point);
        }
      }
    }
    return internalPoints;
  }

  /**
   * all lattice points contained in the relative interior of an edge
   */
  edgePoints(): Point[] {
    const validPoints = this.validPoints();
    const vertices = this.vertices();
    const internalPoints = this.internalPoints();
    return MathUtils.removeAll(MathUtils.removeAll(validPoints, vertices), internalPoints);
  }
  
  /**
   * whether the polygon is contained in this polygon
   */
  includes(polygon: Polygon): boolean {
    const vertices = polygon.vertices();
    return vertices.every((point) => this.valid(point));
  }


  /**
   * whether there exists an inclusion relation between poly and poly2
   */
  static existsInclusion(polygon : Polygon, polygon2: Polygon): boolean{
    return (polygon.includes(polygon2)||polygon2.includes(polygon));
  }


  /**
   * Returns the type of the position of the given point relative to this polygon
   */
  positionType(point: Point): PositionType {
    if(this.vertices().some((vertex) => vertex.equal(point))){
      return PositionType.Vertex;
    }else if(this.strictValid(point)){
      return PositionType.Internal; 
    }else if(this.valid(point)){
      return PositionType.OnEdge;
    }else{
      return PositionType.Other;
    }
  }

  /**
   * Returns whether the given point can be renovated by adding or removing a vertex.
   */
  isRenovatable(point: Point): boolean {
    const positionType = this.positionType(point);
    return positionType === PositionType.Vertex || positionType === PositionType.Other;
  }
  
  /**
   * Adds or removes a vertex to renovate the polygon, and returns the type of renovation.
   * Note: the latter produces a lattice polygon.
   */
  renovate(point: Point): PolygonEvent{ 
    const positionType = this.positionType(point);
    const vertices = this.vertices();
    if(positionType === PositionType.Vertex && vertices.length !== 1){ // remove
      const validPoints = this.validPoints().filter((p)=> !p.equal(point)); 
      this.rebuild(validPoints);
      return PolygonEvent.Reduction;
    }else if(positionType === PositionType.Other){ // add
      vertices.push(point); 
      this.rebuild(vertices);
      return PolygonEvent.Expansion;
    }else{
      return PolygonEvent.NoChange;
    }
  }

  /**
   * whether there exists at least one internal lattice point
   */
  isLatticePolygon(): boolean {
    return this.vertices().every((point)  => point.isLatticePoint());
  }


  isIpLatticePolygon(): boolean{
    return this.isLatticePolygon() && this.internalPoints().length >= 1;
  }

  /**
   * whether a lattice polygon is a canonical (i.e., reflexive) polygon
   */
  isCanonicalPolygon(): boolean {
    return this.isLatticePolygon() && this.internalPoints().length === 1;
  }
  isReflexivePolygon(): boolean {
    return this.isLatticePolygon() && this.internalPoints().length === 1;
  }

  /**
   * whether a lattice polygon is a terminal polygon
   */
  isTerminalPolygon(): boolean {
    return this.isCanonicalPolygon() && 
      this.validPoints().length === this.vertices().length + 1
  }

  toArray(): number[][] {
    const array = [];
    for (const point of this.vertices()){
      array.push(point.toArray());
    }
    return array;
  }

  // toJSON(): PolygonJson {
  //   return {
  //     "vertices": this.vertices(),
  //     "class": "Polygon",
  //   };
  // }
}


// /**
//  * estimate a difficulty to connect two polygons, 
//  * essentially based on the number of internal points in the union of two polygons
//  * @param {Polygon} poly 
//  * @param {Polygon} poly2 
//  * @returns {Number}
//  */
// function estimateDifficulty(poly, poly2){
//   let vertices = poly.vertices();
//   let vertices2 = poly2.vertices(); 
//   let vertices3 = vertices.concat(vertices2);
//   let unionPoly = new Polygon(vertices3);
//   let ipnum = (unionPoly.internalPoints()).length;
//   let threshold = 1;
//   let diff = 1;
//   let ei = 0;
//   while (ipnum > threshold * (2 ** ei)){
//     ei++;
//     diff++;
//   }
//   return diff;
// }
// export {Polygon, reflexive, terminal, memberQ, indexOfPoint, closestPoints, difference, union, generateRandomPolygon, estimateDifficulty};


// // run mmp
// function mmp(poly){
//   let answer = [poly];
//   let tempPoly = poly;
//   while(tempPoly.validPoints().length>5){
//     let vers = shuffle(tempPoly.vertices());
//     let validPoints = tempPoly.validPoints();
//     let validPoints2 = [];
//     let ii=0;
//     let vert = vers[ii];
//     for (let j=0; j< validPoints.length; j++){
//       if(!Vector2.equal(validPoints[j], vert)){
//         validPoints2.push(validPoints[j]);
//       }
//     }
//     let tempPoly2 = new Polygon(validPoints2);
//     while(!tempPoly2.ipQ()){
//       // if (ii == vers.length-1){
//       //   console.log("error");
//       //   console.log(tempPoly);
//       //   console.log(tempPoly2);
//       //   tempPoly2 = poly2;
//       // }else{
//         validPoints2 = [];
//         ii++;
//         vert = vers[ii];
//         for (let pj=0; pj< validPoints.length; pj++){
//           if(!(Vector2.equal(validPoints[pj], vert))){
//             validPoints2.push(validPoints[pj]);
//           }
//         }
//         tempPoly2 = new Polygon(validPoints2);
//       // }
//     }
//     tempPoly = tempPoly2;
//     answer.push(tempPoly);
//   }
//   return answer;
// }
// // let ans = mmp(poly);
// // let ans2 = mmp(poly2);
// // console.log(ans);
// // console.log(ans2);

// // let minimal = ans[ans.length-1];
// // let minimal2 = ans2[ans2.length-1];

// // console.log(minimal);
// // console.log(minimal2);