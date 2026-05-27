var KELUARGA = {
mama: { foto: "mama.jpeg", nama: "Mama", badge: "❤️", adik: false },
papa: { foto: "papa.jpeg", nama: "Papa", badge: "🎣", adik: false },
dea: { foto: "dea.jpeg", nama: "Dea", badge: "🐟", adik: true },
rani: { foto: "rani.jpeg", nama: "Rani", badge: "⭐", adik: true }
};

var PESAN_SEMANGAT_AA = [
"Semangat Aa!",
"Aa, jangan menyerah ya!",
"Semangat Aa, bisa!",
"Aa hebat banget!",
"Yuk Aa, tangkap lagi!"
];

function semangatAa(id, tambahan){
var teks = "Semangat Aa!";
if(tambahan){teks = "Semangat Aa! " + tambahan;}
tampilkanPesan(teks, id);
}

function semangatAaAcak(){
var id = Math.random() < 0.5 ? "dea" : "rani";
var teks = PESAN_SEMANGAT_AA[Math.floor(Math.random() * PESAN_SEMANGAT_AA.length)];
tampilkanPesan(teks, id);
}

function htmlPenontonKeluarga(){
var html = '<div id="penontonKeluarga">';
var ids = ["mama", "papa", "dea", "rani"];
for(var i = 0; i < ids.length; i++){
var id = ids[i];
var k = KELUARGA[id];
html += '<div class="penonton" data-id="' + id + '"><img src="' + k.foto + '" alt="' + k.nama + '"><span>' + k.nama + '</span></div>';
}
html += "</div>";
return html;
}

function buatDropKeluarga(id, kelasExtra){
var k = KELUARGA[id];
var d = document.createElement("div");
d.className = "dropItem dropKeluarga " + (kelasExtra || "");
d.title = k.nama;
d.innerHTML = '<img src="' + k.foto + '" alt="' + k.nama + '"><span class="dropBadge">' + k.badge + "</span>";
return d;
}

function sorotPenonton(id){
var semua = document.querySelectorAll(".penonton");
for(var i = 0; i < semua.length; i++){
semua[i].classList.remove("sorot");
}
if(!id){return;}
var el = document.querySelector('.penonton[data-id="' + id + '"]');
if(el){el.classList.add("sorot");}
}

var gameLoopId = null;

function aturTinggiLayar(){
var h = window.innerHeight;
var w = window.innerWidth;
document.documentElement.style.setProperty("--vh", (h * 0.01) + "px");
document.documentElement.style.height = h + "px";
document.body.style.height = h + "px";
document.body.style.width = w + "px";
window.tinggiMain = h;
window.lebarMain = w;
window.batasJatuhGitar = Math.round(h * 0.86);
window.batasHapusItem = h + 40;
var bottomPx = Math.max(88, Math.min(130, Math.round(h * 0.14)));
window.playerBottom = bottomPx;
window.playerSize = 100;
window.playerTopY = h - bottomPx - 100;
var player = document.getElementById("player");
if(player){
player.style.bottom = bottomPx + "px";
}
var penonton = document.getElementById("penontonKeluarga");
if(penonton){
penonton.style.bottom = (bottomPx + 72) + "px";
}
}

function zonaPemain(){
var h = window.tinggiMain || window.innerHeight;
var bottom = window.playerBottom || 120;
var size = window.playerSize || 100;
var top = h - bottom - size;
return {top:top,bottom:h - bottom,left:posisi,right:posisi + size,height:size};
}

function siapkanAudioEl(el){
if(!el){return;}
el.preload = "auto";
el.setAttribute("playsinline", "");
el.setAttribute("webkit-playsinline", "");
}

function bukaEfekSuara(){
if(window.efekSuaraTerbuka){return;}
var daftar = [suaraTangkap, suaraNice, suaraBagus, suaraMantap];
for(var i = 0; i < daftar.length; i++){
if(!daftar[i]){continue;}
(function(a){
var volAsli = a.volume;
a.volume = 0.01;
a.play().then(function(){
a.pause();
a.currentTime = 0;
a.volume = volAsli;
}).catch(function(){
a.volume = volAsli;
});
})(daftar[i]);
}
window.efekSuaraTerbuka = true;
window.audioTerbuka = true;
}

function mulaiBacksound(){
if(window.muted || !window.bgm){return;}
var b = window.bgm;
function putar(){
if(!b.paused && b.currentTime > 0){return;}
b.play().then(function(){
window.bgmMenungguTap = false;
}).catch(function(){
window.bgmMenungguTap = true;
});
}
if(b.readyState >= 2){
putar();
return;
}
b.addEventListener("canplaythrough", putar, {once:true});
try{b.load();}catch(err){}
}

function bukaAudioMobile(){
bukaEfekSuara();
mulaiBacksound();
}

function pasangTombolAksi(btn, aksi){
if(!btn){return;}
var sentuhBaru = false;
function jalankan(e){
if(e){
e.preventDefault();
e.stopPropagation();
}
var sekarang = Date.now();
if(sekarang - (window.terakhirTapAksi || 0) < 65){return;}
window.terakhirTapAksi = sekarang;
aksi();
}
btn.addEventListener("touchstart", function(e){
sentuhBaru = true;
jalankan(e);
},{passive:false});
btn.addEventListener("touchend", function(){
setTimeout(function(){sentuhBaru = false;},450);
});
btn.addEventListener("click", function(e){
if(sentuhBaru){
e.preventDefault();
return;
}
jalankan(e);
});
}

function pasangKontrolGerak(){
pasangTombolAksi(document.getElementById("btnKiri"), function(){
if(window.bgmMenungguTap){mulaiBacksound();}
kiri();
});
pasangTombolAksi(document.getElementById("btnKanan"), function(){
if(window.bgmMenungguTap){mulaiBacksound();}
kanan();
});
var mute = document.getElementById("muteBtn");
if(mute){pasangTombolAksi(mute, toggleMute);}
}

function pasangCegahGeser(){
if(window.handlerCegahGeser){return;}
window.handlerCegahGeser = function(e){
if(document.body.classList.contains("mode-game")){
e.preventDefault();
}
};
document.addEventListener("touchmove", window.handlerCegahGeser, {passive:false});
}

function pasangResizeLayar(){
if(window.handlerResizeLayar){return;}
var timer;
window.handlerResizeLayar = function(){
clearTimeout(timer);
timer = setTimeout(function(){
aturTinggiLayar();
var batas = window.innerWidth - 100;
if(typeof posisi !== "undefined" && posisi > batas){
posisi = batas;
var p = document.getElementById("player");
if(p){p.style.left = posisi + "px";}
}
},120);
};
window.addEventListener("resize", window.handlerResizeLayar);
window.addEventListener("orientationchange", window.handlerResizeLayar);
}

function pasangJedaLayar(){
if(window.handlerVisibility){return;}
window.handlerVisibility = function(){
if(!window.bgm){return;}
if(document.hidden){
bgm.pause();
}else if(!window.muted && document.body.classList.contains("mode-game")){
mulaiBacksound();
}
};
document.addEventListener("visibilitychange", window.handlerVisibility);
}

function setupGameMobile(){
document.body.classList.add("mode-game");
aturTinggiLayar();
pasangCegahGeser();
pasangResizeLayar();
pasangJedaLayar();
pasangKontrolGerak();
try{
if(screen.orientation && screen.orientation.lock){
screen.orientation.lock("portrait").catch(function(){});
}
}catch(err){}
}

function mulaiGame(){
document.body.innerHTML = `
<style>
html,body{
margin:0;overflow:hidden;width:100%;height:calc(var(--vh,1vh)*100);position:fixed;top:0;left:0;touch-action:none;-webkit-overflow-scrolling:auto;overscroll-behavior:none;font-family:Arial;user-select:none;-webkit-user-select:none;
}
#hud{top:max(12px,env(safe-area-inset-top));}
#controls{bottom:max(20px,env(safe-area-inset-bottom));padding-left:max(18px,env(safe-area-inset-left));padding-right:max(18px,env(safe-area-inset-right));}
.btn{touch-action:manipulation;-webkit-touch-callout:none;}
#gameBg{position:fixed;inset:0;z-index:0;background:linear-gradient(180deg,#ffd180 0%,#87ceeb 38%,#7cb342 58%,#4caf50 100%);transition:background 2.5s linear;}
#nightOverlay{position:fixed;inset:0;z-index:0;pointer-events:none;background:#0c1630;opacity:0;transition:opacity 2.5s linear;}
#mountainBack{
position:fixed;
left:0;
right:0;
bottom:24%;
height:30%;
z-index:0;
pointer-events:none;
background:
linear-gradient(180deg,rgba(101,67,33,0) 0%,rgba(58,78,122,.75) 100%);
clip-path:polygon(0 100%,0 60%,9% 42%,18% 66%,28% 36%,38% 68%,49% 34%,61% 64%,71% 42%,81% 70%,91% 46%,100% 62%,100% 100%);
}
#mountainFront{
position:fixed;
left:0;
right:0;
bottom:19%;
height:28%;
z-index:1;
pointer-events:none;
background:
linear-gradient(180deg,rgba(27,50,84,0) 0%,rgba(40,65,92,.9) 100%);
clip-path:polygon(0 100%,0 68%,8% 50%,16% 74%,25% 48%,34% 76%,43% 44%,54% 78%,64% 52%,73% 72%,84% 46%,93% 70%,100% 58%,100% 100%);
opacity:.9;
}
#starLayer{
position:fixed;
inset:0;
z-index:1;
pointer-events:none;
opacity:0;
transition:opacity 2.5s linear;
background:
radial-gradient(1.2px 1.2px at 8% 14%,rgba(255,255,255,.95) 99%,transparent 100%),
radial-gradient(1px 1px at 16% 22%,rgba(255,255,255,.85) 99%,transparent 100%),
radial-gradient(1.4px 1.4px at 24% 10%,rgba(255,255,255,.92) 99%,transparent 100%),
radial-gradient(1.1px 1.1px at 33% 19%,rgba(255,255,255,.9) 99%,transparent 100%),
radial-gradient(1.3px 1.3px at 41% 12%,rgba(255,255,255,.95) 99%,transparent 100%),
radial-gradient(1px 1px at 50% 20%,rgba(255,255,255,.86) 99%,transparent 100%),
radial-gradient(1.4px 1.4px at 58% 9%,rgba(255,255,255,.94) 99%,transparent 100%),
radial-gradient(1px 1px at 66% 17%,rgba(255,255,255,.85) 99%,transparent 100%),
radial-gradient(1.3px 1.3px at 74% 11%,rgba(255,255,255,.9) 99%,transparent 100%),
radial-gradient(1.1px 1.1px at 82% 18%,rgba(255,255,255,.88) 99%,transparent 100%),
radial-gradient(1.4px 1.4px at 90% 13%,rgba(255,255,255,.96) 99%,transparent 100%);
}
#treeLine{
position:fixed;
left:0;
right:0;
bottom:17%;
height:16%;
z-index:1;
pointer-events:none;
background:
radial-gradient(8px 20px at 5% 80%,rgba(18,43,29,.95) 98%,transparent 100%),
radial-gradient(10px 24px at 12% 78%,rgba(20,48,33,.95) 98%,transparent 100%),
radial-gradient(9px 22px at 18% 82%,rgba(22,52,35,.95) 98%,transparent 100%),
radial-gradient(11px 26px at 27% 76%,rgba(21,49,34,.95) 98%,transparent 100%),
radial-gradient(9px 22px at 35% 81%,rgba(20,46,32,.95) 98%,transparent 100%),
radial-gradient(11px 26px at 44% 75%,rgba(21,49,33,.95) 98%,transparent 100%),
radial-gradient(9px 22px at 53% 82%,rgba(19,44,30,.95) 98%,transparent 100%),
radial-gradient(10px 24px at 62% 78%,rgba(20,47,32,.95) 98%,transparent 100%),
radial-gradient(9px 22px at 71% 82%,rgba(20,45,31,.95) 98%,transparent 100%),
radial-gradient(11px 26px at 79% 75%,rgba(22,50,34,.95) 98%,transparent 100%),
radial-gradient(9px 22px at 87% 82%,rgba(20,45,31,.95) 98%,transparent 100%),
radial-gradient(10px 24px at 95% 78%,rgba(19,43,29,.95) 98%,transparent 100%);
opacity:.75;
}
#grassFar{position:fixed;left:0;right:0;bottom:0;height:42%;z-index:0;background:linear-gradient(180deg,#66bb6a 0%,#43a047 55%,#2e7d32 100%);clip-path:polygon(0 22%,8% 18%,16% 24%,24% 16%,32% 26%,40% 19%,48% 27%,56% 20%,64% 28%,72% 21%,80% 26%,88% 19%,100% 24%,100% 100%,0 100%);opacity:.72;}
#grassNear{position:fixed;left:0;right:0;bottom:0;height:32%;z-index:1;background:linear-gradient(180deg,#43a047 0%,#2e7d32 100%);clip-path:polygon(0 30%,10% 22%,20% 33%,30% 20%,40% 35%,50% 24%,60% 34%,70% 21%,80% 31%,90% 23%,100% 33%,100% 100%,0 100%);}
#kolam{position:fixed;left:0;right:0;bottom:0;height:22%;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(46,125,50,0) 0%,#2e7d32 8%,#1976d2 42%,#0d47a1 100%);clip-path:polygon(0 38%,8% 30%,16% 40%,24% 28%,32% 38%,40% 26%,48% 36%,56% 24%,64% 34%,72% 27%,80% 35%,88% 26%,96% 34%,100% 30%,100% 100%,0 100%);transition:background 2.5s linear,filter 2.5s linear;}
#kolam::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(100deg,transparent 0,transparent 16px,rgba(255,255,255,.07) 16px,rgba(255,255,255,.07) 18px);animation:ombakKolam 3.5s linear infinite;}
@keyframes ombakKolam{from{transform:translateX(0);}to{transform:translateX(20px);}}
#bambooLine{position:fixed;left:0;right:0;bottom:20%;height:14%;z-index:1;pointer-events:none;opacity:.55;background:repeating-linear-gradient(90deg,transparent 0,transparent 7%,rgba(85,139,47,.9) 7%,rgba(85,139,47,.9) 7.6%,transparent 7.6%,transparent 14%),repeating-linear-gradient(90deg,transparent 0,transparent 11%,rgba(104,159,56,.75) 11%,rgba(104,159,56,.75) 11.4%,transparent 11.4%,transparent 18%);}
#padiLine{position:fixed;left:0;right:0;bottom:15%;height:8%;z-index:1;pointer-events:none;opacity:.35;background:repeating-linear-gradient(90deg,transparent 0,transparent 3%,rgba(192,202,51,.55) 3%,rgba(192,202,51,.55) 3.4%,transparent 3.4%,transparent 6%);}
#sunMoon{position:fixed;top:30px;right:40px;width:66px;height:66px;border-radius:50%;z-index:2;transition:all 2.5s linear;background:radial-gradient(circle at 34% 34%,#fff59d,#ffd54f 58%,#f9a825 100%);box-shadow:0 0 35px rgba(255,235,59,.65);}
#sunMoon .crater{position:absolute;border-radius:50%;background:rgba(255,255,255,.16);opacity:0;}
#sunMoon .c1{width:12px;height:12px;top:16px;left:16px;}
#sunMoon .c2{width:8px;height:8px;top:34px;left:28px;}
#sunMoon .c3{width:10px;height:10px;top:22px;left:40px;}
#cloudLayer{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;}
.cloudReal{
position:fixed;
height:42px;
border-radius:40px;
background:
radial-gradient(circle at 20% 60%,rgba(255,255,255,.92) 0%,rgba(255,255,255,.75) 45%,rgba(255,255,255,0) 68%),
radial-gradient(circle at 45% 40%,rgba(255,255,255,.95) 0%,rgba(255,255,255,.78) 45%,rgba(255,255,255,0) 70%),
radial-gradient(circle at 72% 62%,rgba(255,255,255,.9) 0%,rgba(255,255,255,.7) 40%,rgba(255,255,255,0) 66%);
filter:drop-shadow(0 6px 8px rgba(70,90,120,.15));
}
#hud{position:fixed;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center;z-index:4;gap:10px;}
#scoreCard{background:rgba(0,0,0,.28);color:#fff;padding:10px 14px;border-radius:14px;font-weight:700;font-size:19px;backdrop-filter:blur(4px);}
#levelWrap{width:150px;height:12px;background:rgba(255,255,255,.4);border-radius:999px;overflow:hidden;box-shadow:inset 0 0 4px rgba(0,0,0,.3);}
#levelBar{height:100%;width:0%;background:linear-gradient(90deg,#81c784,#26a69a,#1e88e5);transition:width .2s linear;}
#faseCuaca{display:block;font-size:11px;font-weight:600;opacity:.88;margin-top:4px;}
#muteBtn{border:none;border-radius:12px;padding:8px 10px;font-size:18px;background:rgba(255,255,255,.9);}
#player{width:100px;height:100px;position:absolute;bottom:120px;left:150px;z-index:2;background-image:url("andhika.jpeg");background-size:cover;background-position:center center;background-repeat:no-repeat;border-radius:50%;border:4px solid white;box-shadow:0 0 15px rgba(255,255,255,.8);transition:transform .12s ease;}
#playerGlow{position:absolute;inset:-10px;border-radius:50%;opacity:0;pointer-events:none;}
#player.healFlash #playerGlow{opacity:1;animation:healFlash .55s ease forwards;background:radial-gradient(circle at 50% 50%,rgba(255,105,180,.65),rgba(255,105,180,0) 70%);}
#player.shieldFlash #playerGlow{opacity:1;animation:shieldFlash .6s ease forwards;background:radial-gradient(circle at 50% 50%,rgba(0,200,255,.55),rgba(0,200,255,0) 70%);}
@keyframes healFlash{0%{transform:scale(.7);opacity:0;}30%{transform:scale(1.05);opacity:1;}100%{transform:scale(1.25);opacity:0;}}
@keyframes shieldFlash{0%{transform:scale(.8);opacity:0;}35%{transform:scale(1.05);opacity:1;}100%{transform:scale(1.25);opacity:0;}}
#shieldAura{position:absolute;inset:-12px;border-radius:50%;opacity:0;pointer-events:none;border:3px solid rgba(120,220,255,.85);box-shadow:0 0 18px rgba(120,220,255,.55),inset 0 0 18px rgba(120,220,255,.25);transform:scale(.92);transition:opacity .25s ease,transform .25s ease;}
#player.shieldOn #shieldAura{opacity:1;transform:scale(1);}
#player.shieldBreak #shieldAura{animation:shieldBreak .28s ease forwards;}
@keyframes shieldBreak{0%{transform:scale(1);opacity:1;}100%{transform:scale(1.15);opacity:0;}}
#gitar{position:absolute;font-size:50px;bottom:130px;left:300px;z-index:2;transition:transform .15s ease;filter:drop-shadow(0 4px 10px rgba(0,0,0,.25));}
.dropGitar{animation:floatItem 1s ease-in-out infinite;}
.hazardBatu{
position:absolute;
z-index:2;
width:40px;
height:40px;
display:flex;
align-items:center;
justify-content:center;
font-size:30px;
filter:drop-shadow(0 5px 8px rgba(0,0,0,.35));
user-select:none;
}
.dropItem{
position:absolute;
z-index:2;
width:40px;
height:40px;
display:flex;
align-items:center;
justify-content:center;
font-size:28px;
filter:drop-shadow(0 6px 10px rgba(0,0,0,.25));
user-select:none;
}
.dropHeart{animation:floatItem 1.2s ease-in-out infinite;}
.dropPancing{animation:floatItem 1.4s ease-in-out infinite;}
.dropIkan{animation:floatItem 1.1s ease-in-out infinite;}
.dropSemangat{animation:floatItem 1.15s ease-in-out infinite;}
.dropKeluarga{position:relative;width:48px;height:48px;padding:0;overflow:visible;}
.dropKeluarga img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.28);}
.dropKeluarga .dropBadge{position:absolute;right:-4px;bottom:-2px;font-size:15px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));}
#penontonKeluarga{position:fixed;left:max(8px,env(safe-area-inset-left));right:max(8px,env(safe-area-inset-right));bottom:108px;z-index:4;display:flex;justify-content:space-between;gap:6px;pointer-events:none;}
.penonton{flex:1;max-width:76px;text-align:center;opacity:.88;transition:transform .2s ease,opacity .2s ease;}
.penonton img{width:52px;height:52px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.9);box-shadow:0 4px 12px rgba(0,0,0,.25);display:block;margin:0 auto 4px;}
.penonton span{font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.65);}
.penonton.sorot{opacity:1;transform:scale(1.08);}
#pesanGame{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.92);z-index:8;padding:12px 16px;border-radius:16px;background:rgba(27,94,32,.94);color:#fff;font-weight:600;font-size:15px;pointer-events:none;opacity:0;transition:opacity .2s ease,transform .2s ease;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:min(92vw,340px);display:flex;align-items:center;gap:10px;text-align:left;line-height:1.35;}
#pesanGame .pesanFoto{width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid #fff;flex-shrink:0;}
#pesanGame.show{opacity:1;transform:translate(-50%,-50%) scale(1);}
#gameOverKeluarga{display:flex;justify-content:center;gap:8px;margin:12px 0 14px;flex-wrap:wrap;}
#gameOverKeluarga img{width:56px;height:56px;border-radius:50%;object-fit:cover;border:3px solid #81c784;box-shadow:0 3px 10px rgba(0,0,0,.15);}
@keyframes floatItem{0%{transform:translateY(0);}50%{transform:translateY(-4px);}100%{transform:translateY(0);}}
#controls{position:fixed;bottom:20px;left:18px;right:18px;display:flex;justify-content:space-between;align-items:center;z-index:4;}
.btn{width:84px;height:84px;font-size:36px;border:none;border-radius:22px;background:rgba(255,255,255,.95);box-shadow:0 5px 16px rgba(0,0,0,.2);}
#particles{position:fixed;inset:0;pointer-events:none;z-index:3;}
.spark{position:absolute;font-size:20px;animation:pop .45s ease forwards;}
@keyframes pop{0%{transform:translateY(0) scale(.6);opacity:1;}100%{transform:translateY(-45px) scale(1.35);opacity:0;}}
#gameOver{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10;display:none;justify-content:center;align-items:center;padding:20px;}
#gameOverBox{width:min(360px,90vw);background:linear-gradient(180deg,#fff,#e8f5e9);border-radius:20px;padding:18px;text-align:center;box-shadow:0 12px 35px rgba(0,0,0,.3);border:2px solid #81c784;}
#gameOverBox .go-sub{color:#2e7d32;font-size:14px;margin:8px 0 14px;line-height:1.45;}
.goBtn{width:100%;padding:12px;border:none;border-radius:12px;font-weight:700;font-size:16px;margin-bottom:10px;}
#btnUlang{background:#43a047;color:#fff;}
#btnQuiz{background:#1e88e5;color:#fff;}
#btnKeluar{background:#eceff1;color:#263238;}
@media (max-width:480px){#scoreCard{font-size:15px;padding:8px 10px;}#levelWrap{width:110px;}.btn{width:min(22vw,84px);height:min(22vw,84px);min-width:72px;min-height:72px;font-size:32px;}.penonton img{width:44px;height:44px;}.penonton{max-width:68px;}}
</style>
<div id="gameBg"></div><div id="nightOverlay"></div><div id="starLayer"></div><div id="mountainBack"></div><div id="mountainFront"></div><div id="treeLine"></div><div id="grassFar"></div><div id="grassNear"></div><div id="padiLine"></div><div id="bambooLine"></div><div id="kolam"></div>
<div id="sunMoon"><span class="crater c1"></span><span class="crater c2"></span><span class="crater c3"></span></div>
<div id="cloudLayer"></div>
<div id="particles"></div>
<div id="pesanGame"></div>
` + htmlPenontonKeluarga() + `
<div id="hud"><div id="scoreCard"><span id="score">❤️❤️❤️ 🎸0 ⭐0</span><span id="faseCuaca">🌅 Pagi di Kolam</span></div><div id="levelWrap" title="Semangat petualang"><div id="levelBar"></div></div><button type="button" id="muteBtn">🔊</button></div>
<div id="player"><div id="playerGlow"></div><div id="shieldAura"></div></div>
<div id="gitar" class="dropGitar" style="position:absolute;top:20px;left:300px;font-size:50px;" title="Tangkap gitar!">🎸</div>
<div id="controls"><button type="button" class="btn" id="btnKiri" aria-label="Gerak kiri">⬅️</button><button type="button" class="btn" id="btnKanan" aria-label="Gerak kanan">➡️</button></div>
<div id="gameOver"><div id="gameOverBox"><h2>🌿 Petualangan Selesai</h2><p class="go-sub">Andhika istirahat di tepi kolam bersama keluarga.</p><div id="gameOverKeluarga"><img src="mama.jpeg" alt="Mama" title="Mama"><img src="papa.jpeg" alt="Papa" title="Papa"><img src="dea.jpeg" alt="Dea" title="Dea"><img src="rani.jpeg" alt="Rani" title="Rani"></div><p id="finalScore">Skor Akhir: 0</p><button id="btnUlang" class="goBtn" onclick="location.reload()">🎮 Petualangan Lagi</button><button id="btnQuiz" class="goBtn" onclick="bukaQuizAndhika()">🧠 Main Quiz Andhika</button><button id="btnKeluar" class="goBtn" onclick="tutupGameOver()">Lihat Pemandangan</button></div></div>
`;
document.body.style.background = "linear-gradient(180deg,#87ceeb 0%,#87ceeb 60%,#7cb342 60%,#4caf50 100%)";
document.documentElement.style.background = "linear-gradient(180deg,#87ceeb 0%,#87ceeb 60%,#7cb342 60%,#4caf50 100%)";
window.posisi = 150; window.skor = 0; window.nyawa = 3; window.gitarTangkap = 0; window.ikanTangkap = 0; window.gameSelesai = false; window.muted = false; window.faseCuacaAktif = "pagi";
window.suaraTangkap = new Audio("tangkap.mp3");
window.suaraNice = new Audio("nice.mp3");
window.suaraBagus = new Audio("bagus.mp3");
window.suaraMantap = new Audio("mantap.mp3");
window.bgm = new Audio("backsound.mp3");
bgm.loop = true;
bgm.volume = 0.28;
suaraTangkap.volume = 0.6;
suaraNice.volume = 0.45;
suaraBagus.volume = 0.45;
suaraMantap.volume = 0.5;
siapkanAudioEl(bgm);
siapkanAudioEl(suaraTangkap);
siapkanAudioEl(suaraNice);
siapkanAudioEl(suaraBagus);
siapkanAudioEl(suaraMantap);
window.yGitar = 20; window.waktuCuaca = 0; window.cloudData = []; window.bomList = []; window.invulnFrames = 0;
window.heartList = []; window.shieldList = []; window.foodList = []; window.shieldActive = false; window.frameTick = 0;
window.nextHeartAt = 220; window.nextShieldAt = 380; window.nextFoodAt = 120; window.nextFoodAnggota = "dea";
if(gameLoopId){clearInterval(gameLoopId);}
setupGameMobile();
bukaAudioMobile();
createClouds();
updateCuaca();
updateHud();
tampilkanPesan("Semangat, Nak! Keluarga nonton ya", "mama");
gameLoopId = setInterval(function(){
if(gameSelesai){return;}
frameTick++;
if(invulnFrames > 0){invulnFrames--;}
let kecepatan = 5;
if(skor >= 50){kecepatan = 7;}
if(skor >= 100){kecepatan = 10;}
if(skor >= 150){kecepatan = 13;}
if(skor >= 200){kecepatan = 16;}
yGitar += kecepatan;
document.getElementById("gitar").style.top = yGitar + "px";
updateClouds();
cekTabrak();
updateDrops(kecepatan);
updateBom(kecepatan);
updateCuaca();
if(frameTick > 0 && frameTick % 520 === 0 && Math.random() < 0.22){
semangatAaAcak();
}
if(yGitar > (window.batasJatuhGitar || 500)){
nyawa--;
tampilkanPesan("Gitar lepas! Hati-hati ya", "mama");
updateHud();
if(nyawa <= 0){
gameSelesai = true;
if(gameLoopId){clearInterval(gameLoopId);gameLoopId = null;}
if(window.bgm){bgm.pause();}
document.getElementById("finalScore").innerText = "Skor: " + skor + " · Gitar: " + gitarTangkap + " · Ikan: " + ikanTangkap;
document.getElementById("gameOver").style.display = "flex";
}
yGitar = 20;
}
},50);
}

window.addEventListener("load", function(){
aturTinggiLayar();
pasangResizeLayar();
var btnMulai = document.getElementById("btnMulai");
if(btnMulai){
pasangTombolAksi(btnMulai, function(){
mulaiGame();
});
}
if(sessionStorage.getItem("quizInviteShown") === "1"){
return;
}
sessionStorage.setItem("quizInviteShown", "1");
setTimeout(function(){
let invite = document.createElement("div");
invite.className = "quiz-invite";
invite.innerHTML = '<strong>🧠 Istirahat sebentar? Coba Quiz Andhika!</strong><span class="invite-go">Main Quiz</span><button class="invite-close" aria-label="Tutup">×</button>';
document.body.appendChild(invite);
invite.addEventListener("click", function(e){
if(e.target.classList.contains("invite-close")){
invite.remove();
return;
}
location.href = "index.html";
});
}, 500);
});

function updateHud(){
document.getElementById("score").innerText = "❤️".repeat(Math.max(nyawa,0)) + " 🎸" + gitarTangkap + " ⭐" + skor;
let progress = Math.min((skor % 50) * 2, 100);
document.getElementById("levelBar").style.width = progress + "%";
}

function tampilkanPesan(teks, idAnggota){
let el = document.getElementById("pesanGame");
if(!el){return;}
if(idAnggota && KELUARGA[idAnggota]){
let k = KELUARGA[idAnggota];
el.innerHTML = '<img class="pesanFoto" src="' + k.foto + '" alt="' + k.nama + '"><span><strong>' + k.nama + ":</strong> " + teks + "</span>";
sorotPenonton(idAnggota);
}else{
el.innerHTML = teks;
sorotPenonton(null);
}
el.classList.add("show");
clearTimeout(window.pesanTimer);
window.pesanTimer = setTimeout(function(){
el.classList.remove("show");
sorotPenonton(null);
}, 1400);
}

function createClouds(){
let layer = document.getElementById("cloudLayer");
for(let i=0;i<9;i++){
let awan = document.createElement("div");
awan.className = "cloudReal";
let w = 100 + Math.random() * 110;
let h = 28 + Math.random() * 28;
let top = 14 + Math.random() * 165;
let left = Math.random() * (window.innerWidth + 180) - 120;
let speed = 0.35 + Math.random() * 0.7;
awan.style.width = w + "px";
awan.style.height = h + "px";
awan.style.top = top + "px";
awan.style.left = left + "px";
awan.style.opacity = (0.38 + Math.random() * 0.42).toFixed(2);
layer.appendChild(awan);
cloudData.push({el:awan,x:left,speed:speed,width:w});
}
}

function updateClouds(){
for(let i=0;i<cloudData.length;i++){
let c = cloudData[i];
c.x += c.speed;
if(c.x > window.innerWidth + 40){
c.x = -c.width - (Math.random() * 150);
}
c.el.style.left = c.x + "px";
}
}

function buatBom(){
let batu = document.createElement("div");
batu.className = "hazardBatu";
batu.innerText = "🪨";
batu.title = "Batu di kolam";
document.body.appendChild(batu);
let startX = ambilPosisiSpawn(90);
return {el:batu,x:startX,y:-60,speed:6};
}

function updateBom(kecepatan){
let levelBom = Math.min(1 + Math.floor(skor / 60), 4);
if(bomList.length < levelBom && Math.random() < 0.06){
bomList.push(buatBom());
}
for(let i=0;i<bomList.length;i++){
let b = bomList[i];
b.speed = kecepatan + 2 + (levelBom * 0.8);
b.y += b.speed;
b.el.style.left = b.x + "px";
b.el.style.top = b.y + "px";
if(kenaBomDenganAkurat(b)){
if(invulnFrames > 0){
continue;
}
b.el.remove();
bomList.splice(i,1);
i--;
if(shieldActive){
pecahShield();
tampilkanPesan("Pancing Papa menahan batu!", "papa");
continue;
}
nyawa--;
tampilkanPesan("Hati-hati batu di kolam!", "mama");
spawnPartikel(posisi + 50, zonaPemain().top + 40, "batu");
updateHud();
if(nyawa <= 0){
gameSelesai = true;
if(gameLoopId){clearInterval(gameLoopId);gameLoopId = null;}
if(window.bgm){bgm.pause();}
document.getElementById("finalScore").innerText = "Skor: " + skor + " · Gitar: " + gitarTangkap + " · Ikan: " + ikanTangkap;
document.getElementById("gameOver").style.display = "flex";
}
continue;
}
if(b.y > (window.batasHapusItem || 560)){
b.el.remove();
bomList.splice(i,1);
i--;
}
}
}

function updateDrops(kecepatan){
updateFood(kecepatan);
updateHeart(kecepatan);
updateShield(kecepatan);
}

function updateFood(kecepatan){
if(frameTick > nextFoodAt && foodList.length < 1){
let anggota = nextFoodAnggota;
nextFoodAnggota = anggota === "dea" ? "rani" : "dea";
let f = buatDropKeluarga(anggota, anggota === "dea" ? "dropIkan" : "dropSemangat");
document.body.appendChild(f);
let x = ambilPosisiSpawn(85);
foodList.push({el:f,x:x,y:-60,speed:kecepatan + 1,anggota:anggota});
nextFoodAt = frameTick + (170 + Math.floor(Math.random() * 150));
}
for(let i=0;i<foodList.length;i++){
let it = foodList[i];
it.y += (kecepatan + 1);
it.el.style.left = it.x + "px";
it.el.style.top = it.y + "px";
var zFood = zonaPemain();
if(Math.abs((posisi + 50) - (it.x + 20)) < 52 && it.y > zFood.top - 70 && it.y < zFood.bottom + 30){
it.el.remove();
foodList.splice(i,1);
i--;
if(it.anggota === "rani"){
skor += 3;
updateHud();
semangatAa("rani", "+3");
spawnPartikel(posisi + 50, it.y, "gitar");
}else{
skor += 5;
ikanTangkap++;
updateHud();
semangatAa("dea", "Ikan gabus +5");
spawnPartikel(posisi + 50, it.y, "ikan");
}
continue;
}
if(it.y > (window.batasHapusItem || 560)){
it.el.remove();
foodList.splice(i,1);
i--;
}
}
}

function updateHeart(kecepatan){
if(nyawa < 5 && frameTick > nextHeartAt && heartList.length < 1){
let h = buatDropKeluarga("mama", "dropHeart");
document.body.appendChild(h);
let x = ambilPosisiSpawn(90);
heartList.push({el:h,x:x,y:-60,speed:kecepatan + 1});
nextHeartAt = frameTick + (320 + Math.floor(Math.random() * 220));
}
for(let i=0;i<heartList.length;i++){
let it = heartList[i];
it.y += (kecepatan + 1);
it.el.style.left = it.x + "px";
it.el.style.top = it.y + "px";
var zH = zonaPemain();
if(Math.abs(posisi - it.x) < 55 && it.y > zH.top - 75 && it.y < zH.bottom + 25){
it.el.remove();
heartList.splice(i,1);
i--;
nyawa = Math.min(nyawa + 1, 5);
flashHeal();
tampilkanPesan("Semangat dari Mama! Nyawa pulih", "mama");
updateHud();
continue;
}
if(it.y > (window.batasHapusItem || 560)){
it.el.remove();
heartList.splice(i,1);
i--;
}
}
}

function updateShield(kecepatan){
if(!shieldActive && frameTick > nextShieldAt && shieldList.length < 1){
let s = buatDropKeluarga("papa", "dropPancing");
document.body.appendChild(s);
let x = ambilPosisiSpawn(95);
shieldList.push({el:s,x:x,y:-60,speed:kecepatan + 1});
nextShieldAt = frameTick + (420 + Math.floor(Math.random() * 260));
}
for(let i=0;i<shieldList.length;i++){
let it = shieldList[i];
it.y += (kecepatan + 1);
it.el.style.left = it.x + "px";
it.el.style.top = it.y + "px";
var zS = zonaPemain();
if(Math.abs(posisi - it.x) < 55 && it.y > zS.top - 75 && it.y < zS.bottom + 25){
it.el.remove();
shieldList.splice(i,1);
i--;
aktifkanShield();
tampilkanPesan("Pancing Papa siap! Lindungi dari batu", "papa");
continue;
}
if(it.y > (window.batasHapusItem || 560)){
it.el.remove();
shieldList.splice(i,1);
i--;
}
}
}

function aktifkanShield(){
shieldActive = true;
let p = document.getElementById("player");
p.classList.add("shieldOn");
p.classList.add("shieldFlash");
setTimeout(function(){ p.classList.remove("shieldFlash"); },650);
}

function pecahShield(){
shieldActive = false;
let p = document.getElementById("player");
p.classList.remove("shieldOn");
p.classList.add("shieldBreak");
setTimeout(function(){ p.classList.remove("shieldBreak"); },300);
}

function flashHeal(){
let p = document.getElementById("player");
p.classList.add("healFlash");
setTimeout(function(){ p.classList.remove("healFlash"); },600);
}

function kenaBomDenganAkurat(b){
let z = zonaPemain();
let playerLeft = z.left;
let playerTop = z.top;
let playerRight = z.right;
let playerBottom = z.bottom;
let bombLeft = b.x + 4;
let bombTop = b.y + 4;
let bombRight = bombLeft + 26;
let bombBottom = bombTop + 26;
let overlapX = Math.min(playerRight, bombRight) - Math.max(playerLeft, bombLeft);
let overlapY = Math.min(playerBottom, bombBottom) - Math.max(playerTop, bombTop);
return overlapX > 12 && overlapY > 12;
}

function ambilPosisiSpawn(minGap){
let minX = 20;
let maxX = Math.max(window.innerWidth - 60, 140);
for(let t=0;t<12;t++){
let kandidat = Math.floor(Math.random() * (maxX - minX)) + minX;
if(posisiSpawnAman(kandidat, minGap)){
return kandidat;
}
}
return Math.floor(Math.random() * (maxX - minX)) + minX;
}

function posisiSpawnAman(x, minGap){
let area = [];
for(let i=0;i<bomList.length;i++){ area.push(bomList[i].x); }
for(let i=0;i<heartList.length;i++){ area.push(heartList[i].x); }
for(let i=0;i<shieldList.length;i++){ area.push(shieldList[i].x); }
for(let i=0;i<foodList.length;i++){ area.push(foodList[i].x); }
let gx = parseInt(document.getElementById("gitar").style.left || 300);
area.push(gx);
for(let i=0;i<area.length;i++){
if(Math.abs(area[i] - x) < minGap){
return false;
}
}
return true;
}

function updateCuaca(){
waktuCuaca = (waktuCuaca + 0.0025) % 1;
let fase = "";
if(waktuCuaca < 0.25){fase = "pagi";}
else if(waktuCuaca < 0.5){fase = "siang";}
else if(waktuCuaca < 0.75){fase = "sore";}
else{fase = "malam";}
faseCuacaAktif = fase;
let bg = document.getElementById("gameBg");
let overlay = document.getElementById("nightOverlay");
let star = document.getElementById("starLayer");
let kolam = document.getElementById("kolam");
let faseLabel = document.getElementById("faseCuaca");
let sunMoon = document.getElementById("sunMoon");
let crater = sunMoon.querySelectorAll(".crater");
let teksFase = {pagi:"🌅 Pagi di Kolam",siang:"☀️ Siang di Sawah",sore:"🌇 Sore Menjelang",malam:"🌙 Malam di Tepi Air"};
if(faseLabel){faseLabel.innerText = teksFase[fase] || "";}
if(fase === "pagi"){
bg.style.background = "linear-gradient(180deg,#ffd180 0%,#87ceeb 38%,#7cb342 58%,#4caf50 100%)";
if(kolam){kolam.style.background = "linear-gradient(180deg,rgba(46,125,50,0) 0%,#388e3c 8%,#4fc3f7 45%,#0288d1 100%)";}
overlay.style.opacity = "0";
star.style.opacity = "0";
sunMoon.style.top = "28px";
sunMoon.style.right = "30px";
sunMoon.style.width = "62px";
sunMoon.style.height = "62px";
sunMoon.style.background = "radial-gradient(circle at 34% 34%,#fff8c2,#ffd54f 58%,#f9a825 100%)";
sunMoon.style.boxShadow = "0 0 32px rgba(255,210,100,.58)";
crater.forEach(function(c){c.style.opacity="0";});
}
else if(fase === "siang"){
bg.style.background = "linear-gradient(180deg,#90caf9 0%,#64b5f6 40%,#7cb342 60%,#4caf50 100%)";
if(kolam){kolam.style.background = "linear-gradient(180deg,rgba(46,125,50,0) 0%,#43a047 8%,#29b6f6 42%,#0277bd 100%)";}
overlay.style.opacity = "0";
star.style.opacity = "0";
sunMoon.style.top = "20px";
sunMoon.style.right = "60px";
sunMoon.style.width = "70px";
sunMoon.style.height = "70px";
sunMoon.style.background = "radial-gradient(circle at 30% 30%,#fffde7,#ffe082 55%,#fbc02d 100%)";
sunMoon.style.boxShadow = "0 0 40px rgba(255,235,120,.7)";
crater.forEach(function(c){c.style.opacity="0";});
}
else if(fase === "sore"){
bg.style.background = "linear-gradient(180deg,#ff8a65 0%,#ffb74d 40%,#7cb342 60%,#4caf50 100%)";
if(kolam){kolam.style.background = "linear-gradient(180deg,rgba(46,125,50,0) 0%,#558b2f 8%,#4db6ac 42%,#00695c 100%)";}
overlay.style.opacity = "0.08";
star.style.opacity = "0.06";
sunMoon.style.top = "36px";
sunMoon.style.right = "36px";
sunMoon.style.width = "60px";
sunMoon.style.height = "60px";
sunMoon.style.background = "radial-gradient(circle at 34% 34%,#ffe0b2,#ffb74d 58%,#f57c00 100%)";
sunMoon.style.boxShadow = "0 0 28px rgba(255,167,38,.55)";
crater.forEach(function(c){c.style.opacity="0";});
}
else{
bg.style.background = "linear-gradient(180deg,#1a237e 0%,#283593 42%,#33691e 62%,#2e7d32 100%)";
if(kolam){kolam.style.background = "linear-gradient(180deg,rgba(46,125,50,0) 0%,#1b5e20 8%,#1565c0 40%,#0d47a1 100%)";kolam.style.filter = "brightness(.85)";}
overlay.style.opacity = "0.28";
star.style.opacity = "0.9";
sunMoon.style.top = "26px";
sunMoon.style.right = "42px";
sunMoon.style.width = "56px";
sunMoon.style.height = "56px";
sunMoon.style.background = "radial-gradient(circle at 30% 30%,#f5f5f5,#cfd8dc 62%,#90a4ae 100%)";
sunMoon.style.boxShadow = "0 0 24px rgba(207,216,220,.5)";
crater.forEach(function(c){c.style.opacity=".95";});
}
if(fase !== "malam" && kolam){kolam.style.filter = "none";}
}

function mainkanSuara(audio){
if(muted || !audio){return;}
if(!window.efekSuaraTerbuka){
bukaEfekSuara();
}
audio.currentTime = 0;
audio.play().catch(function(){});
}

function toggleMute(){
muted = !muted;
document.getElementById("muteBtn").innerText = muted ? "🔇" : "🔊";
if(muted){
if(window.bgm){bgm.pause();}
}
else{
mulaiBacksound();
}
}

function tutupGameOver(){
document.getElementById("gameOver").style.display = "none";
}

function bukaQuizAndhika(){
location.href = "index.html";
}

function animasiGerak(arah){
let player = document.getElementById("player");
player.style.transform = arah === "kiri" ? "translateX(-3px) scale(1.04)" : "translateX(3px) scale(1.04)";
setTimeout(function(){ player.style.transform = "translateX(0) scale(1)"; },120);
}

function spawnPartikel(x,y,jenis){
let wadah = document.getElementById("particles");
let ikon = "✨";
if(jenis === "gitar"){ikon = "🎵";}
else if(jenis === "ikan"){ikon = "🐟";}
else if(jenis === "batu"){ikon = "💦";}
for(let i=0;i<6;i++){
let bintang = document.createElement("span");
bintang.className = "spark";
bintang.innerText = ikon;
bintang.style.left = (x + (Math.random()*30-15)) + "px";
bintang.style.top = (y + (Math.random()*20-10)) + "px";
wadah.appendChild(bintang);
setTimeout(function(){ bintang.remove(); },450);
}
}

function kiri(){
if(gameSelesai){return;}
posisi -= 20;
if(posisi < 0){ posisi = 0; }
document.getElementById("player").style.left = posisi + "px";
animasiGerak("kiri");
cekTabrak();
}

function kanan(){
if(gameSelesai){return;}
posisi += 20;
let batasKanan = (window.lebarMain || window.innerWidth) - 100;
if(posisi > batasKanan){ posisi = batasKanan; }
document.getElementById("player").style.left = posisi + "px";
animasiGerak("kanan");
cekTabrak();
}

function cekTabrak(){
if(gameSelesai){return;}
let gitar = document.getElementById("gitar");
let gx = parseInt(gitar.style.left || 300);
let gy = parseInt(gitar.style.top || 20);
var zG = zonaPemain();
if(Math.abs(posisi - gx) < 45 && gy > zG.top - 40){
skor += 10;
gitarTangkap++;
invulnFrames = 8;
mainkanSuara(suaraTangkap);
if(skor % 30 === 0){ mainkanSuara(suaraMantap); semangatAa(Math.random() < 0.5 ? "dea" : "rani", "Mantap petikannya!"); }
else if(skor % 20 === 0){ mainkanSuara(suaraBagus); semangatAa(Math.random() < 0.5 ? "rani" : "dea", "Gitar ketangkap!"); }
else if(skor % 10 === 0){ mainkanSuara(suaraNice); semangatAa("rani", "+10"); }
else if(skor % 5 === 0){ semangatAa("dea"); }
else{ tampilkanPesan("Petikan gitar! +10"); }
yGitar = 20;
gitar.style.top = yGitar + "px";
gitar.style.transform = "scale(1.5)";
updateHud();
spawnPartikel(posisi + 50, gy, "gitar");
bersihkanBomDekatPemain();
gx = Math.floor(Math.random() * Math.max(window.innerWidth - 120, 200)) + 40;
gitar.style.left = gx + "px";
setTimeout(function(){ gitar.style.transform = "scale(1)"; },150);
}
}

function bersihkanBomDekatPemain(){
for(let i=0;i<bomList.length;i++){
let b = bomList[i];
var zB = zonaPemain();
if(Math.abs(posisi - b.x) < 70 && b.y > zB.top - 90 && b.y < zB.bottom + 40){
b.el.remove();
bomList.splice(i,1);
i--;
}
}
}
