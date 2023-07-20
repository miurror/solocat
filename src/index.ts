import { Board } from "./game-components/export";
import Game from "./game";
import Player from "./player/player";
import Renderer from "./ui/renderer";
import { Global } from "./game-constants";
import { PlayerState } from "./player/constants";


const board = new Board();
const player = new Player();
const game = new Game(board);

function init(){
  const canvas = document.getElementById('field') as HTMLCanvasElement;
  const langJpInput = document.getElementById('langJp') as HTMLInputElement;
  const langEnInput = document.getElementById('langEn') as HTMLInputElement;
  const renderer = new Renderer(canvas, game, player);
  game.addPlayer(player, renderer);
  game.startTimer(player, renderer.boardRenderer);
  game.loadPlayData(player, renderer);
  if(langJpInput){
    if(Global.isLangJp === undefined){
      Global.isLangJp = langJpInput.checked;
    }else{
      langJpInput.checked = Global.isLangJp;
    }
    if(Global.isLangJp){
      document.querySelectorAll('[lang="jp"]').forEach((el) => (el as HTMLElement).style.display = 'inline');
      document.querySelectorAll('[lang="en"]').forEach((el) => (el as HTMLElement).style.display = 'none');
    }else{
      document.querySelectorAll('[lang="jp"]').forEach((el) => (el as HTMLElement).style.display = 'none');
      document.querySelectorAll('[lang="en"]').forEach((el) => (el as HTMLElement).style.display = 'inline');
    }
  }
  const logo = document.getElementById('logo') as HTMLSpanElement;
  const rules = document.getElementById('rules') as HTMLSpanElement;
  const wishes = document.getElementById('wishes') as HTMLSpanElement;
  const reset = document.getElementById('reset') as HTMLSpanElement;
  
  /**
   * PC event handler
   */
  langJpInput.addEventListener('change', () => {
    game.stopTimer();
    Global.isLangJp = langJpInput.checked;
    if(Global.isLangJp){
      document.querySelectorAll('[lang="jp"]').forEach((el) => (el as HTMLElement).style.display = 'inline');
      document.querySelectorAll('[lang="en"]').forEach((el) => (el as HTMLElement).style.display = 'none');
    }else{
      document.querySelectorAll('[lang="jp"]').forEach((el) => (el as HTMLElement).style.display = 'none');
      document.querySelectorAll('[lang="en"]').forEach((el) => (el as HTMLElement).style.display = 'inline');
    }
    renderer.boardRenderer.updateBoard();
  });
  langEnInput.addEventListener('change', () => {
    game.stopTimer();
    Global.isLangJp = langJpInput.checked;
    if(Global.isLangJp){
      document.querySelectorAll('[lang="jp"]').forEach((el) => (el as HTMLElement).style.display = 'inline');
      document.querySelectorAll('[lang="en"]').forEach((el) => (el as HTMLElement).style.display = 'none');
    }else{
      document.querySelectorAll('[lang="jp"]').forEach((el) => (el as HTMLElement).style.display = 'none');
      document.querySelectorAll('[lang="en"]').forEach((el) => (el as HTMLElement).style.display = 'inline');
    }
    renderer.boardRenderer.updateBoard();
  });
  logo.addEventListener('click', ()=>{
    game.stopTimer();
    if(player.controller.state === PlayerState.DocumentView){
      game.startTimer(player, renderer.boardRenderer);
      player.controller.state = renderer.playerState;
      renderer.boardRenderer.updateBoard();
    }else{
      renderer.showInfo(Global.isLangJp);
    }
  });
  rules.addEventListener('click', ()=>{
    game.stopTimer();
    if(player.controller.state === PlayerState.DocumentView){
      game.startTimer(player, renderer.boardRenderer);
      player.controller.state = renderer.playerState;
      renderer.boardRenderer.updateBoard();
    }else{
      renderer.showRules(Global.isLangJp);
    }
  });
  wishes.addEventListener('click', ()=>{
    game.stopTimer();
    if(player.controller.state === PlayerState.DocumentView){
      game.startTimer(player, renderer.boardRenderer);
      player.controller.state = renderer.playerState;
      renderer.boardRenderer.updateBoard();
    }else{
      renderer.showWishes(Global.isLangJp);
    }
  });
  reset.addEventListener('click', ()=>{
    game.stopTimer();
    game.resetPlayData();
    player.resetHighScore();
    window.location.reload();
    // board = new Board();
    // player = new Player();
    // game = new Game(board);
  });

  window.addEventListener('resize', () => {renderer.onResize();}, false);
  canvas.addEventListener('wheel', (e: WheelEvent) => {renderer.onWheel(e);}, false);
  canvas.addEventListener('contextmenu', (e: MouseEvent) => {renderer.onRightClick(e);}, false); 
  canvas.addEventListener('mousedown', (e: MouseEvent) => {renderer.onMouseDown(e);}, false);
  canvas.addEventListener('mousemove', (e: MouseEvent) => {renderer.onMouseMove(e);}, false);
  canvas.addEventListener('mouseup', (e: MouseEvent) => {renderer.onMouseUp(e);}, false);
  canvas.addEventListener('mouseleave', () => {renderer.onMouseLeave();}, false);
  document.addEventListener('keydown', (e: KeyboardEvent) => {renderer.onKeyPress(e);}, false);
}

window.onload = init;

