export enum PlayMode {
  Tutorial,
  Normal,
  Canonical,
  Terminal,
  PolygonEditor,
  ItemEditor,
}

export enum StageType {
  Canonical,
  Terminal,
}

export enum PlayerState {
  Play,
  Battle,
  MatchWait,
  CoolDown,
  ContinueWait,
  ItemEdit,
  DocumentView,
}

export const PlayerEvent = {
  click: "click",
  clickLatticePoint: "clickLatticePoint",
  rightClick: "rightClick",
  match: "match",
  missed: "missed",
  switchPolygon: "switchPolygon",
  inclusion: "inclusion",
  intrusion: "intrusion",
  noInclusion: "noInclusion",
  dead: "dead",
  updateStyle: "updateStyle",
  newStage: "newStage",
  startStage: "startStage",
} as const;
