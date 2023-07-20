import { Global } from "@/game-constants";
import { PointObject, PointStyle, PolygonObject, PolygonStyle } from "../game-components/export";
import { PlayerController, PlayerEvent} from "./export";

export default class Player {
  private _hitPoint = Global.hitPointMax;
  private _highScore = 1;
  private _puzzleLevel = Global.puzzleLevelInitial;
  private _battleLevel = Global.battleLevelInitial;
  public currentStage = 1;
  public currentStageLevel = 1;
  public successStreak = 0;
  public dodgeNumber = 0;
  public ringBellsNumber = 0;
  public steps = 0;
  private _polygon!: PolygonObject | null;
  private _cat!: PointObject | null;
  public history: number[][][] = [];

  private readonly _controller: PlayerController = new PlayerController();

  constructor(polygon = new PolygonObject(), cat = new PointObject()){
    this.polygon = polygon;
    this.cat = cat;
    this.loadHighScore();
  }

  get hitPoint(){ return this._hitPoint; }
  set hitPoint(hitPoint: number){ this._hitPoint = hitPoint; }
  get highScore(){ return this._highScore; }
  set highScore(highScore: number){ this._highScore = highScore; }
  get puzzleLevel(){ return this._puzzleLevel; }
  set puzzleLevel(level: number){ this._puzzleLevel = level; }
  get battleLevel(){ return this._battleLevel; }
  set battleLevel(level: number){ this._battleLevel = level; }

  get controller(){ return this._controller; }
  get polygon(){ return this._polygon; }
  set polygon(polygon: PolygonObject | null){ this._polygon = polygon; }
  get cat(){ return this._cat; }
  set cat(cat: PointObject | null){ this._cat = cat; }

  savePolygon(){
    if(this.polygon){
      this.history.push(this.polygon.toArray());
    }
  }

  clearHistory(){
    this.history.length = 0;
  }


  undo(){
    if(this.polygon && this.history.length != 0){
      const array = this.history.pop();
      this.polygon.rebuild(array as number[][]);
    }
  }


  updatePolygonStyle(style: PolygonStyle){
    if(this.polygon){
      this.polygon.style = style;
      this.controller.emit(PlayerEvent.updateStyle);
    }
  }

  updateCatStyle(style: PointStyle){
    if(this.cat){
      this.cat.style = style;
    }
  }

  loadHighScore(){
    const highScoreData=localStorage.getItem("highScore");
    if(highScoreData){
      this.highScore = JSON.parse(highScoreData);
    }
  }

  saveHighScore(){
    localStorage.setItem("highScore", JSON.stringify(this.highScore));
  }

  resetHighScore(){
    localStorage.removeItem("highScore");
    this.highScore = this.currentStage;
  }
}