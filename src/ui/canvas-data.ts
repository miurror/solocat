import { Matrix, Vector } from "../geometry/export";

export interface CanvasData {
  width: number, 
  height: number
}

export interface BoardScaleConstant {
  scaleUnitDefault: number, 
  scaleUnitMax: number,
  scaleUnitMin: number,
}

export const BOARD_SCALE_CONSTANT: BoardScaleConstant = {
  scaleUnitDefault: 150, 
  scaleUnitMax: 300 ,
  scaleUnitMin: 20,
}

export interface BoardData {
  scaleUnit: number,
  offsetMatrix: Matrix,
  offsetVector: Vector,
}

export interface ViewTransformCallbacks {
  shiftOffsetX: (deltaX: number) => void,
  shiftOffsetY: (deltaY: number) => void,
  translateOffset: (deltaX: number, deltaY: number) => void,
  resetOffset: () => void,
  scaleUp: (multiplier: number) => void,
}
