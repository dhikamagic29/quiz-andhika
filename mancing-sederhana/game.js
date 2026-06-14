(function(){
  var FASE = {SIAP:"siap",TURUN:"turun",DASAR:"dasar",SERANG:"serang",TARIK:"tarik"};
  var fase = FASE.SIAP;
  var skor = 0;
  var muted = false;
  var posisiUmpan = 50;
  var kedalamanUmpan = 0;
  var targetKedalaman = 78;
  var ikanList = [];
  var timerSerang = null;
  var timerGigit = null;
  var ikanPenyerang = null;
  var ikanTertangkap = null;
  var ritmeLure = 0;
  var strikePower = 46;
  var hookProgress = 0;
  var outsideZoneMs = 0;
  var tarikOffsetX = 0;
  var tarikOffsetY = 0;
  var ikanPenasaran = null;
  var arahLure = 0;
  var momentumLure = 0;
  var strikeZoneMin = 38;
  var strikeZoneMax = 66;
  var strikeOutsideLimit = 1000;
  var levelLawanIkan = 0.75;
  var burstLawanMs = 0;
  var cooldownBurstMs = 0;
  var bubbleCooldown = 0;
  var bgm = null;
  var suaraSukses = [];
  var audioTerbuka = false;
  var bgmDiamSiap = false;

  var jenisIkan = [
    {nama:"Nila Danau",poin:8,gambar:"assets/fish/fish-1.svg"},
    {nama:"Mas Andhika",poin:14,gambar:"assets/fish/fish-2.svg"},
    {nama:"Gabus Air Dalam",poin:22,gambar:"ikan gabus.webp",jenis:"gabus"},
    {nama:"Toman Danau",poin:34,gambar:"assets/fish/fish-4.svg"}
  ];

  var el = {
    menu: document.getElementById("layarMenu"),
    game: document.getElementById("layarGame"),
    btnMulai: document.getElementById("btnMulai"),
    btnLempar: document.getElementById("btnLempar"),
    btnTarik: document.getElementById("btnTarik"),
    btnKiri: document.getElementById("btnKiri"),
    btnKanan: document.getElementById("btnKanan"),
    btnMute: document.getElementById("btnMute"),
    kolam: document.getElementById("kolam"),
    gelembungLayer: document.getElementById("gelembungLayer"),
    areaIkan: document.getElementById("areaIkan"),
    umpan: document.getElementById("umpan"),
    imgLure: document.getElementById("imgLure"),
    tali: document.getElementById("tali"),
    taliGaris: document.getElementById("taliGaris"),
    pesanFase: document.getElementById("pesanFase"),
    skor: document.getElementById("skor"),
    storageBox: document.getElementById("storageBox"),
    panelSerang: document.getElementById("panelSerang"),
    toast: document.getElementById("toast"),
    ritme: document.getElementById("ritme"),
    barPower: document.getElementById("barPower"),
    pemancing: document.getElementById("pemancing"),
    fotoAndhika: document.getElementById("fotoAndhika"),
    menuFotoAndhika: document.getElementById("menuFotoAndhika"),
    audioBgm: document.getElementById("audioBgm"),
    audioTangkap: document.getElementById("audioTangkap"),
    audioNice: document.getElementById("audioNice"),
    audioBagus: document.getElementById("audioBagus"),
    audioMantap: document.getElementById("audioMantap")
  };

  function aturTinggi(){
    var h = window.innerHeight;
    document.documentElement.style.setProperty("--vh", (h * 0.01) + "px");
    document.body.style.height = h + "px";
  }

  function tampilkanToast(teks){
    el.toast.textContent = teks;
    el.toast.classList.add("tampil");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(function(){
      el.toast.classList.remove("tampil");
    }, 1400);
  }

  function setFase(teks, f){
    fase = f;
    el.pesanFase.textContent = teks;
  }

  function updateSkor(){
    el.skor.textContent = skor;
    if(el.storageBox){
      el.storageBox.classList.toggle("penuh", skor >= 80);
    }
  }

  function updateRitme(){
    el.ritme.textContent = Math.round(ritmeLure);
  }

  function animasiMasukStorage(ikanEl, selesai){
    if(!ikanEl || !el.storageBox){
      if(selesai){selesai();}
      return;
    }
    var dari = ikanEl.getBoundingClientRect();
    var ke = el.storageBox.getBoundingClientRect();
    var lompatan = ikanEl.cloneNode(true);
    lompatan.classList.remove("menyerang","tertarik","menerkam","kiri");
    lompatan.classList.add("ikan-lompat");
    lompatan.style.left = dari.left + "px";
    lompatan.style.top = dari.top + "px";
    document.body.appendChild(lompatan);
    requestAnimationFrame(function(){
      lompatan.style.left = (ke.left + (ke.width / 2) - 22) + "px";
      lompatan.style.top = (ke.top + 20) + "px";
      lompatan.style.transform = "translateY(-10px) scale(0.4) rotate(-20deg)";
      lompatan.style.opacity = "0.15";
    });
    setTimeout(function(){
      lompatan.remove();
      if(selesai){selesai();}
    }, 570);
  }

  function updateBarStrike(){
    if(!el.barPower){return;}
    el.barPower.style.width = Math.max(0, Math.min(100, strikePower)) + "%";
  }

  function siapkanAudioEl(a){
    if(!a){return;}
    a.preload = "auto";
    a.setAttribute("playsinline", "");
    a.setAttribute("webkit-playsinline", "");
  }

  function inisialisasiAudio(){
    if(!bgm && el.audioBgm){
      bgm = el.audioBgm;
      bgm.loop = true;
      bgm.volume = 0.28;
      siapkanAudioEl(bgm);
    }
    if(suaraSukses.length === 0){
      suaraSukses = [el.audioTangkap, el.audioNice, el.audioBagus, el.audioMantap].filter(function(a){
        return !!a;
      });
      for(var i = 0; i < suaraSukses.length; i++){
        suaraSukses[i].volume = 0.55;
        siapkanAudioEl(suaraSukses[i]);
      }
    }
  }

  function bukaEfekSuara(){
    if(audioTerbuka){return;}
    inisialisasiAudio();
    for(var i = 0; i < suaraSukses.length; i++){
      (function(a){
        var volAsli = a.volume;
        a.volume = 0.01;
        var j = a.play();
        if(j && j.then){
          j.then(function(){
            a.pause();
            a.currentTime = 0;
            a.volume = volAsli;
          }).catch(function(){
            a.volume = volAsli;
          });
        }else{
          a.volume = volAsli;
        }
      })(suaraSukses[i]);
    }
    audioTerbuka = true;
  }

  function siapkanBacksoundDiam(){
    if(muted || bgmDiamSiap){return;}
    inisialisasiAudio();
    if(!bgm){return;}
    bgm.muted = true;
    var j = bgm.play();
    if(j && j.then){
      j.then(function(){
        bgmDiamSiap = true;
      }).catch(function(){});
    }else{
      bgmDiamSiap = true;
    }
  }

  function putarBacksound(){
    if(muted){return;}
    inisialisasiAudio();
    bukaEfekSuara();
    if(!bgm){return;}
    bgm.muted = false;
    bgm.volume = 0.28;
    if(bgmDiamSiap && !bgm.paused){
      return;
    }
    var j = bgm.play();
    if(j && j.then){
      j.then(function(){
        bgmDiamSiap = true;
      }).catch(function(){});
    }
  }

  function hentikanBacksound(){
    if(!bgm){return;}
    bgm.pause();
  }

  function putarSuaraSukses(){
    if(muted){return;}
    inisialisasiAudio();
    bukaEfekSuara();
    if(suaraSukses.length){
      var pilih = suaraSukses[Math.floor(Math.random() * suaraSukses.length)];
      pilih.currentTime = 0;
      var j = pilih.play();
      if(j && j.then){
        j.catch(function(){
          putarSuaraFallback();
        });
        return;
      }
      return;
    }
    putarSuaraFallback();
  }

  function putarSuaraFallback(){
    if(!("speechSynthesis" in window)){return;}
    var kata = ["Mantap!", "Bagus!", "Nice strike!"];
    var u = new SpeechSynthesisUtterance(kata[Math.floor(Math.random() * kata.length)]);
    u.lang = "id-ID";
    u.rate = 1.02;
    u.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function aktifkanAudioDariTap(){
    muted = false;
    inisialisasiAudio();
    siapkanBacksoundDiam();
    putarBacksound();
  }

  function munculkanGelembung(jumlah){
    if(!el.gelembungLayer){return;}
    for(var i = 0; i < jumlah; i++){
      var b = document.createElement("span");
      b.className = "gelembung";
      var baseX = posisiUmpan + (Math.random() * 12 - 6);
      b.style.left = Math.max(3, Math.min(95, baseX)) + "%";
      b.style.bottom = (100 - kedalamanUmpan) + "%";
      var size = 6 + Math.random() * 9;
      b.style.width = size + "px";
      b.style.height = size + "px";
      b.style.animationDuration = (1.5 + Math.random() * 1.6) + "s";
      el.gelembungLayer.appendChild(b);
      setTimeout(function(node){
        if(node && node.parentNode){node.remove();}
      }, 3200, b);
    }
  }

  function posisiPx(persen){
    return (el.kolam.clientWidth * persen) / 100;
  }

  function updateTaliDanUmpan(){
    var kolamRect = el.kolam.getBoundingClientRect();
    var x = posisiPx(posisiUmpan);
    var yAtas = 4;
    var yBawah = (kolamRect.height * kedalamanUmpan) / 100;
    x += tarikOffsetX;
    yBawah += tarikOffsetY;
    el.taliGaris.setAttribute("x1", x);
    el.taliGaris.setAttribute("y1", yAtas);
    el.taliGaris.setAttribute("x2", x);
    el.taliGaris.setAttribute("y2", yBawah);
    el.umpan.style.left = posisiUmpan + "%";
    el.umpan.style.top = kedalamanUmpan + "%";
  }

  function pilihIkanPenasaran(){
    if(fase !== FASE.DASAR){ikanPenasaran = null; return;}
    var kandidat = null;
    var jarakMin = 999;
    for(var i = 0; i < ikanList.length; i++){
      var ik = ikanList[i];
      var jarak = jarakUmpanIkan(ik);
      if(jarak < jarakMin){
        jarakMin = jarak;
        kandidat = ik;
      }
    }
    if(!kandidat || ritmeLure < 20 || jarakMin > 28){
      ikanPenasaran = null;
      return;
    }
    ikanPenasaran = kandidat;
  }

  function buatIkan(){
    el.areaIkan.innerHTML = "";
    ikanList = [];
    for(var i = 0; i < 6; i++){
      var j;
      if(i === 0){
        j = jenisIkan[2];
      }else{
        j = jenisIkan[Math.floor(Math.random() * jenisIkan.length)];
      }
      var ikan = document.createElement("div");
      ikan.className = "ikan";
      ikan.innerHTML = '<div class="badan-ikan"><div class="gelombang-ikan"><img class="foto-ikan" alt="ikan"></div><span class="tanda">!</span></div>';
      ikan.dataset.poin = j.poin;
      ikan.dataset.nama = j.nama;
      if(j.jenis === "gabus"){ikan.classList.add("ikan-gabus");}
      ikan.classList.add("berenang");
      var gambarIkan = ikan.querySelector(".foto-ikan");
      gambarIkan.src = j.gambar;
      var x = 8 + Math.random() * 78;
      var y = 62 + Math.random() * 22;
      ikan.style.left = x + "%";
      ikan.style.top = y + "%";
      ikan.dataset.x = x;
      ikan.dataset.y = y;
      ikan.dataset.arah = Math.random() < 0.5 ? "1" : "-1";
      ikan.dataset.kecepatan = (0.08 + Math.random() * 0.14).toFixed(3);
      ikan.dataset.tertarik = "0";
      ikan.dataset.respon = (0.55 + Math.random() * 0.55).toFixed(2);
      ikan.dataset.inersia = "0";
      el.areaIkan.appendChild(ikan);
      ikanList.push(ikan);
    }
  }

  function aturAnimasiIkan(ik, mode, targetX, targetY){
    ik.classList.remove("berenang","mengejar","menyerang-ikan");
    if(mode === "kejar"){
      ik.classList.add("mengejar");
    }else if(mode === "serang"){
      ik.classList.add("menyerang-ikan");
    }else{
      ik.classList.add("berenang");
    }
    var x = parseFloat(ik.dataset.x);
    var y = parseFloat(ik.dataset.y);
    var dx = targetX - x;
    var dy = targetY - y;
    var miring = Math.max(-22, Math.min(22, dy * 1.4 + (mode === "serang" ? 8 : 0)));
    ik.style.setProperty("--miring", miring + "deg");
    ik.classList.toggle("kiri", dx < 0);
  }

  function gerakIkan(){
    if(fase !== FASE.DASAR && fase !== FASE.SERANG){return;}
    for(var i = 0; i < ikanList.length; i++){
      var ik = ikanList[i];
      if((fase === FASE.SERANG && ik === ikanPenyerang) || (fase === FASE.TARIK && ik === ikanTertangkap)){continue;}
      var x = parseFloat(ik.dataset.x);
      var y = parseFloat(ik.dataset.y);
      var arah = parseFloat(ik.dataset.arah);
      var spd = parseFloat(ik.dataset.kecepatan);
      var jarak = jarakUmpanIkan(ik);
      var tertarik = (ik === ikanPenasaran && jarak < 22 && ritmeLure > 28);
      ik.dataset.tertarik = tertarik ? "1" : "0";
      ik.classList.toggle("tertarik", tertarik);

      var targetX = posisiUmpan;
      var targetY = kedalamanUmpan;
      var modeGerak = "berenang";
      var lerp = 0.12;

      if(tertarik){
        modeGerak = "kejar";
        lerp = 0.2 + (ritmeLure / 500);
        var respon = parseFloat(ik.dataset.respon);
        var dorong = Math.max(0.12, (ritmeLure / 95)) * respon;
        if(posisiUmpan > x + 0.9){arah = 1;}
        else if(posisiUmpan < x - 0.9){arah = -1;}
        ik.dataset.arah = arah;
        targetX = posisiUmpan;
        targetY = kedalamanUmpan + (Math.sin(Date.now() / 180) * 0.35);
        x += (posisiUmpan - x) * lerp + (arah * dorong * 0.35);
        y += (targetY - y) * lerp;
      }else{
        var tx = x + arah * spd;
        x += (tx - x) * 0.35;
        if(jarak < 12){
          if(posisiUmpan > x + 0.7){arah = -1;}
          else if(posisiUmpan < x - 0.7){arah = 1;}
          ik.dataset.arah = arah;
          x += (posisiUmpan > x ? -1 : 1) * 0.35;
        }
        targetX = x + arah * 2;
        targetY = y;
      }

      if(x < 4 || x > 88){
        arah *= -1;
        ik.dataset.arah = arah;
      }
      y += (Math.random() - 0.5) * 0.04;
      y = Math.max(58, Math.min(88, y));
      ik.dataset.x = x;
      ik.dataset.y = y;
      ik.style.left = x + "%";
      ik.style.top = y + "%";
      aturAnimasiIkan(ik, modeGerak, targetX, targetY);
    }
  }

  function jarakUmpanIkan(ikan){
    var ux = posisiUmpan;
    var uy = kedalamanUmpan;
    var ix = parseFloat(ikan.dataset.x);
    var iy = parseFloat(ikan.dataset.y);
    var dx = Math.abs(ux - ix);
    var dy = Math.abs(uy - iy);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function cobaSerang(){
    if(fase !== FASE.DASAR){return;}
    var kandidat = [];
    for(var i = 0; i < ikanList.length; i++){
      if(jarakUmpanIkan(ikanList[i]) < 13 && ikanList[i].dataset.tertarik === "1"){
        kandidat.push(ikanList[i]);
      }
    }
    if(kandidat.length === 0){
      if(Math.random() < 0.02){tampilkanToast("Kasih ritme lebih cepat biar ikan mendekat...");}
      return;
    }
    if(Math.random() > (0.15 + (ritmeLure / 500))){return;}
    mulaiSerang(kandidat[Math.floor(Math.random() * kandidat.length)]);
  }

  function mulaiSerang(ikan){
    clearTimeout(timerSerang);
    ikanPenyerang = ikan;
    fase = FASE.SERANG;
    ikan.classList.add("menyerang");
    ikan.classList.remove("tertarik","mengejar","berenang");
    aturAnimasiIkan(ikan, "serang", posisiUmpan, kedalamanUmpan);
    el.umpan.classList.add("menggigit");
    el.panelSerang.classList.remove("tersembunyi");
    el.btnLempar.disabled = true;
    strikePower = 46;
    hookProgress = 0;
    outsideZoneMs = 0;
    strikeZoneMin = 34;
    strikeZoneMax = 70;
    strikeOutsideLimit = 1300;
    levelLawanIkan = 0.62;
    burstLawanMs = 0;
    cooldownBurstMs = 900;
    if(ikan.dataset.nama === "Gabus Air Dalam"){
      strikeZoneMin = 30;
      strikeZoneMax = 80;
      strikeOutsideLimit = 2000;
      strikePower = 52;
      levelLawanIkan = 0.5;
      ikan.classList.add("menerkam");
      el.umpan.classList.add("diguncang-gabus");
      tampilkanToast("GABUS menerkam keras!");
    }
    updateBarStrike();
    el.tali.classList.add("tegang");
    el.pemancing.classList.add("tegang");
    setFase("Strike! Ikan nyamber lure!", FASE.SERANG);
    timerGigit = setTimeout(function(){
      gagalSerang();
    }, 5200);
  }

  function gagalSerang(){
    if(fase !== FASE.SERANG){return;}
    clearTimeout(timerGigit);
    if(ikanPenyerang){ikanPenyerang.classList.remove("menyerang","menerkam");}
    el.umpan.classList.remove("menggigit");
    el.umpan.classList.remove("menggoda");
    el.umpan.classList.remove("diguncang-gabus");
    el.tali.classList.remove("tegang");
    el.pemancing.classList.remove("tegang","supertegang");
    el.panelSerang.classList.add("tersembunyi");
    ikanPenyerang = null;
    ikanTertangkap = null;
    ikanPenasaran = null;
    hookProgress = 0;
    burstLawanMs = 0;
    cooldownBurstMs = 0;
    tarikOffsetX = 0;
    tarikOffsetY = 0;
    setFase("Ikan batal nyamber. Mainkan lure lagi!", FASE.DASAR);
    fase = FASE.DASAR;
    el.btnLempar.disabled = false;
    tampilkanToast("Terlambat strike, ikan lolos");
    jadwalkanSerang();
  }

  function pompaTarik(){
    if(fase !== FASE.SERANG){return;}
    var bonusPompa = (burstLawanMs > 0) ? 4 : 1;
    strikePower = Math.min(100, strikePower + 10 + bonusPompa);
    hookProgress = Math.min(100, hookProgress + (burstLawanMs > 0 ? 8 : 6));
    updateBarStrike();
  }

  function mulaiTarikNaik(){
    if(!ikanPenyerang){return;}
    clearTimeout(timerGigit);
    fase = FASE.TARIK;
    ikanTertangkap = ikanPenyerang;
    ikanPenyerang = null;
    el.panelSerang.classList.add("tersembunyi");
    el.umpan.classList.remove("menggigit");
    setFase("Ikan kena hook! Tarik naik...", FASE.TARIK);
    tampilkanToast("Hookset pas! Naikkan ikan!");
    var poin = parseInt(ikanTertangkap.dataset.poin, 10);
    var nama = ikanTertangkap.dataset.nama;
    var naik = setInterval(function(){
      kedalamanUmpan -= 1.85;
      strikePower = Math.max(26, strikePower - 0.75);
      tarikOffsetX = Math.sin(Date.now() / 90) * 5;
      tarikOffsetY = Math.cos(Date.now() / 120) * 3;
      if(strikePower > 74){
        el.pemancing.classList.add("supertegang");
      }else{
        el.pemancing.classList.remove("supertegang");
      }
      if(ikanTertangkap){
        ikanTertangkap.dataset.x = posisiUmpan + (tarikOffsetX / 4);
        ikanTertangkap.dataset.y = kedalamanUmpan + 2.8;
        ikanTertangkap.style.left = ikanTertangkap.dataset.x + "%";
        ikanTertangkap.style.top = ikanTertangkap.dataset.y + "%";
      }
      updateBarStrike();
      updateTaliDanUmpan();
      if(kedalamanUmpan <= 26){
        clearInterval(naik);
        var ikanUntukAnimasi = ikanTertangkap;
        if(ikanTertangkap){
          ikanTertangkap.classList.remove("menyerang","tertarik","menerkam");
          ikanTertangkap.remove();
          ikanList = ikanList.filter(function(x){return x !== ikanTertangkap;});
        }
        ikanTertangkap = null;
        animasiMasukStorage(ikanUntukAnimasi, function(){
          skor += poin;
          ritmeLure = Math.max(8, ritmeLure - 28);
          updateRitme();
          updateSkor();
          putarSuaraSukses();
          tampilkanToast("Ikan masuk storage! +" + poin);
          selesaiTarik();
        });
      }
    }, 32);
  }

  function selesaiTarik(){
    el.umpan.classList.add("tersembunyi");
    kedalamanUmpan = 0;
    updateTaliDanUmpan();
    if(ikanList.length < 3){buatIkan();}
    setFase("Siap casting lagi", FASE.SIAP);
    fase = FASE.SIAP;
    tarikOffsetX = 0;
    tarikOffsetY = 0;
    strikePower = 46;
    hookProgress = 0;
    burstLawanMs = 0;
    cooldownBurstMs = 0;
    updateBarStrike();
    el.btnLempar.disabled = false;
    el.btnLempar.textContent = "Lempar lure";
    el.tali.classList.remove("tegang");
    el.pemancing.classList.remove("tegang","supertegang");
    el.umpan.classList.remove("diguncang-gabus");
  }

  function jadwalkanSerang(){
    clearTimeout(timerSerang);
    timerSerang = setTimeout(function(){
      cobaSerang();
      if(fase === FASE.DASAR){jadwalkanSerang();}
    }, 650 + Math.random() * 950);
  }

  function lemparUmpan(){
    if(fase !== FASE.SIAP){return;}
    fase = FASE.TURUN;
    el.btnLempar.disabled = true;
    el.btnLempar.textContent = "Lure masuk air...";
    setFase("Casting ke danau...", FASE.TURUN);
    el.umpan.classList.remove("tersembunyi");
    posisiUmpan = 50;
    kedalamanUmpan = 6;
    ritmeLure = 0;
    updateRitme();
    updateTaliDanUmpan();
    var turun = setInterval(function(){
      kedalamanUmpan += 2.2;
      updateTaliDanUmpan();
      if(kedalamanUmpan >= targetKedalaman){
        clearInterval(turun);
        sampaiDasar();
      }
    }, 35);
  }

  function sampaiDasar(){
    fase = FASE.DASAR;
    setFase("Tap kiri/kanan cepat untuk hidupkan lure", FASE.DASAR);
    el.btnLempar.textContent = "Angkat lure";
    el.btnLempar.disabled = false;
    tampilkanToast("Lure masuk air. Mainkan ritmenya!");
    jadwalkanSerang();
  }

  function angkatUmpan(){
    if(fase !== FASE.DASAR){return;}
    clearTimeout(timerSerang);
    fase = FASE.TARIK;
    el.btnLempar.disabled = true;
    var naik = setInterval(function(){
      kedalamanUmpan -= 5;
      updateTaliDanUmpan();
      if(kedalamanUmpan <= 6){
        clearInterval(naik);
        el.umpan.classList.add("tersembunyi");
        setFase("Siap lempar", FASE.SIAP);
        fase = FASE.SIAP;
        el.btnLempar.disabled = false;
        el.btnLempar.textContent = "Lempar lure";
      }
    }, 40);
  }

  function geserUmpan(delta){
    if(fase !== FASE.DASAR && fase !== FASE.SERANG){return;}
    if(fase === FASE.SERANG){return;}
    posisiUmpan = Math.max(8, Math.min(92, posisiUmpan + delta));
    arahLure = delta > 0 ? 1 : -1;
    momentumLure = Math.min(16, momentumLure + Math.abs(delta) * 0.9);
    ritmeLure = Math.min(100, ritmeLure + 10);
    updateRitme();
    el.umpan.classList.add("menggoda");
    clearTimeout(window.godaTimer);
    window.godaTimer = setTimeout(function(){
      el.umpan.classList.remove("menggoda");
    }, 220);
    updateTaliDanUmpan();
  }

  function onLempar(){
    if(fase === FASE.SIAP){lemparUmpan();}
    else if(fase === FASE.DASAR){angkatUmpan();}
  }

  function pasangTombol(btn, fn){
    if(!btn){return;}
    var dariSentuh = false;
    function jalankan(e){
      if(e){e.preventDefault();e.stopPropagation();}
      aktifkanAudioDariTap();
      fn();
    }
    btn.addEventListener("touchstart", function(e){
      dariSentuh = true;
      jalankan(e);
    }, {passive:false});
    btn.addEventListener("touchend", function(){
      setTimeout(function(){dariSentuh = false;},400);
    });
    btn.addEventListener("click", function(e){
      if(dariSentuh){e.preventDefault();return;}
      jalankan(e);
    });
  }

  function mulaiGame(){
    el.menu.classList.add("tersembunyi");
    el.game.classList.remove("tersembunyi");
    skor = 0;
    aktifkanAudioDariTap();
    ritmeLure = 0;
    updateSkor();
    updateRitme();
    fase = FASE.SIAP;
    kedalamanUmpan = 0;
    posisiUmpan = 50;
    el.umpan.classList.add("tersembunyi");
    el.panelSerang.classList.add("tersembunyi");
    el.tali.classList.remove("tegang");
    el.pemancing.classList.remove("tegang","supertegang");
    strikePower = 46;
    hookProgress = 0;
    tarikOffsetX = 0;
    tarikOffsetY = 0;
    updateBarStrike();
    el.btnLempar.disabled = false;
    el.btnLempar.textContent = "Lempar lure";
    buatIkan();
    updateTaliDanUmpan();
    setFase("Tap Lempar lure", FASE.SIAP);
    aturTinggi();
  }

  function loop(){
    momentumLure = Math.max(0, momentumLure - 0.22);
    if(momentumLure < 0.2){
      arahLure = 0;
    }
    if(fase === FASE.DASAR && ritmeLure > 0){
      ritmeLure = Math.max(0, ritmeLure - 0.12);
      updateRitme();
    }
    bubbleCooldown = Math.max(0, bubbleCooldown - 16);
    if((fase === FASE.TURUN || fase === FASE.DASAR || fase === FASE.SERANG || fase === FASE.TARIK) && kedalamanUmpan > 12 && bubbleCooldown <= 0){
      var jumlah = (fase === FASE.SERANG) ? 3 : ((fase === FASE.DASAR && ritmeLure > 26) ? 2 : 1);
      munculkanGelembung(jumlah);
      bubbleCooldown = (fase === FASE.SERANG) ? 130 : 220;
    }
    pilihIkanPenasaran();
    gerakIkan();
    if(fase === FASE.SERANG){
      var gabusStrike = ikanPenyerang && ikanPenyerang.dataset.nama === "Gabus Air Dalam";
      cooldownBurstMs = Math.max(0, cooldownBurstMs - 16);
      if(burstLawanMs <= 0 && cooldownBurstMs <= 0 && Math.random() < (gabusStrike ? 0.045 : 0.035)){
        burstLawanMs = gabusStrike ? 620 : 520;
        cooldownBurstMs = gabusStrike ? 1350 : 1150;
        tampilkanToast(gabusStrike ? "Gabus narik ke dalam!" : "Ikan melawan tarikan!");
      }
      burstLawanMs = Math.max(0, burstLawanMs - 16);
      var tarikanIkan = Math.sin(Date.now() / (gabusStrike ? 90 : 120)) * (gabusStrike ? 1.2 : 0.85) + (Math.random() - 0.5) * (gabusStrike ? 0.85 : 0.6);
      var drainDasar = 0.25 + (levelLawanIkan * 0.26);
      var drainBurst = burstLawanMs > 0 ? (gabusStrike ? 1.1 : 0.85) : 0;
      strikePower = Math.max(0, Math.min(100, strikePower - drainDasar - drainBurst + tarikanIkan));
      var dalamZona = strikePower >= strikeZoneMin && strikePower <= strikeZoneMax;
      hookProgress += dalamZona ? 1.05 : -0.55;
      if(burstLawanMs > 0){
        hookProgress -= gabusStrike ? 0.28 : 0.2;
      }
      hookProgress = Math.max(0, Math.min(100, hookProgress));
      outsideZoneMs = dalamZona ? 0 : outsideZoneMs + 16;
      tarikOffsetX = Math.sin(Date.now() / 90) * 4;
      tarikOffsetY = Math.cos(Date.now() / 105) * 2;
      if(ikanPenyerang){
        var sx = parseFloat(ikanPenyerang.dataset.x);
        var sy = parseFloat(ikanPenyerang.dataset.y);
        var tx = posisiUmpan + (tarikOffsetX / 5);
        var ty = kedalamanUmpan + 2.8;
        sx += (tx - sx) * 0.28;
        sy += (ty - sy) * 0.28;
        ikanPenyerang.dataset.x = sx;
        ikanPenyerang.dataset.y = sy;
        ikanPenyerang.style.left = sx + "%";
        ikanPenyerang.style.top = sy + "%";
        aturAnimasiIkan(ikanPenyerang, "serang", tx, ty);
      }
      el.pemancing.classList.toggle("supertegang", strikePower > 76);
      updateBarStrike();
      updateTaliDanUmpan();
      if(outsideZoneMs > strikeOutsideLimit){
        tampilkanToast("Power salah, ikan mocel!");
        gagalSerang();
      }else if(hookProgress >= 100){
        mulaiTarikNaik();
      }
    }else if(fase === FASE.DASAR){
      tarikOffsetX = Math.sin(Date.now() / 280) * (0.5 + ritmeLure / 55);
      tarikOffsetY = Math.cos(Date.now() / 320) * 0.8;
      updateTaliDanUmpan();
    }
    requestAnimationFrame(loop);
  }

  document.addEventListener("touchmove", function(e){
    if(!el.game.classList.contains("tersembunyi")){
      e.preventDefault();
    }
  }, {passive:false});

  pasangTombol(el.btnMulai, mulaiGame);
  pasangTombol(el.btnLempar, onLempar);
  pasangTombol(el.btnTarik, pompaTarik);
  pasangTombol(el.btnKiri, function(){geserUmpan(-4);});
  pasangTombol(el.btnKanan, function(){geserUmpan(4);});

  el.btnMute.addEventListener("click", function(){
    muted = !muted;
    el.btnMute.textContent = muted ? "🔇" : "🔊";
    if(muted){hentikanBacksound();}
    else{putarBacksound();}
  });

  if(el.imgLure){
    if(el.imgLure.complete && el.imgLure.naturalWidth > 0){
      el.umpan.classList.add("pakai-gambar");
    }
    el.imgLure.addEventListener("load", function(){
      el.umpan.classList.add("pakai-gambar");
    });
    el.imgLure.addEventListener("error", function(){
      el.umpan.classList.remove("pakai-gambar");
      el.imgLure.style.display = "none";
    });
  }

  if(el.fotoAndhika){
    var cobaFotoGame = function(){
      if(el.fotoAndhika.dataset.fallback === "copy"){
        el.fotoAndhika.dataset.fallback = "jpg";
        el.fotoAndhika.src = "andhika.jpg";
        return;
      }
      if(el.fotoAndhika.dataset.fallback === "jpg"){
        el.fotoAndhika.style.display = "none";
        return;
      }
      if(el.fotoAndhika.dataset.fallback === "jpeg"){
        el.fotoAndhika.dataset.fallback = "copy";
        el.fotoAndhika.src = "andhika - Copy.jpeg";
      }else{
        el.fotoAndhika.dataset.fallback = "jpeg";
        el.fotoAndhika.src = "andhika.jpeg";
      }
    };
    if(el.fotoAndhika.complete && el.fotoAndhika.naturalWidth === 0){
      cobaFotoGame();
    }
    el.fotoAndhika.addEventListener("error", function(){
      cobaFotoGame();
    });
  }

  if(el.menuFotoAndhika){
    var cobaFotoMenu = function(){
      if(el.menuFotoAndhika.dataset.fallback === "copy"){
        el.menuFotoAndhika.dataset.fallback = "jpg";
        el.menuFotoAndhika.src = "andhika.jpg";
        return;
      }
      if(el.menuFotoAndhika.dataset.fallback === "jpg"){
        el.menuFotoAndhika.style.display = "none";
        return;
      }
      if(el.menuFotoAndhika.dataset.fallback === "jpeg"){
        el.menuFotoAndhika.dataset.fallback = "copy";
        el.menuFotoAndhika.src = "andhika - Copy.jpeg";
      }else{
        el.menuFotoAndhika.dataset.fallback = "jpeg";
        el.menuFotoAndhika.src = "andhika.jpeg";
      }
    };
    if(el.menuFotoAndhika.complete && el.menuFotoAndhika.naturalWidth === 0){
      cobaFotoMenu();
    }
    el.menuFotoAndhika.addEventListener("error", function(){
      cobaFotoMenu();
    });
  }

  window.addEventListener("resize", aturTinggi);
  window.addEventListener("orientationchange", aturTinggi);
  window.addEventListener("load", function(){
    aturTinggi();
    inisialisasiAudio();
    updateBarStrike();
    loop();
  });

  document.body.addEventListener("touchstart", function(){
    siapkanBacksoundDiam();
  }, {once:true, passive:true});

  document.body.addEventListener("click", function(){
    siapkanBacksoundDiam();
  }, {once:true});
})();
