import Matrix from "./matrix";
import Vector from "./vector";
import Point from "./point";
import Polygon from "./polygon";

export const ORIGIN = new Vector();

/**
 * A utility class that provides static methods for converting polygons.
 */
export class PolygonManager {
  static translate<T extends Polygon>(x: number, y: number, polygon: T): T{
    for (const point of polygon.vertices()){
      point.setCoordinate(point.x + x, point.y + y);
    }
    return polygon;
  }
  static transform<T extends Polygon>(matrix: Matrix, polygon: T): T{
    for (const point of polygon.vertices()){
      matrix.operate(point);
    }
    return polygon;
  }
}


// vertices of reflexive polygons
export const ReflexiveData = [
  [[1,0], [0,1], [-1,-1]],
  [[1,0], [0,1], [-1,0], [0,-1]],
  [[1,0], [0,1], [-1,1], [0,-1]],
  [[1,1], [0,1], [-1,1], [0,-1]],
  [[1,0], [0,1], [-1,1], [-1,0], [0,-1]],
  [[1,1], [-1,1], [-1,0], [0,-1]],
  [[1,0], [0,1], [-1,1], [-1,0], [0,-1], [1,-1]],
  [[1,0], [1,1], [-1,1], [-1,0], [0,-1]],
  [[1,1], [-1,1], [-1,-1], [0,-1]],
  [[1,1], [-1,1], [-1,-2]],
  [[1,0], [1,1], [-1,1], [-1,-1], [0,-1]],
  [[1,1], [-1,1], [-1,-2], [0,-1]],
  [[1,-1], [1,1], [-1,1], [-1,-1]],
  [[1,0], [1,1], [-1,1], [-1,-2]],
  [[1,1], [-1,1], [-1,-3]],
  [[2,1], [-1,1], [-1,-2]]
];

// vertices of terminal polygons
export const TerminalData = [
  [[1,0], [0,1], [-1,-1]],
  [[1,0], [0,1], [-1,0], [0,-1]],
  [[1,0], [0,1], [-1,1], [0,-1]],
  [[1,0], [0,1], [-1,1], [-1,0], [0,-1]],
  [[1,0], [0,1], [-1,1], [-1,0], [0,-1], [1,-1]],
];


/**
 * generate random unimodular matrix 
 * such that the absolute values of its components is less than or equal to maxComp
 */
export function generateRandomUnimodularMatrix(maxComp: number): Matrix {
  let a: number, b: number, c: number, d: number, determinant: number;
  do {
    a = Math.floor(2 * Math.random() * maxComp + 1) - maxComp;
    b = Math.floor(2 * Math.random() * maxComp + 1) - maxComp;
    c = Math.floor(2 * Math.random() * maxComp + 1) - maxComp;
    d = Math.floor(2 * Math.random() * maxComp + 1) - maxComp;
    determinant = a * d - b * c;
  } while (determinant !== 1);
  return new Matrix([[a, b], [c, d]]);
}


export function generateRandomReflexivePolygon(maxComp: number): Polygon {
  const vertices = ReflexiveData[Math.floor(Math.random() * ReflexiveData.length)];
  const matrix = generateRandomUnimodularMatrix(maxComp);
  const polygon = new Polygon(vertices);
  return PolygonManager.transform(matrix, polygon);
}

export function generateRandomTerminalPolygon(maxComp: number): Polygon {
  const vertices = TerminalData[Math.floor(Math.random() * ReflexiveData.length)];
  const matrix = generateRandomUnimodularMatrix(maxComp);
  const polygon = new Polygon(vertices);
  return PolygonManager.transform(matrix, polygon);
}


export function removeAll<T extends Vector>(vectors: T[], vectors2: T[]): T[] {
  for (const vector of vectors2) {
    for (let vi = 0; vi < vectors.length; vi++) {
      if (vectors[vi].equal(vector)) {
        vectors.splice(vi, 1);
        break;
      }
    }
  }
  return vectors;
}

/**
 * wether a vector set includes a vector
 */
export function isMember<T extends Vector>(points: T[], point: T): boolean {
  return points.some((p) => p.equal(point));
}



// /**
//  * return the index if the set includes the point
//  * @param {Array} pts 
//  * @param {Vector2} point 
//  * @returns {Number}
//  */
// function indexOfPoint(pts, point){
//   for(let pi=0; pi<pts.length; pi++){
//     if(Vector2.equal(pts[pi], point)){
//       return pi;
//     }
//   }
//   return null;
// }

// /**
//  * return the closest point in a point set from the reference point
//  */
export function closestPoints(points: Point[], point: Point){
  let minDistance = Vector.sub(points[0], point).length();
  let closest = [points[0]];
  for (let pi = 1; pi < points.length; pi++){
    const distance = Vector.sub(points[pi], point).length();
    if(minDistance > distance){
      closest = [points[pi]];
      minDistance = distance;
    }else if (minDistance === distance){
      closest.push(points[pi]); 
    }
  } 
  return closest;
}


// /**
//  * union of point sets; pts \cup  pts2
//  */
// function union(pts, pts2){
//   let pts3 = [...pts];
//   for (let point of pts2){
//     if(!memberQ(pts3, point)){
//       pts3.push(point);
//     }
//   }
//   return pts3;
// }

// /**
//  * generate a random terminal or canonical polygon
//  */
// function generateRandomPolygon(terminalFlag, difficultyLevel){
//   let vertices = [];
//   if(terminalFlag){
//     vertices = terminal[Math.floor(Math.random()*terminal.length)];
//   }else{
//     vertices = reflexive[Math.floor(Math.random()*reflexive.length)];
//   }
//   let randomMat = generateRandomUnimodularMatrix(difficultyLevel);
//   let verticesApplied = [];
//   for (let pi=0; pi< vertices.length; pi++){
//     let vec = new Vector2();
//     vec = Vector2.operate(randomMat,vertices[pi]);
//     verticesApplied.push(vec);
//   }
//   return new Polygon(verticesApplied);
// }

