import { Matrix, Vector } from "@/geometry/export";
import { BoardData, BoardScaleConstant } from "../canvas-data";

export default class ViewTransformManager {
  constructor(
    private boardScaleConstant: BoardScaleConstant,
    private boardData: BoardData,
    private origin: Vector,
    private updateBoard: () => void,
  ){
    this.boardScaleConstant = boardScaleConstant;
    this.boardData = boardData;
    this.origin = origin;
    this.updateBoard = updateBoard;
  }

  translateOffset(x: number, y: number){
    const offsetVector = this.boardData.offsetVector;
    this.boardData.offsetVector.setCoordinate(offsetVector.x + x, offsetVector.y + y);
    // if (this.catLock && !memberQ(this.visiblePoints(), this.getCat())){
    //   this.setOffsetVector(offsetVector.x, offsetVector.y);
    // };
    this.updateBoard();
  }

  scaleUp(multiplier: number){
    this.boardData.scaleUnit += multiplier;
    this.boardData.scaleUnit = Math.max(this.boardData.scaleUnit, this.boardScaleConstant.scaleUnitMin);
    this.boardData.scaleUnit = Math.min(this.boardData.scaleUnit, this.boardScaleConstant.scaleUnitMax);
    this.updateBoard();
  }

  transformOffset(matrix: Matrix){
    // const offsetMatrix = this.boardData.offsetMatrix.clone();
    // const offsetVector = this.boardData.offsetVector.clone();
    this.boardData.offsetMatrix = Matrix.dot(matrix, this.boardData.offsetMatrix);
    matrix.operate(this.boardData.offsetVector);
    // if (this.catLock && !memberQ(this.visiblePoints(), this.getCat())){
    //   this.boardData.offsetMatrix = offsetMatrix;
    //   this.setOffsetVector(offsetVector.x, offsetVector.y);
    // };
  }

  shiftOffsetX(x: number){
    const matrix = new Matrix([[1,x],[0,1]]);
    this.transformOffset(matrix);
    this.updateBoard();
  }

  shiftOffsetY(y: number){
    const matrix = new Matrix([[1,0],[y,1]]);
    this.transformOffset(matrix);
    this.updateBoard();
  }

  resetOffset(){
    this.boardData.offsetMatrix = new Matrix();
    this.boardData.offsetVector = this.origin.clone();
    this.boardData.scaleUnit = this.boardScaleConstant.scaleUnitDefault;
    this.updateBoard();
  }
}