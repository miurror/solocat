import { Point, Polygon,
  generateRandomReflexivePolygon, generateRandomTerminalPolygon,
  PolygonManager, removeAll, Matrix, Vector } from "@/geometry/export";
import { Board, PointObject, PolygonObject, 
  PointObjectType, PolygonObjectType } from "@/game-components/export";
import { Player, PlayMode, StageType, PlayerEventListener, PlayerState } from "@/player/export";
import Renderer from "@/ui/renderer";
import { EventEmitter } from "events";
import { Global, tutorial } from "./game-constants";
import { PointObjectJson, PolygonObjectJson } from "./game-components/game-objects";
import BoardRenderer from "./ui/board-renderer/board-renderer";


export default class Game extends EventEmitter {
  public players : Player[] = [];
  public board : Board;
  public timer : NodeJS.Timer | null;
  private playerEventListeners: PlayerEventListener[];

  constructor(board = new Board()){
    super();
    this.board = board;
    this.playerEventListeners = [];
    this.timer = null;
  }


  addPlayer(player: Player, renderer: Renderer){
    this.players.push(player);   
    if(player.polygon && player.cat){
      this.board.polygons.push(player.polygon);
      this.board.items.push(player.cat);
      switch(player.controller.playMode){
        case PlayMode.Tutorial: {
          const targetPolygon = tutorial.read(player); 
          this.addPolygon(targetPolygon);
          break;
        }
        case PlayMode.Normal: 
          player.controller.stageType = StageType.Canonical;
          this.spawnReflexivePolygon(player.cat as Point);
          break;
        case PlayMode.Canonical: 
          player.controller.stageType = StageType.Canonical;
          this.spawnReflexivePolygon(player.cat as Point);
          break;
        case PlayMode.Terminal:
          player.controller.stageType = StageType.Terminal;
          this.spawnTerminalPolygon(player.cat as Point);
          break;
      }
    }
    const playerEventListener = new PlayerEventListener(player.controller, this, renderer);
    this.playerEventListeners.push(playerEventListener);
  }

  removePlayer(player: Player){
    player;
    // to be filled in.
  }

  // Board Manager
  addPolygon(polygon: PolygonObject){ 
    this.board.polygons.push(polygon); 
  }

  removePolygon(polygon: PolygonObject){
    this.board.polygons.splice(this.board.polygons.indexOf(polygon),1);
    // TODO: remove cat 
  }

  addItem(item: PointObject){ this.board.items.push(item); }

  removeItem(item: PointObject){
    this.board.items.splice(this.board.items.indexOf(item),1);
  }

  getItems(type: PointObjectType){
    return this.board.items.filter((item)=>(item.type === type));
  }

  getValidItems(polygon: PolygonObject, type: PointObjectType){
    return this.board.items.filter((item)=>(item.type === type) && (polygon.valid(item)));
  }

  getStrictValidItems(polygon: PolygonObject, type: PointObjectType){
    return this.board.items.filter((item)=>(item.type === type) && (polygon.strictValid(item)));
  }

  startTimer(player: Player, boardRenderer: BoardRenderer){
    // beat items
    this.stopTimer();
    this.timer = setInterval(
      ()=>{
        for (const item of player.controller.beatItems){
          boardRenderer.beatOnce(item);
        }
      },1500)
  }

  stopTimer(){
    if(this.timer){
      clearInterval(this.timer);
    }
  }

  // ToDo: change name and increase variety of items
  spawnRandomItem(player: Player, distanceMax = 5){
    let randomPoint: Point;
    do{
      randomPoint = randomPrimitiveLatticePoint(distanceMax);
      randomPoint.add(player.cat as Point);
    }while( 
      this.board.polygons.some( (polygon) => polygon.valid(randomPoint) )
    );
    if(Math.random() < Global.spawnRingProbability){
      const ring = PointObject.fromPoint(randomPoint, PointObjectType.Ring);
      this.addItem(ring);
    }  
    return randomPoint;
  }

  /**
   * spawn objects 
   */
  spawnPolygon(point: Point, maxComp: number, type: PolygonObjectType = PolygonObjectType.Normal, 
    callback: (maxComp: number) => Polygon): PolygonObject {
      let polygon: Polygon;
      // repeat until one gets a good polygon without any inclusion
      do{
        polygon = callback(maxComp);
        PolygonManager.translate(point.x, point.y, polygon);
      }while(
        (this.board.polygons) &&
          this.board.polygons.some(
            (polygon2) => Polygon.existsInclusion(polygon, polygon2)
          )
      ); 
      const polygonObject = PolygonObject.fromPolygon(polygon, type);
      this.addPolygon(polygonObject);  
      return polygonObject;
  }

  spawnReflexivePolygon(
    point: Point, type: PolygonObjectType = PolygonObjectType.Normal, maxComp = 1): PolygonObject{
      return this.spawnPolygon(point, maxComp, type, generateRandomReflexivePolygon);
  }

  spawnTerminalPolygon(
    point: Point, type: PolygonObjectType = PolygonObjectType.Normal, maxComp = 1): PolygonObject{
      return this.spawnPolygon(point, maxComp, type, generateRandomTerminalPolygon);
  }

  collectItemsInPolygon(polygon: Polygon){
    const items = [];
    for(const item of this.board.items){
      if(polygon.valid(item) && item.type !== PointObjectType.Cat){ 
        items.push(item);
      }
    }
    removeAll(this.board.items, items);
    return items;
  }

  // getItemAtPoint(point: Point){
  //   // let index = indexOfPoint(this.board.items, point);
  //   if(index != null){
  //     return this.board.items[index];
  //   }
  // }

  getPolygonsAtPoint(point: Point){
    const polygons = [];
    for (const polygon of this.board.polygons){
      if(polygon.valid(point)){
        polygons.push(polygon);
      }
    }
    return polygons;
  }

  savePlayData(player: Player, renderer: Renderer){
    const playData = new PlayData(player, this.board, renderer);
    localStorage.setItem("playData", JSON.stringify(playData));
  }

  resetPlayData(){
    localStorage.removeItem('playData');
  }

  loadPlayData(player: Player, renderer: Renderer){
    const playDataJSON = localStorage.getItem("playData");
    if(playDataJSON){
      const playData = JSON.parse(playDataJSON) as PlayData;
      console.log(playData.isLangJp);
      Global.isLangJp = playData.isLangJp;
      player.currentStage = playData.currentStage;
      player.controller.playMode = playData.playMode;
      player.controller.stageType = playData.stageType;
      player.controller.state = playData.state;
      player.history = playData.history;
      renderer.playerState = playData.state;
      this.board.items = [];
      if(playData.items){
        for (const itemJson of playData.items){
          const item = new PointObject(itemJson.x, itemJson.y, itemJson.type);
          this.board.items.push(item);
        }
      }
      player.cat = this.board.items[playData.playerCatIndex];
      this.board.polygons = [];
      if(playData.polygons){
        for (const poly of playData.polygons){
          const polygon = new PolygonObject(poly.vertices, poly.type);
          this.board.polygons.push(polygon);
        }
      }
      player.polygon = this.board.polygons[playData.playerPolygonIndex];
      const polygons = this.board.polygons.slice();
      polygons.splice(polygons.indexOf(player.polygon),1);
      player.controller.onBoardChange(player, polygons);
      if(playData.hitPoint>0){
        player.hitPoint = playData.hitPoint;
      }else{
        this.playerEventListeners[0].onNewCampaign(player);
      }
      player.successStreak = playData.successStreak;
      player.dodgeNumber = playData.dodgeNumber;
      player.ringBellsNumber = playData.ringBellNumber;
      player.steps = playData.steps;
      Global.achievementManager.fromDict(playData.achievementDict);
      renderer.boardRenderer.boardData.scaleUnit = playData.scaleUnit;
      renderer.boardRenderer.boardData.offsetMatrix = new Matrix(playData.offsetMatrix);
      renderer.boardRenderer.boardData.offsetVector = Vector.fromArray(playData.offsetVector);
    }
    if(player.polygon){
      const polygon = player.polygon;
      const snakes = this.getStrictValidItems(polygon, PointObjectType.Snake);
      const waves = this.getValidItems(polygon, PointObjectType.Wave);
      const beatItems = snakes.concat(waves);
      player.controller.beatItems = beatItems;
    }
    renderer.boardRenderer.updateBoard();
  }
}


function randomPrimitiveLatticePoint(n: number): Point {
  const distanceWeights: number[] = [];
  for (let i = 1; i <= n; i++) { distanceWeights.push(1 / i); }
  const sum = distanceWeights.reduce((a, b) => a + b, 0);

  function randomWithWeightedDistance(): number {
    const randomValue = Math.random() * sum;
    let currentSum = 0;
    for (let i = 0; i < distanceWeights.length; i++) {
      currentSum += distanceWeights[i];
      if (randomValue <= currentSum) {
        return i + 1;
      }
    }
    return 1;
  }

  const gcd = (x: number, y: number ): number => y === 0 ? x: gcd(y, x % y);
  let p: number, q: number;
  do {
    p = randomWithWeightedDistance() * (Math.random() > 0.5 ? 1 : -1);
    q = randomWithWeightedDistance() * (Math.random() > 0.5 ? 1 : -1);
  } while (gcd(p, q) !== 1);

  return new Point(p, q);
}

export class PlayData {
  public playMode: PlayMode;
  public stageType: StageType;
  public state: PlayerState;
  public hitPoint: number;
  public successStreak: number;
  public dodgeNumber: number;
  public ringBellNumber: number;
  public steps: number;
  public currentStage: number;
  public polygons: PolygonObjectJson[] = [];
  public playerPolygonIndex = 0;
  public playerCatIndex = 0;
  public items: PointObjectJson[] = [];
  public history: number[][][] = [];
  public scaleUnit: number;
  public offsetMatrix: number[][];
  public offsetVector: number[];
  public achievementDict = Global.achievementManager.toDict();
  public isLangJp: boolean;

  constructor(player: Player, board: Board, renderer: Renderer){
    this.isLangJp = Global.isLangJp;
    this.playMode = player.controller.playMode;
    this.stageType = player.controller.stageType;
    this.state = player.controller.state;
    if(this.state === PlayerState.CoolDown){
      this.state = PlayerState.Play;
    }
    this.hitPoint = player.hitPoint;
    this.successStreak = player.successStreak;
    this.dodgeNumber = player.dodgeNumber;
    this.ringBellNumber = player.ringBellsNumber;
    this.steps = player.steps;
    this.currentStage = player.currentStage;
    for (const poly of board.polygons){
      this.polygons.push(poly.toJSON());
    }
    for (const item of board.items){
      this.items.push(item.toJSON());
    }
    if(player.polygon){
      const polygon = player.polygon;
      this.playerPolygonIndex = board.polygons.findIndex(
        (poly) => Polygon.equal(poly, polygon));
    }
    if(player.cat){
      const cat = player.cat;
      this.playerCatIndex = board.items.findIndex(
        (item) => Point.equal(item, cat));
    }
    this.history = player.history;
    this.scaleUnit = renderer.boardRenderer.boardData.scaleUnit;
    this.offsetMatrix = renderer.boardRenderer.boardData.offsetMatrix.toArray();
    this.offsetVector = renderer.boardRenderer.boardData.offsetVector.toArray();
  }
}