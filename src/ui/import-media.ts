import brokenAudio from "@/assets/audio/Motion-Pop12-2.mp3";
import catAudio from "@/assets/audio/cat.mp3";
import expansionAudio from "@/assets/audio/Motion-Pop08-1.mp3";
import failureAudio from "@/assets/audio/Hit08-6.mp3";
import hitAudio from "@/assets/audio/Onoma-Pop03-3(Low).mp3"; 
import lifeUpAudio from "@/assets/audio/Motion-Pop05-1.mp3";
import reductionAudio from  "@/assets/audio/Motion-Pop08-2.mp3";
import punchAudio from "@/assets/audio/Onoma-Pop03-1(High).mp3"; 
import ringAudio from "@/assets/audio/Sleigh_Bells02-01.mp3";
import swishAudio from "@/assets/audio/Motion-Swish01-08.mp3"; 
import successExpansionAudio from "@/assets/audio/Motion-Pop07-2.mp3";
import successReductionAudio from "@/assets/audio/Motion-Pop07-3.mp3";
import waveAudio from "@/assets/audio/Motion-Pop21-1.mp3";
// import holeAudio from "@/assets/audio/Accent05-1.mp3";
// import aromaAudio from "@/assets/audio/aroma.mp3";
// import sprayAudio from "@/assets/audio/spray.mp3"; 
// import bookOpen from "@/assets/audio/Book01-2.mp3"; 
// import bookAudio from "@/assets/audio/Book01-6.mp3";

export const AudioSources = {
  // SE
  broken: brokenAudio,
  cat: catAudio,
  expansion: expansionAudio,
  failure: failureAudio,
  hit: hitAudio,
  lifeUp: lifeUpAudio,
  reduction: reductionAudio,
  punch: punchAudio,
  ring: ringAudio,
  successExpansion: successExpansionAudio,
  successReduction: successReductionAudio,
  swish: swishAudio,
  wave: waveAudio,
  // hole: holeAudio,
  // aroma: aromaAudio,
  // spray: sprayAudio,
  // bookOpen: bookOpen,
  // book: bookAudio,
  // BGM 
  // bgmMain: "./audio/bgm.mp3",
}

export function playAudio(audioFile: string) {
  const audio = new Audio(audioFile);
  audio.currentTime = 0;
  audio.play();
}
// export function playAudio(audioID: string) {
//   let audio = new Audio(AudioSources[audioID]);
//   audio.currentTime = 0;
//   audio.play();
// }

/**
 * Audio 
 */


/**
 * Image
 */
// export const ImageSources = {
  // bell: "./image/bell.svg", 
  // cat: "./image/cat.svg", 
  // grave: "./image/grave.svg", 
  // snake: "./image/snake.svg", 
  // wave: "./image/wave.svg", 
// }

// let imageData = new Map;
// for (let key of Object.keys(imageSources)){
//   let image = new Image();
//   image.src = imageSources[key] + "?" + new Date().getTime();
//   image.onload = function() {
//     imageData.set(key, image);
//   }
// }

// const imageStyle = {
//   "bell" : ["yellow", "black"],
//   "cat" : ["red", "black"],
//   "grave" : ["gray", "red"],
//   "snake" : ["green", "red"],
//   "wave" : ["blue", "red"],
// }


// function playBGM(audioID, volume) {
//   let audio = new Audio(audioSources[audioID]);
//   audio.currentTime = 0;
//   audio.volume = volume;
//   audio.play();
//   audio.loop  = true;
//   return audio;
// }
