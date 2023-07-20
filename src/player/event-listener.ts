import { Point, Polygon, PolygonEvent, removeAll } from "@/geometry/export";
import { Board, PointObject, PointObjectType, PointStyleLibrary, PolygonObject, PolygonObjectType, PolygonStyleLibrary } from "@/game-components/export"
import Game from "@/game";
import { Player, PlayerController, PlayerEvent, PlayMode, StageType, PlayerState } from "./export";
import BoardRenderer from "@/ui/board-renderer/board-renderer";
import Renderer from "@/ui/renderer";
import { AudioSources, playAudio } from "@/ui/import-media";
import { Global, tutorial } from "@/game-constants";

/**
 * Gameクラスとの循環参照の管理に気を付ける
 * 使用しているプロパティ
 *  - game.board.polygons
 *  - game.removePolygons
 *  - game.spawnReflexivePolygon
 */
export default class PlayerEventListener {
  private boardRenderer: BoardRenderer;
  private ableToClickLatticePoint = true;
  private board: Board;

  constructor(
    private controller: PlayerController, 
    private game: Game,  // observer
    private renderer: Renderer // observer
  ){
    this.renderer = renderer;
    this.boardRenderer = renderer.boardRenderer;
    this.boardRenderer.updateBoard();
    this.board = this.game.board;
    this.controller.on(PlayerEvent.click, (player) => this.onClick(player));
    this.controller.on(PlayerEvent.rightClick, (player) => this.onRightClick(player));
    this.controller.on(PlayerEvent.clickLatticePoint, (player, point) => this.onClickLatticePoint(player, point));
    this.controller.on(PlayerEvent.match, (player, event)=> this.onMatch(player, event));
    this.controller.on(PlayerEvent.missed, (player)=> this.onMissed(player));
    // this.controller.on(PlayerEvent.inclusion, (player) => this.onInclusion(player));
    // this.controller.on(PlayerEvent.noInclusion, (player) => this.onNoInclusion(player));
    this.controller.on(PlayerEvent.dead, () => this.onDead());
    this.controller.on(PlayerEvent.newStage, (player)=> this.onNewStage(player));
    this.controller.on(PlayerEvent.updateStyle, () => this.boardRenderer.updateBoard());
    this.controller.on(PolygonEvent.Expansion, (player) => this.onExpansion(player));
    this.controller.on(PolygonEvent.Reduction, (player) => this.onReduction(player));
    // this.controller.on(PlayerEvent.startStage, () => this.updateBoard());
    // this.controller.on(PlayerEvent.switchPolygon, () => this.updateBoard());
  }

  onClick(player: Player){
    this.ableToClickLatticePoint = true;
    switch(this.controller.state){
      case PlayerState.CoolDown:
        this.ableToClickLatticePoint = false;
        break;
      case PlayerState.MatchWait:
        Global.clickMessageOn = false;
        player.updatePolygonStyle(PolygonStyleLibrary.Default);
        this.controller.emit(PlayerEvent.newStage, player);
        this.controller.state = PlayerState.Play;
        this.renderer.playerState = PlayerState.Play;
        this.game.savePlayData(player, this.renderer);
        this.game.startTimer(player, this.boardRenderer);
        this.ableToClickLatticePoint = false;
        break;
      case PlayerState.ContinueWait:
        Global.clickMessageOn = false;
        this.ableToClickLatticePoint = false;
        this.boardRenderer.viewTransformCallbacks.resetOffset();
        this.onNewCampaign(player);
        this.boardRenderer.updateBoard();
        // reset game
        break;
      case PlayerState.DocumentView:
        this.boardRenderer.updateBoard();
        this.controller.state = this.renderer.playerState;
        this.ableToClickLatticePoint = false;
        break;
    }
  }

  onRightClick(player: Player){
    switch(this.controller.state){
      case PlayerState.Play:
        player.undo();
        this.boardRenderer.updateBoard();
        if(player.polygon){
          const polygons = this.board.polygons.slice();
          polygons.splice(polygons.indexOf(player.polygon),1);
          this.controller.onBoardChange(player, polygons);
        }
        this.controller.updateCat(player);
        break;
      case PlayerState.Battle:
        if(player.polygon){
          const snakes = this.game.getStrictValidItems(player.polygon, PointObjectType.Snake);
          const waves = this.game.getValidItems(player.polygon, PointObjectType.Wave);
          
          while(this.controller.state === PlayerState.Battle && snakes.length > 0){
            this.board.items.splice(this.board.items.indexOf(snakes[0]),1);
            snakes.splice(0,1);
            player.controller.decreaseHP(player, 1);
            playAudio(AudioSources.punch);
          }
          while(this.controller.state === PlayerState.Battle && waves.length > 0){
            this.board.items.splice(this.board.items.indexOf(waves[0]),1);
            waves.splice(0,1);
            player.controller.decreaseHP(player, 1);
            playAudio(AudioSources.wave);
          }
          if (player.hitPoint > 0 && snakes.length + waves.length === 0){
            this.controller.state = PlayerState.Play;
            player.undo();
            this.boardRenderer.updateBoard();
            if(player.polygon){
              const polygons = this.board.polygons.slice();
              polygons.splice(polygons.indexOf(player.polygon),1);
              this.controller.onBoardChange(player, polygons);
            }
          }
        }
        this.controller.updateCat(player);
        break;
    }
    this.game.savePlayData(player, this.renderer);
  }

  onClickLatticePoint(player: Player, point: Point){
    if(!this.ableToClickLatticePoint){
      this.ableToClickLatticePoint = true;
      return;
    }
    if(player.polygon){
      const polygon = player.polygon;
      switch(this.controller.state){
        case PlayerState.CoolDown:
          this.ableToClickLatticePoint = false;
          break;
        case PlayerState.Play:
          if(player.cat && Point.equal(player.cat,point)){
            playAudio(AudioSources.cat);
          }
          this.controller.makeMove(player, point);
          break;
        case PlayerState.Battle: {
          if(player.cat && Point.equal(player.cat,point)){
            playAudio(AudioSources.cat);
          }
          const snakes = this.game.getStrictValidItems(polygon, PointObjectType.Snake);
          const waves = this.game.getValidItems(polygon, PointObjectType.Wave);
          for(const item of snakes){
            if(Point.equal(item, point)){
              this.board.items.splice(this.board.items.indexOf(item),1);
              snakes.splice(snakes.indexOf(item),1);
              if (Math.random() < Global.noDamageProbability){
                this.boardRenderer.dodge();
                this.controller.state = PlayerState.CoolDown;
                playAudio(AudioSources.swish);
              }else{
                player.controller.decreaseHP(player, 1);
                playAudio(AudioSources.punch);
              }
            }
          }
          for(const item of waves){
            if(Point.equal(item, point)){
              this.board.items.splice(this.board.items.indexOf(item),1);
              waves.splice(waves.indexOf(item),1);
              if (Math.random() < Global.noDamageProbability){
                this.boardRenderer.dodge();
                this.controller.state = PlayerState.CoolDown;
                playAudio(AudioSources.swish);
              }else{
                player.controller.decreaseHP(player, 1);
                playAudio(AudioSources.wave);
              }
            }
          }
          if (player.hitPoint > 0 && snakes.length + waves.length === 0){
            if(this.controller.state === PlayerState.CoolDown){
              setTimeout(()=>{
                this.controller.state = PlayerState.Play;
              }, 700)
            }else{
              this.controller.state = PlayerState.Play;
            }
          }else if (player.hitPoint > 0){
            if(this.controller.state === PlayerState.CoolDown){
              setTimeout(()=>{
                this.controller.state = PlayerState.Battle;
              }, 700)
            }
          }else{
            if(this.controller.state === PlayerState.CoolDown){
              setTimeout(()=>{
                this.controller.state = PlayerState.ContinueWait;
              }, 700)
            }
          }
          break;
        }
      }
    }else{
      player.polygon = new PolygonObject([point]);
      this.game.addPolygon(player.polygon);
    }
    this.game.savePlayData(player, this.renderer);
  }

  onReductionOrExpansion(player: Player, polygonEvent: PolygonEvent){
    if(player.polygon){
      // internalPoints
      const internalPoints = player.polygon.internalPoints();
      removeAll(internalPoints, this.game.board.items);

      // targetPolygons
      const targetPolygons = this.board.polygons.filter(polygon => polygon !== player.polygon);

      // effect of rings
      const items = this.game.collectItemsInPolygon(player.polygon);
      if(items.some(item => item.type === PointObjectType.Ring)){
        playAudio(AudioSources.ring);
        player.ringBellsNumber++;
        if(player.ringBellsNumber >= 1000){
          Global.achievementManager.complete("thousandBell", this.boardRenderer);
        }else if(player.ringBellsNumber >= 100){
          Global.achievementManager.complete("hundredBell", this.boardRenderer);
        }else if(player.ringBellsNumber >= 30){
          Global.achievementManager.complete("thirtyBell", this.boardRenderer);
        }else if(player.ringBellsNumber >= 10){
          Global.achievementManager.complete("tenBell", this.boardRenderer);
        }else if(player.ringBellsNumber >= 1){
          Global.achievementManager.complete("oneBell", this.boardRenderer);
        }
        setTimeout(()=>{
          for (const polygon of targetPolygons){
            polygon.type = PolygonObjectType.LifeUp;
            polygon.style = PolygonStyleLibrary.LifeUp;
          }
          this.boardRenderer.updateBoard();
        }, 200);
      }

      // event =  match, inclusion, or noInclusion
      const event = this.controller.onBoardChange(player, targetPolygons);
      if(event === PlayerEvent.match){
        player.controller.emit(PlayerEvent.match, player, polygonEvent);
        return PlayerEvent.match;
      }

      // if there are additional internal points, the battle mode starts
      if(internalPoints){
        this.controller.emit(PlayerEvent.intrusion, player);
        for(const point of internalPoints){
          this.game.board.items.push(new PointObject(point.x,point.y,PointObjectType.Snake));
          player.successStreak = -1;
          this.controller.emit(PlayerEvent.missed, player);
          this.controller.state = PlayerState.Battle;
          playAudio(AudioSources.broken);
        }
      }
      
      // if there are edge points in terminal mode, battle starts
      if(this.controller.stageType === StageType.Terminal){
        const edgePoints = player.polygon.edgePoints();
        removeAll(edgePoints, this.game.board.items);
        if(edgePoints){
          for(const point of edgePoints){
            this.game.board.items.push(new PointObject(point.x,point.y,PointObjectType.Wave));
            player.successStreak = -1;
            this.controller.emit(PlayerEvent.missed, player);
            this.controller.state = PlayerState.Battle;
          }
        }
      }
    }
  }


  onReduction(player: Player){
    const event = this.onReductionOrExpansion(player, PolygonEvent.Reduction);
    if(event !== PlayerEvent.match){
      playAudio(AudioSources.reduction);
    }
  }

  onExpansion(player: Player){
    const event = this.onReductionOrExpansion(player, PolygonEvent.Expansion);
    if(event !== PlayerEvent.match){
      playAudio(AudioSources.expansion);
    }
  }

  onMatch(player: Player, polygonEvent: PolygonEvent){
    player.updatePolygonStyle(PolygonStyleLibrary.PlayerMatch);
    player.controller.applyTemporaryCatStyle(player, PointStyleLibrary.CatHappy);
    player.successStreak += 1;
    if(player.steps <= 2){
      Global.achievementManager.complete("twoStep", this.boardRenderer);
    }
    if(player.steps <= 5){
      Global.achievementManager.complete("fiveStep", this.boardRenderer);
    }
    if(player.steps <= 10){
      Global.achievementManager.complete("tenStep", this.boardRenderer);
    }
    player.steps = 0;
    this.controller.state = PlayerState.MatchWait;    
    const polygon = player.polygon;
    if(polygon){
      for(const poly of this.game.board.polygons){
        if(poly !== polygon && Polygon.equal(poly, polygon)){
          if(poly.type === PolygonObjectType.LifeUp){
            playAudio(AudioSources.lifeUp);
            player.hitPoint++;
            if(player.hitPoint >= 100){
              Global.achievementManager.complete("hundredLifeUp", this.boardRenderer);
            }else if(player.hitPoint >= 30){
              Global.achievementManager.complete("thirtyLifeUp", this.boardRenderer);
            }else if(player.hitPoint >= 10){
              Global.achievementManager.complete("tenLifeUp", this.boardRenderer);
            }else{
              Global.achievementManager.complete("oneLifeUp", this.boardRenderer);
            }

            Global.fontColorLife = ["Green", "Green"];
            setTimeout(()=>{
              Global.fontColorLife = Global.fontColorStage;
            }, 500);
          }else if(polygonEvent === PolygonEvent.Reduction){
            playAudio(AudioSources.successReduction);
          }else if(polygonEvent === PolygonEvent.Expansion){
            playAudio(AudioSources.successExpansion);
          }
          poly.copyTypeAndStyle(polygon);
          this.game.removePolygon(polygon);
          this.controller.setPolygon(player, poly);
        }
      }
    }
    this.game.stopTimer();
    Global.clickMessageOn = true;
    this.boardRenderer.updateBoard();
    this.game.savePlayData(player, this.renderer);
  }

  onMissed(player: Player){
    const targetPolygons = this.board.polygons.filter(polygon => polygon !== player.polygon);
    player.steps += 100;
    setTimeout(()=>{
      for (const polygon of targetPolygons){
        polygon.type = PolygonObjectType.Normal;
        polygon.style = PolygonStyleLibrary.Default;
      }
      this.boardRenderer.updateBoard();
    }, 200);
    if(player.polygon){
      const polygon = player.polygon;
      const snakes = this.game.getStrictValidItems(polygon, PointObjectType.Snake);
      const waves = this.game.getValidItems(polygon, PointObjectType.Wave);
      const beatItems = snakes.concat(waves);
      player.controller.beatItems = beatItems;
    }
  }

  onDead(){
    this.game.stopTimer();
    Global.clickMessageOn = true;
  }

  onNewCampaign(player: Player){
    player.currentStage = 1;
    player.successStreak = 0;
    player.hitPoint = Global.hitPointMax;
    player.clearHistory();
    for(const poly of this.game.board.polygons){
      if(poly !== player.polygon){
        // ToDo: 近くのものだけ消す
        this.game.removePolygon(poly);
      }
    }
    // remove rings
    const rings = this.board.items.filter(item => item.type === PointObjectType.Ring);
    removeAll(this.board.items, rings);
    this.game.startTimer(player, this.boardRenderer);

    if(player.polygon && player.cat){
      const newPoly = new PolygonObject();
      const newCat = new PointObject();
      player.polygon.rebuild(newPoly.vertices());
      player.polygon.copyTypeAndStyle(newPoly);
      player.cat.copy(newCat);
      player.cat.copyTypeAndStyle(newCat);
      this.board.items = this.board.items.filter(item => item.type !== PointObjectType.Snake);
      this.board.items = this.board.items.filter(item => item.type !== PointObjectType.Wave);
    }
    switch(this.controller.playMode){
      case PlayMode.Tutorial: {
        tutorial.reset(player);
        const targetPolygon = tutorial.read(player); 
        this.game.addPolygon(targetPolygon);
        break;
      }
      case PlayMode.Normal: 
        if(player.polygon){
          if (Math.random() < Global.terminalModeProbability && player.polygon.isTerminalPolygon()){
            player.controller.stageType = StageType.Terminal;
            this.game.spawnTerminalPolygon(player.cat as Point);
          }else{
            player.controller.stageType = StageType.Canonical;
            this.game.spawnReflexivePolygon(player.cat as Point);
          }
          this.game.spawnRandomItem(player);
        }
        break;
      case PlayMode.Canonical: 
        this.controller.stageType = StageType.Canonical;
        this.game.spawnReflexivePolygon(player.cat as Point);
        this.game.spawnRandomItem(player);
        break;
      case PlayMode.Terminal:
        this.controller.stageType = StageType.Terminal;
        this.game.spawnTerminalPolygon(player.cat as Point);
        this.game.spawnRandomItem(player);
        break;
      }
      this.controller.state = PlayerState.Play;
      this.renderer.playerState = PlayerState.Play;
      this.game.savePlayData(player, this.renderer);
  }

  onNewStage(player: Player){
    player.currentStage++;
    if(player.highScore < player.currentStage){
      player.highScore = player.currentStage;
      player.saveHighScore();
    }
    if(player.currentStage >= 1000){
      Global.achievementManager.complete("thousandYear", this.boardRenderer);
    }else if(player.currentStage >= 100){
      Global.achievementManager.complete("hundredYear", this.boardRenderer);
    }else if(player.currentStage >= 30){
      Global.achievementManager.complete("thirtyYear", this.boardRenderer);
    }else if(player.currentStage >= 10){
      Global.achievementManager.complete("tenYear", this.boardRenderer);
    }
    if(player.successStreak >= 1000){
      Global.achievementManager.complete("thousandPerfect", this.boardRenderer);
    }else if(player.successStreak >= 100){
      Global.achievementManager.complete("hundredPerfect", this.boardRenderer);
    }else if(player.successStreak >= 30){
      Global.achievementManager.complete("thirtyPerfect", this.boardRenderer);
    }else if(player.successStreak >= 10){
      Global.achievementManager.complete("tenPerfect", this.boardRenderer);
    }

    // difficulty calc.  need to revise
    if (player.successStreak % (50 + player.puzzleLevel) === 0){
      player.currentStageLevel = 1;
      if (player.successStreak > 1){
        player.puzzleLevel ++;
      }
    }else if (player.successStreak % 10 === 0){
      player.currentStageLevel = Math.min(player.currentStageLevel + 1, 4);
    }
    const maxComp = player.currentStageLevel;

    // remove rings
    const rings = this.board.items.filter(item => item.type === PointObjectType.Ring);
    removeAll(this.board.items, rings);

    // console.log(player.successStreak + ", " + maxComp);
    switch(this.controller.playMode){
      case PlayMode.Tutorial: {
        const targetPolygon = tutorial.read(player); 
        this.game.addPolygon(targetPolygon);
        break;
      }
      case PlayMode.Normal: 
        if(player.polygon){
          if (Math.random() < Global.terminalModeProbability && player.polygon.isTerminalPolygon()){
            player.controller.stageType = StageType.Terminal;
            if (Math.random() < Global.lifeUpProbability){
              this.game.spawnTerminalPolygon(player.cat as Point, PolygonObjectType.LifeUp, maxComp);
            }else{
              this.game.spawnTerminalPolygon(player.cat as Point, PolygonObjectType.Normal, maxComp);
            }
          }else{
            player.controller.stageType = StageType.Canonical;
            if (Math.random() < Global.lifeUpProbability){
              this.game.spawnReflexivePolygon(player.cat as Point, PolygonObjectType.LifeUp, maxComp);
            }else{
              this.game.spawnReflexivePolygon(player.cat as Point, PolygonObjectType.Normal, maxComp);
            }
          }
          this.game.spawnRandomItem(player);
        }
        break;
      case PlayMode.Canonical: 
        this.controller.stageType = StageType.Canonical;
        this.game.spawnReflexivePolygon(player.cat as Point, PolygonObjectType.Normal, maxComp);
        this.game.spawnRandomItem(player);
        break;
      case PlayMode.Terminal:
        this.controller.stageType = StageType.Terminal;
        this.game.spawnTerminalPolygon(player.cat as Point, PolygonObjectType.Normal, maxComp);
        this.game.spawnRandomItem(player);
        break;
    }
    player.clearHistory();
    this.boardRenderer.updateBoard();
    this.game.savePlayData(player, this.renderer);
  }
}