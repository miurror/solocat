import { Matrix, Vector, Point, Polygon, removeAll } from "@/geometry/export";
import { Board, PointObject } from "@/game-components/export";
import { Player, PlayerEvent, PlayerState } from "@/player/export";
import { CanvasData, BoardData, BOARD_SCALE_CONSTANT, ViewTransformCallbacks } from "../canvas-data";

import DrawingManager from "./drawing";
import InputManager from "./input";
import ViewTransformManager from "./view-transform";
import { Global } from "@/game-constants";

/**
 * This is the class responsible for rendering a board, including its polygons and items.
 * It takes a canvas element as input and has various methods for drawing different shapes and styles 
 * based on the current state of the board.
 * 
 */
export default class BoardRenderer {
  public board: Board;
  public player: Player;
  public ctx: CanvasRenderingContext2D;
  public beatInterval: NodeJS.Timer | null;
  public messageOn = false;
  public temporaryMessage: string[] = [];

  // canvas and board data
  private _canvasData!: CanvasData;
  private _boardScaleConstant = BOARD_SCALE_CONSTANT;
  private _boardData: BoardData = {
    scaleUnit: BOARD_SCALE_CONSTANT.scaleUnitDefault,
    offsetMatrix: new Matrix(),
    offsetVector: new Vector(),
  }


  private _viewTransformCallbacks!: ViewTransformCallbacks;


  // flags
  private _imageVisible = false;

  private drawingManager!: DrawingManager;
  private viewTransformManager!: ViewTransformManager;
  public inputManager!: InputManager;

  constructor(
    board: Board, 
    player: Player, 
    canvas: HTMLCanvasElement
  ){
    this.board = board;
    this.player = player;
    this.beatInterval = null;
    this.setCanvasData(canvas.width, canvas.height);
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.delegateMethods();
    this.updateBoard();
  }

  // getter and setter
  get canvasData(){ return this._canvasData; }
  set canvasData(canvasData: CanvasData){ this._canvasData = canvasData; }
  get boardScaleConstant(){ return this._boardScaleConstant; }
  get boardData(){ return this._boardData; }
  set boardData(boardData: BoardData){ this._boardData = boardData; }
  get viewTransformCallbacks(){ return this._viewTransformCallbacks; }
  set viewTransformCallbacks(callbacks: ViewTransformCallbacks){ this._viewTransformCallbacks = callbacks; }
  get imageVisible(){ return this._imageVisible; }
  set imageVisible(value: boolean){ this._imageVisible = value; }
  
  // set scaleUnit(unit: number){ this._scaleUnit = unit; }
  setCanvasData(canvasWidth: number, canvasHeight: number){
    const canvasData: CanvasData = {
      width: canvasWidth,
      height: canvasHeight
    }
    this.canvasData = canvasData;
  }


  // Drawing, ViewTransform, Input
  delegateMethods(){
    const origin = new Vector();
    if(this.player.cat){
      origin.copy(this.player.cat);
    }

    this.drawingManager = new DrawingManager(this.ctx);

    this.viewTransformManager = new ViewTransformManager( //this);
      this.boardScaleConstant,
      this.boardData,
      origin,
      () => this.updateBoard()
    );

    this.viewTransformCallbacks = {
      shiftOffsetX: (x) => this.viewTransformManager.shiftOffsetX(x),
      shiftOffsetY: (y) => this.viewTransformManager.shiftOffsetY(y),
      translateOffset: (x,y) => this.viewTransformManager.translateOffset(x,y),
      resetOffset: () => this.viewTransformManager.resetOffset(),
      scaleUp: (multiplier) => this.viewTransformManager.scaleUp(multiplier),
    };

    //// Warning: Circular reference. Use caution when accessing related properties. 
    this.inputManager = new InputManager( //this);
      this.canvasData,
      this.boardScaleConstant,
      this.boardData,
      this.viewTransformCallbacks,
      () => this.updateBoard(),
      (latticePoint) => this.player.controller.emit(PlayerEvent.clickLatticePoint, this.player, latticePoint),
      () => this.player.controller.emit(PlayerEvent.rightClick, this.player) 
    );
  } 

  /**
   * important
   */
  updateBoard(){
    this.drawBackground();
    this.drawPolygons();
    this.drawItems();
    this.drawLatticePoints();
    // const message = ["Canonical Polygons", "Terminal Polygons"];
    if(this.messageOn){
      for(const message of this.temporaryMessage){
        this.showMessage(message, "Green", [50, 240], "left", 'rgba(255, 255, 255, 0.7)', 'bold 30pt fontB');
      }
    }
    if(Global.isLangJp){
      const currentStageJp = this.player.currentStage === 1? "元" : this.player.currentStage;
      this.showMessage("にゃん暦 " + currentStageJp + "年 (最長 " + this.player.highScore + "年)", 
        Global.fontColorStage[this.player.controller.stageType],  [50, 60], 
        "left", 'rgba(255, 255, 255, 0.7)', 'bold 30pt fontB');
      this.showMessage("ライフ " + this.player.hitPoint,
        Global.fontColorLife[this.player.controller.stageType],  [50, 120], 
        "left", 'rgba(255, 255, 255, 0.7)', 'bold 30pt fontB');
      if(Global.clickMessageOn){
        this.showMessage("画面内をクリック！", "Blue", [50, 180], 
          "left", 'rgba(255, 255, 255, 0.7)', 'bold 30pt fontB');
      }
    }else{
      this.showMessage("Cat Era: " + this.player.currentStage + " (Best: " + this.player.highScore + ")",
        Global.fontColorStage[this.player.controller.stageType],  [50, 60], 
        "left", 'rgba(255, 255, 255, 0.7)', 'bold 30pt fontB');
      this.showMessage("Life: " + this.player.hitPoint,
        Global.fontColorLife[this.player.controller.stageType],  [50, 120], 
        "left", 'rgba(255, 255, 255, 0.7)', 'bold 30pt fontB');
      if(Global.clickMessageOn){
        this.showMessage("Click Anywhere!", "Blue", [50, 180], 
          "left", 'rgba(255, 255, 255, 0.7)', 'bold 30pt fontB');
      }
    }
  }

  /**
   * the main process of drawing is delegated to drawingManager.
   */
  drawBackground(){
    const ctx = this.ctx;
    const stageType = this.player.controller.stageType;
    this.ctx.fillStyle = this.drawingManager.backgroundColor(stageType);
    ctx.fillRect(0, 0, this.canvasData.width, this.canvasData.height);
  }

  drawPolygons(){
    for (const polygon of this.board.polygons){
      if(polygon === this.player.polygon){
        this.drawingManager.drawPolygon(
          polygon, 
          this.drawingManager.getPlayerPolygonStyle(polygon), 
          (point) => this.viewCoord(point)
        );
      }else{
        this.drawingManager.drawPolygon(
          polygon, 
          polygon.style,
          (point) => this.viewCoord(point)
        );
      }
    }
  }

  drawItems(){
    for (const item of this.board.items){
      this.drawingManager.drawPoint(
        item, 
        item.style,
        this.boardData.scaleUnit,
        (point) => this.viewCoord(point)
      );
    }
  }

  drawLatticePoints(){
    const visiblePoints = this.visiblePoints();
    for (const point of removeAll(visiblePoints, this.board.items)){
      this.drawingManager.drawPoint(
        point, 
        this.drawingManager.getPointStyle(point, this.player),
        this.boardData.scaleUnit,
        (point) => this.viewCoord(point)
      );
    }
  }

  /**
   * board coordinate into view coordinate on canvas
   */
  viewCoord(point: Point){
    const point2 = point.clone();
    this.boardData.offsetMatrix.operate(point2).add(this.boardData.offsetVector);
    return [ this.canvasData.width/2 + point2.x * this.boardData.scaleUnit,
      this.canvasData.height/2 - point2.y * this.boardData.scaleUnit];
  }

  /**
   * returns all lattice points visible in canvas
   */
  visiblePoints(): Point[] {
    const scaleNumX = this.canvasData.width/this.boardData.scaleUnit;
    const scaleNumY = this.canvasData.height/this.boardData.scaleUnit;
    const inverseMatrix = this.boardData.offsetMatrix.inverse();
    const offsetVector = this.boardData.offsetVector;
    const limitLB = new Point(-scaleNumX/2, -scaleNumY/2);
    const limitRB = new Point(scaleNumX/2, -scaleNumY/2);
    const limitRT = limitLB.clone().multiply(-1);
    const limitLT = limitRB.clone().multiply(-1);
    inverseMatrix.operate(limitLB.sub(offsetVector));
    inverseMatrix.operate(limitRB.sub(offsetVector));
    inverseMatrix.operate(limitRT.sub(offsetVector));
    inverseMatrix.operate(limitLT.sub(offsetVector));
    const visibleSquare =  new Polygon([limitLB, limitRB, limitRT, limitLT]);
    const visiblePoints = visibleSquare.validPoints();
    return visiblePoints;
  }


  showTemporaryMessage(messageList: string[]){
      this.messageOn = true;
      this.temporaryMessage = messageList;
    setTimeout(()=>{
      this.messageOn = false;
      this.updateBoard();
    }, 2000)
  }

  showMessage(message: string, color = 'rgb(130, 20, 50)', viewCoord = [50, 80], align = "left",
    backgroundColor = 'rgba(255, 255, 255, 0.7)', font = '30pt fontA'){
    const ctx = this.ctx; 

    if('fonts' in document){
      document.fonts.load(font).then(()=>{
        ctx.font = font;
      });
    }else{
        ctx.font = font;
    }
    ctx.font = font;
    const metrics = ctx.measureText(message);
    ctx.fillStyle = backgroundColor; 
    if (align == "left"){
      // ctx.fillRect(viewCoord[0]-5, viewCoord[1]+5, metrics.width + 10, -40);
      ctx.fillStyle = color;
      ctx.fillText(message, viewCoord[0], viewCoord[1]);
    }else if (align == "center"){
      ctx.fillRect(viewCoord[0]-5-metrics.width/2, viewCoord[1]+5+15, metrics.width + 10, -30);
      ctx.fillStyle = color;
      ctx.fillText(message, viewCoord[0]-metrics.width/2, viewCoord[1]+15);
    }else if (align == "right"){
      // ctx.fillRect(viewCoord[0]-5-metrics.width, viewCoord[1]+5+15, metrics.width + 10, -30);
      ctx.fillStyle = color;
      ctx.fillText(message, viewCoord[0]-metrics.width, viewCoord[1]);
    }
  }

  dodge(){
    if(this.player.cat){
      this.player.controller.state = PlayerState.CoolDown;
      this.player.dodgeNumber++;
      if(this.player.dodgeNumber >= 1000){
        Global.achievementManager.complete("thousandDodge", this);
      }else if(this.player.dodgeNumber >= 100){
        Global.achievementManager.complete("hundredDodge", this);
      }else if(this.player.dodgeNumber >= 30){
        Global.achievementManager.complete("thirtyDodge", this);
      }else if(this.player.dodgeNumber >= 10){
        Global.achievementManager.complete("tenDodge", this);
      }else if(this.player.dodgeNumber >= 1){
        Global.achievementManager.complete("oneDodge", this);
      }
      const cat = this.player.cat;
      const sign = Math.random()<1/2? 1 : -1;
      setTimeout(()=>{
        cat.x += 0.2 * sign;
        this.updateBoard();
        setTimeout(()=>{
          cat.x -= 0.2 * sign;
          this.updateBoard();
        }, 500)
      }, 200)
    }
  }

  async beatOnce(item: PointObject){
    const originalRadius = 1/8;
    item.style.radius = 1.2 * originalRadius;
    this.updateBoard();
    await new Promise(resolve => setTimeout(resolve, 300)); 
    item.style.radius = originalRadius;
    this.updateBoard();
  }
}

