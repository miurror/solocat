import { Vector, Point } from "@/geometry/export";
import { CanvasData, BoardScaleConstant, BoardData, ViewTransformCallbacks } from "../canvas-data";

export default class InputManager {
  private readonly _CLICK_POINT_SENSITIVITY = 0.45;
  private _dragStartPoint = new Vector();
  private _dragStartOffsetVector = this.boardData.offsetVector;
  private _dragPoint = new Vector();

  constructor(
    private canvasData: CanvasData,
    private boardScaleConstant: BoardScaleConstant, 
    private boardData: BoardData, 
    private viewTransformCallbacks: ViewTransformCallbacks,
    private updateBoard: () => void,
    private emitClickLatticePointEvent: (latticePoint: Point) => void,
    private emitRightClickEvent: () => void
  ){
    this.canvasData = canvasData;
    this.boardScaleConstant = boardScaleConstant;
    this.boardData = boardData;
    this.viewTransformCallbacks = viewTransformCallbacks;
    this.updateBoard = updateBoard;
    this.emitClickLatticePointEvent = emitClickLatticePointEvent;
    this.emitRightClickEvent = emitRightClickEvent;
  }

  get CLICK_POINT_SENSITIVITY(){ return this._CLICK_POINT_SENSITIVITY; }
  get dragStartPoint(){ return this._dragStartPoint; }
  set dragStartPoint(vector: Vector){this._dragStartPoint = vector; }
  get dragStartOffsetVector(){ return this._dragStartOffsetVector; }
  set dragStartOffsetVector(vector: Vector){this._dragStartOffsetVector = vector; }
  get dragPoint(){ return this._dragPoint; }
  set dragPoint(vector: Vector){this._dragPoint = vector; }

  onKeyPress(e: KeyboardEvent){
    if(e.key === 'a'){
      this.viewTransformCallbacks.shiftOffsetX(-1);
    }else if(e.key === 'd'){
      this.viewTransformCallbacks.shiftOffsetX(1);
    }else if(e.key === 'w'){
      this.viewTransformCallbacks.shiftOffsetY(1);
    }else if(e.key === 's'){
      this.viewTransformCallbacks.shiftOffsetY(-1);
    }else if(e.key === 'l'){
      this.viewTransformCallbacks.translateOffset(this.boardScaleConstant.scaleUnitDefault/this.boardData.scaleUnit,0);
    }else if(e.key === 'h'){
      this.viewTransformCallbacks.translateOffset(-this.boardScaleConstant.scaleUnitDefault/this.boardData.scaleUnit,0);
    }else if(e.key === 'k'){
      this.viewTransformCallbacks.translateOffset(0,this.boardScaleConstant.scaleUnitDefault/this.boardData.scaleUnit);
    }else if(e.key === 'j'){
      this.viewTransformCallbacks.translateOffset(0,-this.boardScaleConstant.scaleUnitDefault/this.boardData.scaleUnit);
    }else if(e.key === 'q'||e.key === 'r'){
      this.viewTransformCallbacks.resetOffset();
    }
  }

  onWheel(e: WheelEvent){
    this.viewTransformCallbacks.scaleUp(e.deltaY * (-0.05));
    this.updateBoard();
  }

  onClick(x: number, y: number){
    const clickPoint = this.boardCoord(x,y);
    clickPoint.sub(this.boardData.offsetVector)
    const latticePoint = clickPoint.clone().round();
    // check the distance to the closest lattice point
    if(Vector.sub(clickPoint, latticePoint).length() > this.CLICK_POINT_SENSITIVITY){ 
      return;
    }
    this.boardData.offsetMatrix.inverse().operate(latticePoint).round();
    // game logic is implemented in playerEventListener
    this.emitClickLatticePointEvent(latticePoint);
    this.updateBoard();
  }

  onRightClick(){
    this.emitRightClickEvent();
    this.updateBoard();
  }

  onDragStart(x: number,y: number){
    this.dragStartPoint = this.boardCoord(x,y) as Vector;
    this.dragStartOffsetVector = this.boardData.offsetVector.clone();
  }

  onDrag(x: number, y: number){
    this.dragPoint = this.boardCoord(x,y) as Vector;
    this.dragPoint.sub(this.dragStartPoint);
    this.boardData.offsetVector.copy(this.dragPoint.add(this.dragStartOffsetVector));
    this.updateBoard();
  }

  boardCoord(x: number, y: number){
    return new Point(
      (x-this.canvasData.width/2)/this.boardData.scaleUnit, 
      -(y-this.canvasData.height/2)/this.boardData.scaleUnit
    );
  }



}