import { PolygonObject } from "./game-components/export"; 
import { PlayMode, StageType } from "./player/constants";
import Player from "./player/player";
import BoardRenderer from "./ui/board-renderer/board-renderer";

type AchievementDictionaryType = { [key: string]: [string, string] };
const achievementNamesDictionary: AchievementDictionaryType = {
  "twoStep": ["Renovate in 2 steps", "2手で改築"],
  "fiveStep": ["Renovate within 5 steps", "5手以内で改築"],
  "tenStep": ["Renovate within 10 steps", "10手以内で改築"],
  "thousandYear": ["Reach Cat Era 1000", "にゃん暦1000年"],
  "hundredYear": ["Reach Cat Era 100", "にゃん暦100年"],
  "thirtyYear": ["Reach Cat Era 30", "にゃん暦30年"],
  "tenYear": ["Reach Cat Era 10", "にゃん暦10年"],
  "thousandPerfect": ["No trouble for 1000 consecutive years", "1000年連続侵入なし"],
  "hundredPerfect": ["No trouble for 100 consecutive years", "100年連続侵入なし"],
  "thirtyPerfect": ["No trouble for 30 consecutive years", "30年連続侵入なし"],
  "tenPerfect": ["No trouble for 10 consecutive years", "10年連続侵入なし"],
  "thousandDodge": ["Dodge 1000 times", "回避を1000回する"],
  "hundredDodge": ["Dodge 100 times", "回避を100回する"],
  "thirtyDodge": ["Dodge 30 times", "回避を30回する"],
  "tenDodge": ["Dodge 10 times", "回避を10回する"],
  "oneDodge": ["Dodge once", "回避をする"],
  "hundredLifeUp": ["Reach Life 100", "ライフ100に到達する"],
  "thirtyLifeUp": ["Reach Life 30", "ライフ30に到達する"],
  "tenLifeUp": ["Reach Life 10", "ライフ10に到達する"],
  "oneLifeUp": ["Life up once", "ライフアップする"],
  "thousandBell": ["Ring the bell 1000 times", "鈴の音を1000回響かせる"],
  "hundredBell": ["Ring the bell 100 times", "鈴の音を100回響かせる"],
  "thirtyBell": ["Ring the bell 30 times", "鈴の音を30回響かせる"],
  "tenBell": ["Ring the bell 10 times", "鈴の音を10回響かせる"],
  "oneBell": ["Ring the bell once", "鈴の音を響かせる"]
};



class Achievement {
  public key: string;
  public name: string;
  public nameJp: string;
  public completed: boolean;
  public unlockableAchievements: Achievement[];

  constructor(key: string, unlockableAchievements: Achievement[] = []){
    this.key = key;
    this.name = achievementNamesDictionary[key][0];
    this.nameJp = achievementNamesDictionary[key][1];
    this.completed = false;
    this.unlockableAchievements = unlockableAchievements;
  }

  complete(){
    this.completed = true;
    return this.unlockableAchievements;
  }
}

const twoStepAchievement = new Achievement("twoStep");
const fiveStepAchievement = new Achievement("fiveStep", [twoStepAchievement]);
const tenStepAchievement = new Achievement("tenStep", [fiveStepAchievement]);
const thousandYearAchievement = new Achievement("thousandYear");
const hundredYearAchievement = new Achievement("hundredYear",[thousandYearAchievement]);
const thirtyYearAchievement = new Achievement("thirtyYear", [hundredYearAchievement]);
const tenYearAchievement = new Achievement("tenYear", [thirtyYearAchievement]);
const thousandPerfectAchievement = new Achievement("thousandPerfect");
const hundredPerfectAchievement = new Achievement("hundredPerfect",[thousandPerfectAchievement]);
const thirtyPerfectAchievement = new Achievement("thirtyPerfect", [hundredPerfectAchievement]);
const tenPerfectAchievement = new Achievement("tenPerfect", [thirtyPerfectAchievement]);
const thousandDodgeAchievement = new Achievement("thousandDodge");
const hundredDodgeAchievement = new Achievement("hundredDodge",[thousandDodgeAchievement]);
const thirtyDodgeAchievement = new Achievement("thirtyDodge",[hundredDodgeAchievement]);
const tenDodgeAchievement = new Achievement("tenDodge",[thirtyDodgeAchievement]);
const oneDodgeAchievement = new Achievement("oneDodge",[tenDodgeAchievement]);
const hundredLifeUpAchievement = new Achievement("hundredLifeUp");
const thirtyLifeUpAchievement = new Achievement("thirtyLifeUp",[hundredLifeUpAchievement]);
const tenLifeUpAchievement = new Achievement("tenLifeUp",[thirtyLifeUpAchievement]);
const oneLifeUpAchievement = new Achievement("oneLifeUp",[tenLifeUpAchievement]);
const thousandBellAchievement = new Achievement("thousandBell");
const hundredBellAchievement = new Achievement("hundredBell",[thousandBellAchievement]);
const thirtyBellAchievement = new Achievement("thirtyBell",[hundredBellAchievement]);
const tenBellAchievement = new Achievement("tenBell",[thirtyBellAchievement]);
const oneBellAchievement = new Achievement("oneBell",[tenBellAchievement, oneLifeUpAchievement]);

class AchievementManager {
  public _achievements: Achievement[] = [];
  constructor(initialAchievements: Achievement[] = [
    tenYearAchievement, 
    tenStepAchievement, 
    oneDodgeAchievement, 
    tenPerfectAchievement,
    oneBellAchievement,
  ]) {
    this.achievements = initialAchievements;
  }

  get achievements(){ return this._achievements; }
  set achievements(achievements: Achievement[]){ this._achievements = achievements}

  complete(key: string, boardRenderer: BoardRenderer) {
    for (const achievement of this.achievements) {
      if (achievement.key === key && !achievement.completed){
        const unlockedAchievements = achievement.complete();
        if(Global.isLangJp){
          boardRenderer.showTemporaryMessage([achievement.nameJp + " 達成！"]);
        }else{
          boardRenderer.showTemporaryMessage([achievement.name + ": Done！"]);
        }
        this.achievements = this.achievements.concat(unlockedAchievements);
        break;
      }
    }
  }

  innerComplete(name: string){
    for (const achievement of this.achievements) {
      if (achievement.name === name && !achievement.completed){
        const unlockedAchievements = achievement.complete();
        this.achievements = this.achievements.concat(unlockedAchievements);
        break;
      }
    }
  }

  toDict(): { [name: string]: boolean }{
    const achievementDict: { [name: string]: boolean } = {};
    for (const achievement of this.achievements){
      achievementDict[achievement.name] = achievement.completed;
    }
    return achievementDict;
  }

  fromDict(achievementDict: { [name: string]: boolean }, 
    initialAchievements: Achievement[] = [
      tenYearAchievement, 
      tenStepAchievement, 
      oneDodgeAchievement, 
      tenPerfectAchievement,
      oneBellAchievement,
    ]){
    if(!achievementDict){ return; }
    this.achievements = initialAchievements;
    Object.keys(achievementDict).forEach(
      name => {if(achievementDict[name]){this.innerComplete(name);}}
    )
  }
}

export const Global = {
  // canvas 
  columnWidth: 0,
  headerHeight: 40,

  // radio button
  isLangJp: false,

  // game 
  defaultPlayMode: PlayMode.Normal, 
  hitPointMax : 5,
  puzzleLevelInitial: 1,
  battleLevelInitial: 1,

  noDamageProbability: 0.5,
  terminalModeProbability: 0.2,
  lifeUpProbability: 0,
  spawnRingProbability: 0.1,

  // effects
  clickMessageOn: false,

  // font
  fontColorStage: ['rgb(160, 50, 80)', 'rgb(80, 50, 160)'],
  fontColorLife: ['rgb(160, 50, 80)', 'rgb(80, 50, 160)'],

  achievementManager: new AchievementManager(),
}

class Stage {
  private _polygon: PolygonObject;
  private _stageType: StageType;
  constructor(stageType: StageType, vertices: number[][]){
    this._polygon = new PolygonObject(vertices);
    this._stageType = stageType;
  }
  get polygon(): PolygonObject { return this._polygon; }
  get stageType(): StageType { return this._stageType; }
}

class Campaign {
  public currentStage = -1; // stage number in Campaign
  public stages : Stage[];
  constructor(stages: Stage[]){
    this.stages = stages;
  }

  read(player: Player){
    this.currentStage++;
    player.controller.stageType = this.stages[this.currentStage].stageType;
    if(this.currentStage === this.stages.length - 1){
      player.controller.playMode = PlayMode.Normal; // TODO: keep Tutorial
    }
    return this.stages[this.currentStage].polygon;
  }

  reset(player: Player){
    this.currentStage = -1;
    player.controller.playMode = PlayMode.Tutorial;
  }
}

export const tutorial = new Campaign([
  new Stage(StageType.Canonical, [[0,-1],[-1,-1],[1,2]]),
  new Stage(StageType.Canonical, [[1,1],[1,-1],[-1,1],[-1,-1]]),
  new Stage(StageType.Canonical, [[1,1],[0,1],[-1,-1], [-1,-2], [0,-1]]),
  new Stage(StageType.Terminal, [[-2,3],[-1,1],[-1,2],[1,-1],[1,-2],[2,-3]])
]);
