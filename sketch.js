/*  Reimagined Myths – p5.js
    – Fuente secundaria Poppins para textos
    – Back en esquina inferior-izq.
    – Logo siempre visible y clicable → Home
    – Título oro (Antiquarian) solo en landing
    – Descripción de mito alineada a la izquierda pero caja centrada
*/

let bgImage, logoImage, antiqueFont;
let wavSound, chapterSounds = [];
let legendImg = [];
let legendDesc = [
  "The Llorona: A grieving woman wandering rivers at night, forever weeping for her drowned children.",
  "El Hombre Caimán: A man cursed to turn into a crocodile, torn between human heart and reptile instinct.",
  "Madre Monte: Spirit of the jungle, guardian of nature who rewards respect and punishes abuse."
];

// se asignan en setup()
let goldCol, glitchColors;

// partículas
const NP = 80;
let particles = [];

// textos
const titleText = "Reimagined Myths";
const introLines = [
  "Reimagined Myths is a trading-card set presenting abstract artistic visions of Colombian legends.",
  "Each card contains an AR trigger that unlocks extra digital content and tiered storytelling.",
  "Collect multiple cards to reveal hidden lore and experience immersive 3D narratives."
];

// estados y UI
let state = "start", selectedMyth = -1, currentChapter = -1;
let introBox = {}, chooseBtn = {}, backBtn = {}, logoBtn = {};
let mythCircles = [], chapterBtns = [];

// ───────────────── preload
function preload() {
  bgImage   = loadImage('images/background.png');
  logoImage = loadImage('images/Logo.png');
  antiqueFont = loadFont('fonts/Antiquarian.ttf');

  wavSound = loadSound('sounds/wav1.mp3');
  for (let i = 1; i <= 6; i++) chapterSounds.push(loadSound(`sounds/Chapter${i}.mp3`));

  ['Legend1','Legend2','Legend3'].forEach((n,i)=> legendImg[i]=loadImage(`images/${n}.png`));
}

// ───────────────── setup
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER); noStroke(); imageMode(CORNER);

  goldCol      = color(255,215,0);
  glitchColors = [ color(255,0,255), color(0,255,255) ];

  for(let i=0;i<NP;i++) particles.push(new Particle());

  introBox = { w: width*0.7, h: 110 };
  introBox.x = width/2 - introBox.w/2;
  introBox.y = height/2 - introBox.h/2;

  chooseBtn = { w:300, h:80, x:width/2-150, y:height*0.72 };
  backBtn   = { w:90, h:38, x:20, y:height-58, label:"Back" };

  const logoW = width*0.1, logoH = (logoImage.height/logoImage.width)*logoW;
  logoBtn = { x:20, y:20, w:logoW, h:logoH };

  const r=120, y0=height/2;
  mythCircles=[
    {x:width*0.25,y:y0,r},{x:width*0.5,y:y0,r},{x:width*0.75,y:y0,r}
  ];

  const caps=[
    "Chapter 1\nThe Setting","Chapter 2\nThe Human Story",
    "Chapter 3\nThe Trigger","Chapter 4\nThe Mythical Form",
    "Chapter 5\nThe Witness","Chapter 6\nThe Echo / Legacy"
  ];
  const cols=3, rows=2, cw=220, ch=72,
        gx=(width-cols*cw)/(cols+1),
        gy=(height-290-rows*ch)/(rows+1);
  let k=0;
  for(let r=0;r<rows;r++)
    for(let c=0;c<cols;c++,k++)
      chapterBtns.push({x:gx*(c+1)+cw*c, y:gy*(r+1)+ch*r+120, w:cw, h:ch, label:caps[k], idx:k});
}

// ───────────────── draw
function draw() {
  background(0); image(bgImage,0,0,width,height);
  particles.forEach(p=>{p.update();p.display();});

  // Título oro solo en landing
  if(state==="start"){
    textFont(antiqueFont); fill(goldCol); textSize(46);
    text(titleText,width/2,60);
  }

  if(state==="start")         drawStart();
  else if(state==="chooseMyth")   drawMyths();
  else if(state==="chooseChapter")drawChapters();

  if(state!=="start") drawBack();

  drawLogo();   // SIEMPRE encima de todo
}

// ───────────────── pantallas
function drawStart(){
  const over = inside(mouseX,mouseY,introBox);
  const sz = over?22:20;
  textFont('Poppins'); fill(goldCol);
  introLines.forEach((ln,i)=>{ textSize(sz); text(ln,width/2,introBox.y+28*i); });

  const hov=inside(mouseX,mouseY,chooseBtn);
  fill(hov?color(255,120):color(0,170)); rect(chooseBtn.x,chooseBtn.y,chooseBtn.w,chooseBtn.h,12);
  fill(255); textSize(28); text("Choose the Myth",width/2,chooseBtn.y+chooseBtn.h/2);
  cursor(hov||over?HAND:ARROW);
}

function drawMyths(){
  overlay();
  drawLogo();

  textFont('Poppins'); fill(255); textSize(34); text("Select a Myth",width/2,100);
  const names=["La Llorona","El Hombre Caimán","Madre Monte"];
  mythCircles.forEach((c,i)=>{
    if(legendImg[i]){ const d=c.r*2; legendImg[i].mask(circleMask(d)); image(legendImg[i],c.x-d/2,c.y-d/2,d,d);}
    textFont(antiqueFont); fill(goldCol); textSize(24); text(names[i],c.x,c.y+c.r+28);
    if(dist(mouseX,mouseY,c.x,c.y)<c.r) cursor(HAND);
  });
}

function drawChapters(){
  overlay();
  drawLogo();

  const mythN=["La Llorona","El Hombre Caimán","Madre Monte"];
  textFont(antiqueFont); fill(goldCol); textSize(42); text(mythN[selectedMyth],width/2,90);

  // descripción: caja centrada, texto alineado a la izquierda
  const descW = 700;
  textFont('Poppins'); textSize(22); fill(goldCol); textAlign(LEFT, TOP);
  text(legendDesc[selectedMyth], width/2 - descW/2, 140, descW, 140);

  textAlign(CENTER,CENTER);
  fill(200); textSize(16);
  text("Click a chapter card to hear its audio narrative",width/2,275);

  chapterBtns.forEach(btn=>{
    const ov=inside(mouseX,mouseY,btn);
    const grad=drawingContext.createLinearGradient(btn.x,btn.y,btn.x,btn.y+btn.h);
    grad.addColorStop(0,ov?"#9933ff":"#222"); grad.addColorStop(1,ov?"#5500ff":"#111");
    drawingContext.fillStyle=grad;
    rect(btn.x,btn.y,btn.w,btn.h,8);

    fill(255); textFont('Poppins'); textSize(16);
    text(btn.label,btn.x+btn.w/2,btn.y+btn.h/2);
    if(ov) cursor(HAND);
  });
}

// ───────────────── UI
function drawBack(){
  const ov=inside(mouseX,mouseY,backBtn);
  fill(ov?color(255,120):color(0,170)); rect(backBtn.x,backBtn.y,backBtn.w,backBtn.h,6);
  fill(255); textFont('Poppins'); textSize(18);
  text(backBtn.label,backBtn.x+backBtn.w/2,backBtn.y+backBtn.h/2);
  if(ov) cursor(HAND);
}

function drawLogo(){
  image(logoImage,logoBtn.x,logoBtn.y,logoBtn.w,logoBtn.h);
}

// ───────────────── mouse
function mousePressed(){
  // Logo ⇒ Home
  if(inside(mouseX,mouseY,logoBtn)){ stopAll(); state="start"; return; }

  // Back
  if(state!=="start" && inside(mouseX,mouseY,backBtn)){
    if(state==="chooseChapter"){ stopChapter(); state="chooseMyth"; }
    else { stopAll(); state="start"; }
    return;
  }
  // Choose
  if(state==="start" && inside(mouseX,mouseY,chooseBtn)){ state="chooseMyth"; wavSound.play(); return; }

  // Elegir mito
  if(state==="chooseMyth"){
    mythCircles.forEach((c,i)=>{ if(dist(mouseX,mouseY,c.x,c.y)<c.r){ selectedMyth=i; state="chooseChapter"; }});
  }
  // Elegir capítulo
  else if(state==="chooseChapter"){
    chapterBtns.forEach(btn=>{ if(inside(mouseX,mouseY,btn)) playChapter(btn.idx); });
  }
}

// ───────────────── audio
function playChapter(i){ stopChapter(); chapterSounds[i]?.loop(); currentChapter=i; }
function stopChapter(){ chapterSounds.forEach(s=>s?.stop()); currentChapter=-1; }
function stopAll(){ wavSound.stop(); stopChapter(); }

// ───────────────── utilidades
function inside(mx,my,o){ return mx>o.x&&mx<o.x+o.w&&my>o.y&&my<o.y+o.h; }
function overlay(){ fill(0,180); rect(0,0,width,height); }
function circleMask(d){ let g=createGraphics(d,d); g.fill(255); g.noStroke(); g.circle(d/2,d/2,d); return g; }

// ───────────────── partículas
class Particle{
  constructor(){ this.reset(); }
  reset(){ this.x=random(width); this.y=random(height); this.s=random(2,6);
           this.v=random(.15,.8); this.a=random(80,150); this.xo=random(-.4,.4); }
  update(){ this.y-=this.v; this.x+=this.xo;
           if(this.y<-10||this.x<-10||this.x>width+10){ this.reset(); this.y=height+10; }}
  display(){ fill(255,this.a); ellipse(this.x,this.y,this.s); }
}

// ─────────────────
function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
  const logoW=width*0.1; logoBtn.w=logoW; logoBtn.h=(logoImage.height/logoImage.width)*logoW;
  backBtn.y=height-58;
}
