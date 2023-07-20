import { Vector, Matrix,  } from "@/geometry/export";
import Game from "@/game";
import { Player, PlayerEvent, PlayerState } from "@/player/export";
import BoardRenderer from "./board-renderer/board-renderer";
import { BOARD_SCALE_CONSTANT } from "./canvas-data";
import { Global } from "@/game-constants";

/**
 * 
 */
export default class Renderer {
  public canvas: HTMLCanvasElement;
  public game: Game;
  public player: Player;
  private readonly _MOUSE_DRAG_SENSITIVITY = 5;
  private _boardRenderer!: BoardRenderer;
  private _isMouseDown = false;
  private _playerState = PlayerState.Play;
  private _mouseDownCount = 0;

  constructor(canvas: HTMLCanvasElement, game = new Game(), player = game.players[0]){
    this.canvas = canvas;
    this.game = game;
    this.player = player;
    this.setCanvasAndBoard();
  }

  // getter and setter
  get MOUSE_DRAG_SENSITIVITY() { return this._MOUSE_DRAG_SENSITIVITY; }
  get boardRenderer() { return this._boardRenderer; }
  set boardRenderer(br: BoardRenderer) { this._boardRenderer = br; }
  get isMouseDown() { return this._isMouseDown; }
  set isMouseDown(value: boolean) { this._isMouseDown = value; }
  get mouseDownCount() { return this._mouseDownCount; }
  set mouseDownCount(count: number) { this._mouseDownCount = count; }
  get playerState() { return this._playerState; }
  set playerState(state: PlayerState){ this._playerState = state; }

  setCanvas(columnWidth = Global.columnWidth, headerHeight = Global.headerHeight): void{
    this.canvas.width = window.innerWidth - columnWidth;
    this.canvas.height = window.innerHeight - headerHeight;
  }
  setCanvasAndBoard(): void{
    this.setCanvas();
    if(!this.boardRenderer){
      this.boardRenderer = new BoardRenderer(this.game.board, this.player, this.canvas);
    }else{
      this.boardRenderer.setCanvasData(this.canvas.width, this.canvas.height);
      // this.boardRenderer.viewTransformManager.resetOffset();
      if(this.player.cat){
        const origin = this.player.cat.clone() as Vector;
        this.boardRenderer.boardData.offsetMatrix = new Matrix();
        this.boardRenderer.boardData.offsetVector = origin.multiply(-1);
        this.boardRenderer.boardData.scaleUnit = BOARD_SCALE_CONSTANT.scaleUnitDefault;
        this.boardRenderer.delegateMethods();
        this.boardRenderer.updateBoard();
      }
    }
  }

  /**
   * Entry point to handle inputs.
   * Processes not related to the board should be written here.
   * main processes related to the board are delegated to boardRenderer.InputManager.
   */
  onResize(){
    this.setCanvasAndBoard();
    if(this.player.controller.state === PlayerState.DocumentView){
      this.game.startTimer(this.player, this.boardRenderer);
    }
  }

  onWheel(e: WheelEvent){
    e.preventDefault();
    if(this.player.controller.state === PlayerState.DocumentView){
      this.game.startTimer(this.player, this.boardRenderer);
    }
    this.boardRenderer.inputManager.onWheel(e);
    return;
  }

  onKeyPress(e: KeyboardEvent){
    this.boardRenderer.inputManager.onKeyPress(e);
    if(e.key === "Enter" || e.key === " "){
      this.game.stopTimer();
      if(this.player.controller.state === PlayerState.DocumentView){
        this.game.startTimer(this.player, this.boardRenderer);
        this.boardRenderer.updateBoard();
        this.player.controller.state = this.playerState;
      }else{
        this.playerState = this.player.controller.state;
        this.showRules(Global.isLangJp);
      }
    }
  }

  // mouse event
  onClick(e: MouseEvent){
    const targetElement = e.target as HTMLElement;
    if(targetElement){
      // game logic is implemented in playerEventListener
      this.player.controller.emit(PlayerEvent.click, this.player);
      const rect = targetElement.getBoundingClientRect(); 
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top; 
      // (x, y): view coordinate
      this.boardRenderer.inputManager.onClick(x, y);
      if(this.player.controller.state === PlayerState.DocumentView){
        this.game.startTimer(this.player, this.boardRenderer);
        this.player.controller.state = this.playerState;
      }
    }
  }

  onRightClick(e: MouseEvent){
    e.preventDefault();
    if(this.player.controller.state === PlayerState.DocumentView){
      this.game.startTimer(this.player, this.boardRenderer);
    }
    this.boardRenderer.inputManager.onRightClick();
  }

  onDragStart(e: MouseEvent){
    if(this.player.controller.state === PlayerState.DocumentView){
      this.game.startTimer(this.player, this.boardRenderer);
    }
    const targetElement = e.target as HTMLElement;
    if(targetElement){
      const rect: DOMRect = targetElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.boardRenderer.inputManager.onDragStart(x,y);
    }
  }

  onDrag(e: MouseEvent){
    const targetElement = e.target as HTMLElement;
    if(targetElement){
      const rect: DOMRect = targetElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.boardRenderer.inputManager.onDrag(x,y);
    }
  }

  onMouseDown(e: MouseEvent){
    if(e.button !== 0) { return; }
    this.isMouseDown = true;
    this.onDragStart(e);
  }

  onMouseMove(e: MouseEvent){
    if(e.button !== 0) { return; }
    if(this.isMouseDown){
      this.mouseDownCount++;
      if(this.mouseDownCount > this.MOUSE_DRAG_SENSITIVITY){
        this.onDrag(e);
      }
    }
  }

  onMouseUp(e: MouseEvent){
    if(e.button !== 0) { return; }
    this.isMouseDown = false;
    if(this.mouseDownCount <= this.MOUSE_DRAG_SENSITIVITY){
      this.onClick(e);
    }
    this.mouseDownCount = 0;
  }

  onMouseLeave(){
    this.isMouseDown = false;
  }


  showInfo(isLangJp: boolean){
    this.boardRenderer.updateBoard();
    if(isLangJp){
      this.showPage(
        "\
        Solo-Cat  Version 1.0\n\
        Copyright(c) 2023 [miurror]\n\n\
        [素材]\n\
        効果音： OtoLogic (CC BY 4.0)、効果音ラボ \n\
        フォント： うずらフォント、にくまるフォント、源柔ゴシックフォント\n\
        ファビコン： Solar Outline Icons Collection (CC By 4.0)\n\n\
        [謝辞]\n\
        本ゲームは、JSPS科研費 JP21K03156 の助成を受けた研究を基に開発されました。\n\
        また、その原型は京都大学MACS教育プログラム SG2022-2 の一環として制作したものです。\n\
        テストプレイにご協力いただき、貴重な意見をくださった全ての方々に感謝申し上げます。\
        ", 20
      )
    }else{
      this.showPage(
        "\
        Solo-Cat  Version 1.0\n\
        Copyright(c) 2023 [miurror]\n\n\
        [Assets]\n\
        Sound Effects:  OtoLogic (CC BY 4.0), soundeffect-lab\n\
        Fonts:  Uzura, Nikumaru, GenJyuuGothic\n\
        Favicon:  Solar Outline Icons Collection (CC By 4.0)\n\n\
        [Acknowledgments]\n\
        This game was developed based on the research supported by \n\
        Grants-in-Aid for Scientific Research JP21K03156.\n\
        Furthermore, the prototype of this game was created as part of \n\
        the MACS Education Program SG2022-2 in Kyoto University.\n\
        The developer sincerely thanks all those who participated in the test play \n\
        and provided valuable feedback.\
        ", 20
      )
    }
  }

  showWishes(isLangJp: boolean){
    this.boardRenderer.updateBoard();
    const achievements = Global.achievementManager.achievements.filter(
      achievement => {return !achievement.completed;}).map(
        achievement => achievement.name);
    const completedAchievements = Global.achievementManager.achievements.filter(
      achievement => {return achievement.completed;}).map(
        achievement => achievement.name);
    const achievementsJp = Global.achievementManager.achievements.filter(
      achievement => {return !achievement.completed;}).map(
        achievement => achievement.nameJp);
    const completedAchievementsJp = Global.achievementManager.achievements.filter(
      achievement => {return achievement.completed;}).map(
        achievement => achievement.nameJp);
    const ach1 = achievements.join("\n           ");
    const ach2 = completedAchievements.join(" (Done)\n           ");
    const ach1Jp = achievementsJp.join("\n           ");
    const ach2Jp = completedAchievementsJp.join("（達成）\n            ");
    let names = "          [Wishes]  \n           " + ach1; 
    if(ach2){
      names += "  \n\n          [Forgotten Wishes]  \n           " 
      + ach2 + " (Done)";
    } 
    let namesJp = "          [猫の望み]  \n           " + ach1Jp; 
    if(ach2Jp){
      namesJp += "  \n\n           [かつての望み]  \n            " 
      + ach2Jp + "（達成）";
    } 
    if(isLangJp){
      this.showPage(namesJp, 20);
    }else{
      this.showPage(names, 20);
    }
  }

  showRules(isLangJp: boolean){
    this.boardRenderer.updateBoard();
    if(isLangJp){
      this.showPage(
        "\
        ようこそ Solo-Cat (ソロキャット) の世界へ！\n\
        広い平原に、ただひとつ佇むキャットルーム。\n\
        気まぐれな猫は、退屈しのぎに部屋の改築を望んでいる。\n\
        外からの危険な侵入を防ぎながら、猫の望みを叶えよう。\n\n\
        [遊び方]\n\
          点をクリックして、キャットルームを改築しよう。\n\
          侵入物は、直接クリックすることで回避できるかも。\n\
          鈴を鳴らせば、ライフアップのチャンスあり。 \n\n\
        [ステージ] \n\
          青 : 「草むらを部屋に入れるな！」\n\
          赤 : 「壁からの浸水にも注意！」\n\n\
        [操作]\n\
          左クリック :  改築、次のステージ、コンティニュー等 \n\
          右クリック :  元に戻す (この際、回避はできない) \n\
          awsd, hjkl, rq :   視点を変更 \n\
          Enter/スペース :   ルールを表示\n\n\
        改築をお楽しみください！\
        ", 20
      )
    }else{
      this.showPage(
        "\
        Welcome to the world of Solo-Cat! \n\
        A lone Cat Room stands in vast plains.\n\
        Your whimsical cat yearns for change, a room renovation!\n\
        Let's fulfill its wishes while preventing threats.\n\n\
        [How to Play]\n\
          Click on a spot to renovate the cat room.\n\
          Click a trouble spot. You might avoid it. \n\
          Ring a bell, for a 1-up chance.  \n\n\
        [Stages] \n\
          Blue : Don't bring the grass into the room! \n\
          Red : Watch out for water seeping through the wall!\n\n\
        [Controls]\n\
          Left click :  Renovate, go next, or continue. \n\
          Right click :  Undo (not for avoids).\n\
          awsd, hjkl, rq :   Change view. \n\
          Enter/Space :  Show rules.\n\n\
        Have fun renovating the room!\
        ", 20
      )
    }
  }

  showPage(text: string, fontSize = 24) {
    this.playerState = this.player.controller.state;
    this.player.controller.state = PlayerState.DocumentView;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // 半透明のグレーで背景を塗りつぶす
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 角丸の白っぽい背景を描画
    const borderRadius = 10;
    const rectWidth = this.canvas.width * 0.8;
    const rectHeight = this.canvas.height * 0.8;
    const xPos = (this.canvas.width - rectWidth) / 2;
    const yPos = (this.canvas.height - rectHeight) / 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(xPos + borderRadius, yPos);
    ctx.lineTo(xPos + rectWidth - borderRadius, yPos);
    ctx.quadraticCurveTo(xPos + rectWidth, yPos, xPos + rectWidth, yPos + borderRadius);
    ctx.lineTo(xPos + rectWidth, yPos + rectHeight - borderRadius);
    ctx.quadraticCurveTo(xPos + rectWidth, yPos + rectHeight, xPos + rectWidth - borderRadius, yPos + rectHeight);
    ctx.lineTo(xPos + borderRadius, yPos + rectHeight);
    ctx.quadraticCurveTo(xPos, yPos + rectHeight, xPos, yPos + rectHeight - borderRadius);
    ctx.lineTo(xPos, yPos + borderRadius);
    ctx.quadraticCurveTo(xPos, yPos, xPos + borderRadius, yPos);
    ctx.closePath();
    ctx.fill();

    // テキストを描画
    ctx.font = Global.isLangJp? `bold ` + fontSize + `px "fontA"` :  `bold ` + fontSize + `px "fontB"`;
    const lineHeight = fontSize * 1.5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';

    // 改行でテキストを分割
    const lines = text.split('\n');
    const totalHeight = lineHeight * lines.length;
    const textYStart = (this.canvas.height - totalHeight) / 2;

    lines.forEach((line, index) => {
      // const textMetrics = ctx.measureText(line);
      // const textX = (this.canvas.width - textMetrics.width) / 2;
      const textX = this.canvas.width /8;
      const textY = textYStart + index * lineHeight + fontSize;
      ctx.fillText(line, textX, textY);
    });
  }
}