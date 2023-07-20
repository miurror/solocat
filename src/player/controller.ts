import { EventEmitter } from "events";
import { Global } from "@/game-constants";
import { Point, PolygonEvent, closestPoints, Polygon } from "@/geometry/export";
import { PolygonObject, PolygonStyleLibrary, PointStyle, PointStyleLibrary, PointObject} from "@/game-components/export"
import { Player, PlayerEvent, PlayMode, StageType, PlayerState } from "./export";
import { AudioSources, playAudio } from "@/ui/import-media";


export default class PlayerController extends EventEmitter {
  public playMode = Global.defaultPlayMode as PlayMode;
  private _stageType = StageType.Canonical;
  private _state = PlayerState.Play;
  public beatItems: PointObject[] = [];

  constructor(){ super(); }

  get state(){ return this._state; }
  set state(state: PlayerState){ this._state = state; }


  // operation
  makeMove(player: Player, point: Point){
    if(player.polygon === null){
      return;
    }
    if(player.polygon.isRenovatable(point)){
      player.savePolygon();
      player.steps++;
      const polygonEvent = player.polygon.renovate(point); 
      this.updateCat(player);
      if (polygonEvent !== PolygonEvent.NoChange){
        this.emit(polygonEvent.toString(), player, point); // reduction or expansion
      }
      this.updatePlayerState(player);
    }
  }

  onBoardChange(player: Player, polygons: Polygon[]): string{
    const polygon = player.polygon as Polygon;
    if(polygons.some((poly)=> Polygon.equal(poly, polygon))){
      player.updatePolygonStyle(PolygonStyleLibrary.PlayerMatch);
      return PlayerEvent.match;
    }else if(polygons.some((poly)=> Polygon.existsInclusion(poly, polygon))){
      player.updatePolygonStyle(PolygonStyleLibrary.PlayerInclusion);
      return PlayerEvent.inclusion;
    }else{
      player.updatePolygonStyle(PolygonStyleLibrary.Default);
      return PlayerEvent.noInclusion;
    }
  }
  
  setPolygon(player: Player, polygon: PolygonObject){
    player.polygon = polygon;
    this.updateCat(player);
  }

  get stageType(){ return this._stageType; }
  set stageType(stageType: StageType){ this._stageType = stageType; }

  updateCat(player: Player){
    if(player.polygon === null || player.cat === null){
      return;
    }
    if(!player.polygon.strictValid(player.cat)){
      const internalPoints = player.polygon.internalPoints();
      const edgePoints = player.polygon.edgePoints();
      const vertices = player.polygon.vertices();
      let closest; 
      if(internalPoints.length > 0){
        closest = closestPoints(internalPoints, player.cat);
      }else if (edgePoints.length > 0){
        this.emit(PlayerEvent.missed, player);
        closest = closestPoints(edgePoints, player.cat);
        player.controller.decreaseHP(player, 1);
        playAudio(AudioSources.hit);
      }else{
        this.emit(PlayerEvent.missed, player);
        closest = closestPoints(vertices, player.cat);
        player.successStreak = -1;
        player.controller.decreaseHP(player, 1);
        playAudio(AudioSources.hit);
      }
      const closestPoint = closest[Math.floor(Math.random() * closest.length)];
      player.cat.setCoordinate(closestPoint.x, closestPoint.y);
    }
  }

  applyTemporaryCatStyle(player: Player, style: PointStyle, 
    resultStyle: PointStyle = PointStyleLibrary.Cat){
    player.updateCatStyle(style);
    setTimeout(()=>{
      player.updateCatStyle(resultStyle);
      if(resultStyle === PointStyleLibrary.CatDead){
        player.updatePolygonStyle(PolygonStyleLibrary.PlayerDead);
      }
      this.emit(PlayerEvent.updateStyle, player);
    }, 500)
  }

  decreaseHP(player: Player, delta: number){
    player.hitPoint -= delta;
    Global.fontColorLife = ["Red", "Red"];
    setTimeout(()=>{
      Global.fontColorLife = Global.fontColorStage;
    }, 500);
    if(player.hitPoint > 0){
      this.applyTemporaryCatStyle(player, PointStyleLibrary.CatDamaged);
    }else{
      this.applyTemporaryCatStyle(player, PointStyleLibrary.CatDamaged, PointStyleLibrary.CatDead);
      this.state = PlayerState.CoolDown;
      setTimeout(()=>{
        this.emit(PlayerEvent.dead);
        playAudio(AudioSources.failure);
        setTimeout(()=>{
          this.state = PlayerState.ContinueWait;
        },200);
      }, 300);
    }

  }

  updatePlayerState(player: Player){
    player;
    // to be filled in
  }

  changeSelectedPolygon(player: Player, polygon: PolygonObject){
    player.polygon = polygon;
    // TODO: cat
  }
}