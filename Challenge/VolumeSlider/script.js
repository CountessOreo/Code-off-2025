// ==== Config ====
const COLS = 13, ROWS = 9, CELL_PX = 20, LINE_W = 2;

// ==== State ====
let maze, player, exitCell;
let zapInterval;
let volume = 0;           // 0..1
let volumeLocked = false; // lock guard
let desiredVolumePct = 0; // 0..100
let madeFirstMove = false;
let runawayTries = 0;
let mistakes = 0;

// Wall-bump cooldown
let lastWallBumpAt = 0;
const WALL_COOLDOWN_MS = 120;

// ==== DOM ====
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = COLS * CELL_PX; canvas.height = ROWS * CELL_PX;

const sliderFill = document.getElementById('sliderFill');
const sliderThumb = document.getElementById('sliderThumb');
const volumeLabel = document.getElementById('volumeLabel');
const statusMsg = document.getElementById('statusMsg');

const modal = document.getElementById('modal');
const modalWindow = document.getElementById('modalWindow');
const modalTitle = document.getElementById('modalTitle');
const modalMsg = document.getElementById('modalMsg');
const modalYes = document.getElementById('modalYes');
const modalNo  = document.getElementById('modalNo');
const modalActions = document.getElementById('modalActions');
const spinner = document.getElementById('spinner');

const guideText = document.getElementById('guideText');
const guideSub  = document.getElementById('guideSub');

// ==== Background Music ====
const bgm = document.getElementById('bgm');
bgm.muted = true; bgm.volume = 0;
bgm.play().catch(()=>{});

function bgmTargetFromSlider(){ return Math.max(0, Math.min(1, 0.05 + 0.95 * volume)); }
function fadeBgm(to, ms=1200){
    const from = bgm.volume, start = performance.now();
    function step(t){ const p = Math.min(1, (t - start) / ms); bgm.volume = from + (to - from) * p; if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
}

// ==== Sounds ====
const memeSounds = ["laugh.mp3","bruh.mp3","aaaa.mp3","nana.mp3","hehe.mp3","r2.mp3","hello.mp3","sus.mp3","thud.mp3"];
const soundPool = memeSounds.map(src => { const a = new Audio(src); a.preload = 'auto'; return a; });
const wallSound = new Audio("thud.mp3"); wallSound.preload = 'auto'; wallSound.volume = 0.1;

let audioPrimed = false;
function primeAudio(){
    if (audioPrimed) return;
    audioPrimed = true;
    [...soundPool, wallSound].forEach(a => { try { a.muted = true; a.play().then(()=>{ a.pause(); a.currentTime=0; a.muted=false; }).catch(()=>{ a.muted=false; }); } catch{} });
    bgm.muted = false; bgm.loop = true;
    bgm.play().then(()=> fadeBgm(bgmTargetFromSlider(), 900)).catch(()=> { audioPrimed = false; });
}
window.addEventListener('mousedown', primeAudio, { once:true });
window.addEventListener('keydown',  primeAudio, { once:true });
window.addEventListener('touchstart', primeAudio, { once:true });

function playRandomMemeSound(){
    if (!audioPrimed) return;
    const a = soundPool[Math.floor(Math.random()*soundPool.length)];
    try { a.currentTime = 0; a.play(); } catch {}
}

// ==== Guide helpers ====
function setGuide(main, sub=""){
    guideText.innerHTML = main;
    guideSub.textContent = sub;
}

// ==== Drawing ====
function drawGeckoEye(x, y, r){
    const iris = ctx.createRadialGradient(x - r*0.25, y - r*0.25, r*0.05, x, y, r);
    iris.addColorStop(0, "#bfffe0"); iris.addColorStop(1, "#1aa968");
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fillStyle = iris; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = "#063d2b"; ctx.stroke();
    ctx.save(); ctx.translate(x,y); ctx.rotate(0.03);
    ctx.beginPath(); ctx.moveTo(-r*0.12, -r*0.55); ctx.quadraticCurveTo(0,-r*0.50, r*0.12, -r*0.55);
    ctx.lineTo(r*0.12, r*0.55); ctx.quadraticCurveTo(0, r*0.50, -r*0.12, r*0.55);
    ctx.closePath(); ctx.fillStyle = "#06110d"; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(x - r*0.28, y - r*0.28, r*0.18, 0, Math.PI*2); ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fill();
}
function drawFly(x, y, r){
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.arc(0,0, r*0.22, 0, Math.PI*2); ctx.fillStyle="#0b1b14"; ctx.fill();
    ctx.globalAlpha=.9; ctx.fillStyle="rgba(200,255,255,.75)";
    ctx.beginPath(); ctx.ellipse(-r*0.18, -r*0.05, r*0.18, r*0.10, -0.6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( r*0.18, -r*0.05, r*0.18, r*0.10,  0.6, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha=1; ctx.restore();
}
function drawMaze(){
    ctx.fillStyle = "#08120d"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.lineWidth = LINE_W;
    const wallGrad = ctx.createLinearGradient(0,0,canvas.width, canvas.height);
    wallGrad.addColorStop(0,"#27563e"); wallGrad.addColorStop(0.5,"#2b7a57"); wallGrad.addColorStop(1,"#1f4c37");
    ctx.strokeStyle = wallGrad; ctx.shadowColor = "rgba(52,211,153,.12)"; ctx.shadowBlur = 4;
    for (let r=0;r<ROWS;r++){
    for (let c=0;c<COLS;c++){
        const cell = maze[r][c]; const x = c*CELL_PX; const y = r*CELL_PX;
        ctx.beginPath();
        if (cell.top)    { ctx.moveTo(x,y); ctx.lineTo(x+CELL_PX,y); }
        if (cell.left)   { ctx.moveTo(x,y); ctx.lineTo(x,y+CELL_PX); }
        if (cell.right)  { ctx.moveTo(x+CELL_PX,y); ctx.lineTo(x+CELL_PX,y+CELL_PX); }
        if (cell.bottom) { ctx.moveTo(x,y+CELL_PX); ctx.lineTo(x+CELL_PX,y+CELL_PX); }
        ctx.stroke();
    }
    }
    const exX = exitCell.c*CELL_PX+CELL_PX/2;
    const exY = exitCell.r*CELL_PX+CELL_PX/2; drawFly(exX, exY, CELL_PX*0.55);
    const pX = player.c*CELL_PX+CELL_PX/2; const pY = player.r*CELL_PX+CELL_PX/2; drawGeckoEye(pX, pY, CELL_PX*0.36);
    ctx.shadowBlur = 0;
}

// ==== Maze gen ====
function generateMaze(){
    const grid = Array.from({ length: ROWS }, ()=>Array.from({ length: COLS }, ()=>({ top:true,right:true,bottom:true,left:true,visited:false })));
    const rnd = () => Math.random(); const stack = [];
    player = { c:0, r:Math.floor(rnd()*ROWS) };
    grid[player.r][player.c].visited = true; stack.push(player);
    while (stack.length){
    const {c,r} = stack[stack.length-1]; const neighbors = [];
    if (r>0 && !grid[r-1][c].visited) neighbors.push({c,r:r-1,dir:"up"});
    if (c<COLS-1 && !grid[r][c+1].visited) neighbors.push({c:c+1,r,dir:"right"});
    if (r<ROWS-1 && !grid[r+1][c].visited) neighbors.push({c,r:r+1,dir:"down"});
    if (c>0 && !grid[r][c-1].visited) neighbors.push({c:c-1,r,dir:"left"});
    if (!neighbors.length){ stack.pop(); continue; }
    const next = neighbors[Math.floor(rnd()*neighbors.length)];
    const curCell = grid[r][c]; const nextCell = grid[next.r][next.c];
    if (next.dir==="up"){curCell.top=false; nextCell.bottom=false;}
    if (next.dir==="down"){curCell.bottom=false; nextCell.top=false;}
    if (next.dir==="left"){curCell.left=false; nextCell.right=false;}
    if (next.dir==="right"){curCell.right=false; nextCell.left=false;}
    nextCell.visited = true; stack.push(next);
    }
    exitCell = { c:COLS-1, r:Math.floor(rnd()*ROWS) };
    grid[exitCell.r][exitCell.c].right = false; if (exitCell.c-1 >= 0) grid[exitCell.r][exitCell.c-1].right = false;
    grid[player.r][player.c].left = false;
    return grid;
}

// ==== Messages ====
let msgTimeout;
function flashMessage(text, ms=2200){ statusMsg.textContent = text; clearTimeout(msgTimeout); msgTimeout = setTimeout(()=> statusMsg.textContent='', ms); }

// Extra popup for wrong answers
function sassyPopup(msg, after=()=>{}){
    // Pause current modal view
    const prev = {
    title: modalTitle.textContent,
    html: modalMsg.innerHTML,
    yesText: modalYes.textContent,
    noText: modalNo.textContent,
    yesOnClick: modalYes.onclick,
    noOnClick: modalNo.onclick
    };
    // Show popup
    openModal({
    title: "Nope 😌",
    message: msg,
    yesText: "Fine",
    noText: "Sulk",
    onYes: ()=>{ closeModal(); after(); },
    onNo:  ()=>{ closeModal(); after(); }
    });
    // Shake for drama
    modalWindow.classList.add('shake'); setTimeout(()=> modalWindow.classList.remove('shake'), 420);
}

// ==== Random teleport ====
function startZapTimer(){
    clearInterval(zapInterval);
    zapInterval = setInterval(()=>{
    let tc = Math.floor(Math.random()*COLS), tr = Math.floor(Math.random()*ROWS);
    if (tc === exitCell.c && tr === exitCell.r){ tc = 0; tr = 0; }
    player = { c:tc, r:tr }; updateVolumeFromPlayer(); drawMaze();
    if (!volumeLocked) flashMessage('⚡ ZAP! Your gecko skittered somewhere else.');
    playRandomMemeSound();
    }, 16000);
}

// ==== Volume binding ====
function setVolume(v){
    v = Math.max(0, Math.min(1, v)); volume = v;
    const pct = Math.round(v*100);
    sliderFill.style.width = pct+"%"; sliderThumb.style.left = pct+"%"; volumeLabel.textContent = `Volume: ${pct}%`;
    try{ if (!bgm.paused) fadeBgm(bgmTargetFromSlider(), 250); }catch{}
}
function updateVolumeFromPlayer(){
    if (volumeLocked) return;
    const ratio = (COLS<=1) ? 1 : (player.c/(COLS-1)); setVolume(ratio); wallSound.volume = 0.1 + 0.9 * volume;
}

// ==== Input ====
function playWallBump(){
    const now = performance.now();
    if (now - lastWallBumpAt < WALL_COOLDOWN_MS) return;
    lastWallBumpAt = now; try { wallSound.currentTime = 0; wallSound.play(); } catch {}
}

function handleKey(e){
    let dc=0, dr=0; const k = e.key.toLowerCase();
    if (["arrowup","w"].includes(k)) dr=-1;
    if (["arrowdown","s"].includes(k)) dr=1;
    if (["arrowleft","a"].includes(k)) dc=-1;
    if (["arrowright","d"].includes(k)) dc=1;
    if (dc===0&&dr===0) return; e.preventDefault();

    const {c,r} = player; const cell = maze[r][c];
    if (dr===-1 && cell.top)    { playWallBump(); return; }
    if (dr=== 1 && cell.bottom) { playWallBump(); return; }
    if (dc===-1 && cell.left)   { playWallBump(); return; }
    if (dc=== 1 && cell.right)  { playWallBump(); return; }

    const nc = Math.min(Math.max(c+dc,0),COLS-1);
    const nr = Math.min(Math.max(r+dr,0),ROWS-1);
    player = { c:nc, r:nr };

    if (!madeFirstMove){
    madeFirstMove = true;
    setGuide("<strong>Step 2:</strong> Head to the shiny fly on the right.", "Your current position sets the volume preview.");
    }

    updateVolumeFromPlayer();

    if (nc===exitCell.c && nr===exitCell.r){
    drawMaze();
    setGuide("<strong>Step 3:</strong> Pick the volume to lock.", "Then ace 5 lizard-math questions to confirm.");
    startLockFlow();
    return;
    }
    drawMaze();
}

window.addEventListener('keydown', handleKey, { passive:false });

// ==== Modal helpers ====
function openModal({title, message, onYes, onNo, yesText="OK", noText="Cancel", runaway=false}){
    modalTitle.textContent = title; modalMsg.textContent = message;
    modalYes.textContent = yesText; modalNo.textContent = noText;
    modalYes.onclick = null; modalNo.onclick = null; modal.style.display = "flex";
    if (runaway){ enableRunawayOnce(); } else { disableRunaway(); }
    modalYes.onclick = ()=>{ modal.style.display = "none"; onYes && onYes(); };
    modalNo.onclick  = ()=>{ modal.style.display = "none"; onNo  && onNo();  };
}

function openModalHTML({title, html, onYes, onNo, yesText="OK", noText="Cancel", runaway=false}){
    modalTitle.textContent = title; modalMsg.innerHTML = html;
    modalYes.textContent = yesText; modalNo.textContent = noText;
    modalYes.onclick = null; modalNo.onclick = null; modal.style.display = "flex";
    if (runaway){ enableRunawayOnce(); } else { disableRunaway(); }
    // Caller validates then closes:
    modalYes.onclick = ()=>{ onYes && onYes(); };
    modalNo.onclick  = ()=>{ modal.style.display = "none"; onNo && onNo(); };
}
function closeModal(){ modal.style.display = "none"; }

function showSpinner(flag){ spinner.style.display = flag ? 'block' : 'none'; }

// Runaway button logic (one time per step)
function enableRunawayOnce(){
    runawayTries = 0;
    modalYes.classList.add('runaway');
    modalYes.addEventListener('mouseenter', flee);
}
function disableRunaway(){
    modalYes.classList.remove('runaway','move');
    modalYes.style.top = ''; modalYes.style.left = '';
    modalYes.removeEventListener('mouseenter', flee);
}
function flee() {
    if (runawayTries >= 2) { 
    modalYes.classList.remove('move');
    modalYes.style.left = '';
    modalYes.style.top  = '';
    return; 
    }
    runawayTries++;
    modalYes.classList.add('move');

    const bounds = modalWindow.getBoundingClientRect();
    const btnBounds = modalYes.getBoundingClientRect();

    const padding = 20;
    const maxX = bounds.width - btnBounds.width - padding;
    const maxY = bounds.height - btnBounds.height - padding;

    const x = Math.max(padding, Math.random() * maxX);
    const y = Math.max(padding, Math.random() * maxY);

    modalYes.style.left = x + 'px';
    modalYes.style.top  = y + 'px';

    setTimeout(() => {
    modalYes.classList.remove('move');
    modalYes.style.left = '';
    modalYes.style.top  = '';
    }, 1200);
}

// ==== Sassy Quiz (clear English, accurate math) ====
function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

function makeLizardQuestion(){
    // Each case defines: text + exact numeric answer
    const t = rand(1,6);
    let q, ans, note="";
    switch(t){
    case 1: {
        // clean multiplication
        const a = rand(2,9), b = rand(2,9);
        ans = a*b;
        q = `A gecko eats ${a} crickets per minute for ${b} minutes. How many crickets in total?`;
        break;
    }
    case 2: {
        // legs count
        const g = rand(2,8);
        ans = g*4;
        q = `${g} geckos are standing in a row. How many legs is that in total? (Legs only.)`;
        break;
    }
    case 3: {
        // precise ratio
        const green = rand(2,5), blue = rand(2,5);
        const total = (green+blue) * 3; // multiple of sum so division is exact
        // green share:
        ans = (green/(green+blue))*total; // exact integer
        q = `In a tank, the ratio of green to blue geckos is ${green}:${blue}. If there are ${total} geckos, how many are green?`;
        break;
    }
    case 4: {
        // percent increase exact
        const base = 50, p = [10,20,25,40,50,60][rand(0,5)];
        ans = base * (1 + p/100);
        q = `A colony has ${base} geckos. It grows by ${p}%. What is the new size?`;
        break;
    }
    case 5: {
        // area of square
        const s = rand(3,12);
        ans = s*s;
        q = `A square basking tile is ${s} cm on each side. What is its area in cm²?`;
        break;
    }
    default: {
        // steps = width * steps-per-cell
        const steps = rand(3,12), cells = rand(2,6);
        ans = steps*cells;
        q = `The maze path is ${cells} cells wide. If the gecko takes ${steps} steps per cell, how many steps to cross?`;
    }
    }
    // Ensure integer
    ans = Math.round(ans);
    return { q, ans, note };
}

function sassyWrong(val, ans){
    const diff = Math.abs(val-ans);
    if (diff === 0) return "";
    if (diff <= 1) return "So close you singed a whisker. Still wrong.";
    if (diff <= 3) return "Warm. Like a heat lamp. But no.";
    if (diff <= 10) return "Somewhere in the terrarium, not at the right rock.";
    return "That answer escaped the enclosure. Try again.";
}

// ==== Lock flow (with better copy + jitter-dodge) ====
function startLockFlow(){
    const currentPct = Math.round(volume*100);
    desiredVolumePct = currentPct;

    openModalHTML({
    title: "Lock Your Volume",
    html: `
        <div class="form-row">
        <label for="volRange" class="grow">Pick your volume:</label>
        <strong id="volShow">${currentPct}%</strong>
        </div>
        <input id="volRange" type="range" min="0" max="100" value="${currentPct}">
        <div class="form-row" style="margin-top:8px">
        <input id="volNum" class="grow" type="number" min="0" max="100" value="${currentPct}">
        <span>%</span>
        </div>
        <div class="hint">Hold <kbd>Shift</kbd> to stop the slider dodging round numbers.</div>
        <label style="display:flex;align-items:center;gap:8px;margin-top:10px">
        <input type="checkbox" id="lizCheck">
        <span>I solemnly swear I am a lizard (or at least lizard-adjacent).</span>
        </label>
        <div id="err" class="err hidden"></div>
    `,
    yesText: "Start Quiz",
    noText: "Cancel",
    runaway: true,
    onYes: ()=>{
        const n = document.getElementById('volNum'); 
        const e = document.getElementById('err');
        const ch = document.getElementById('lizCheck');
        const value = Number(n.value);
        if (!ch.checked){ e.textContent="Please confirm your noble lizard status."; e.classList.remove('hidden'); return; }
        if (!Number.isFinite(value) || value<0 || value>100){ e.textContent="Pick a whole number from 0 to 100."; e.classList.remove('hidden'); return; }
        desiredVolumePct = Math.round(value); 
        showSpinner(true);
        modalWindow.classList.add('shake');
        setTimeout(()=>{ showSpinner(false); modalWindow.classList.remove('shake'); closeModal(); setGuide("<strong>Step 4:</strong> Answer 5 lizard-math questions.", "Sass included, free of charge."); startQuiz(); }, 900);
    },
    onNo: ()=>{ closeModal(); }
    });

    // Sync range+number + label + nuisance nudge
    setTimeout(()=>{
    const range = document.getElementById('volRange');
    const num   = document.getElementById('volNum');
    const show  = document.getElementById('volShow');
    let shiftDown = false;
    window.addEventListener('keydown', e=>{ if (e.key === 'Shift') shiftDown = true; });
    window.addEventListener('keyup',   e=>{ if (e.key === 'Shift') shiftDown = false; });

    function nudge(value){
        if (shiftDown) return value;
        const pretty = [0,10,20,25,30,40,50,60,70,75,80,90,100];
        if (pretty.includes(value)){
        const off = (Math.random()<0.5? -1 : +1) * (1 + Math.floor(Math.random()*2));
        value = Math.max(0, Math.min(100, value + off));
        }
        return value;
    }
    range.addEventListener('input', ()=>{
        let v = nudge(Number(range.value));
        range.value = v; num.value = v; show.textContent = v+"%";
    });
    num.addEventListener('input', ()=>{
        let v = Number(num.value); if (!Number.isFinite(v)) v = 0;
        v = Math.max(0, Math.min(100, v));
        v = nudge(v);
        num.value = v; range.value = v; show.textContent = v+"%";
    });
    }, 0);
}

function startQuiz(){
    let needed = 5; 
    let current = makeLizardQuestion();

    const render = () => {
    openModalHTML({
        title: `Lizard Quiz (${6-needed}/5 correct)`,
        html: `
        <div><em>Answer the question. Full numbers only.</em></div>
        <div style="margin-top:6px">${current.q}</div>
        <div class="form-row" style="margin-top:10px">
            <input id="ans" type="number" step="1" placeholder="Type your answer…" class="grow">
        </div>
        <div id="err" class="err hidden"></div>
        <div id="warn" class="warn hidden"></div>
        `,
        yesText: "Submit",
        noText: "Quit",
        onYes: ()=>{
        const ansEl = document.getElementById('ans'); 
        const val = Number(ansEl.value);
        if (!Number.isFinite(val)){ document.getElementById('err').textContent="Numbers only."; document.getElementById('err').classList.remove('hidden'); return; }

        // Fake “checking” delay
        showSpinner(true);
        setTimeout(()=>{
            showSpinner(false);
            if (Math.round(val) === current.ans){
            closeModal(); needed--;
            flashMessage(["✅ Correct.","🦎 Nice.","🥳 Crunchy numbers!"][rand(0,2)]);
            if (needed === 0){ finalBossChecks(); }
            else { current = makeLizardQuestion(); render(); }
            } else {
            mistakes++;
            const sass = sassyWrong(val, current.ans);
            closeModal();
            sassyPopup(`✖ ${sass}`, ()=>{ render(); });
            }
        }, rand(200, 600));
        },
        onNo: ()=>{ closeModal(); flashMessage("Quiz canceled. Volume remains unlocked."); setGuide("<strong>Step 2:</strong> Reach the fly again to lock volume.", "The gecko will wait. Judgingly."); }
    });
    setTimeout(()=>{ const a=document.getElementById('ans'); if(a) a.focus(); }, 0);
    };
    render();
}

// Final confirmations
let continueGuard = null; // reference to the continue button for enabling/disabling

function finalBossChecks(){
    openModalHTML({
    title: "Almost There™",
    html: `
        <div>Type <code>I love lizards</code> exactly to proceed.</div>
        <div class="form-row" style="margin-top:10px">
        <input id="pledge" type="text" placeholder='Type it exactly.' class="grow" autocomplete="off" autocapitalize="off" spellcheck="false">
        </div>
        <div id="pledgeErr" class="err hidden"></div>
    `,
    yesText: "Continue",
    noText: "Cancel",
    runaway: true,
    onYes: ()=>{
        // This gets replaced by input listener enablement; kept for safety
        const v = (document.getElementById('pledge').value || "").trim();
        if (v !== "I love lizards"){
        document.getElementById('pledgeErr').textContent="Exact phrase required.";
        document.getElementById('pledgeErr').classList.remove('hidden');
        modalWindow.classList.add('shake'); setTimeout(()=> modalWindow.classList.remove('shake'), 420);
        return;
        }
        closeModal();
        pressAndHoldStep();
    },
    onNo: ()=>{ closeModal(); flashMessage("Lock aborted. The geckos respect your hesitation."); }
    });

    // Hide/disable Continue until exact phrase typed
    setTimeout(()=>{
    const pledge = document.getElementById('pledge');
    const err = document.getElementById('pledgeErr');
    // Find current "yes" button
    continueGuard = modalYes;
    continueGuard.disabled = true;
    continueGuard.classList.add('hidden'); // visually hide

    pledge.addEventListener('input', ()=>{
        const ok = pledge.value === "I love lizards";
        if (ok){
        err.classList.add('hidden');
        continueGuard.disabled = false;
        continueGuard.classList.remove('hidden');
        } else {
        continueGuard.disabled = true;
        continueGuard.classList.add('hidden');
        }
    });
    }, 0);
}

function pressAndHoldStep(){
    let holdMs = 3000, holding = false, start = 0, raf;
    openModalHTML({
    title: "Press & Hold to Lock",
    html: `
        <div>Press and hold the button for <strong>${(holdMs/1000).toFixed(0)} seconds</strong>. Release early = start over.</div>
        <div class="form-row" style="margin-top:12px; justify-content:flex-end">
        <button id="holdBtn" class="btn btn-primary">Hold me (gently)</button>
        </div>
        <div class="hint" id="holdHint">Progress: 0%</div>
    `,
    yesText: "…",
    noText: "Cancel",
    onYes: ()=>{}, // not used here
    onNo: ()=>{ closeModal(); flashMessage("Lock aborted at the last second. Dramatic."); }
    });
    const btn = document.getElementById('holdBtn');
    const hint = document.getElementById('holdHint');

    function tick(t){
    if (!holding){ cancelAnimationFrame(raf); return; }
    const pct = Math.min(1, (t - start) / holdMs);
    hint.textContent = `Progress: ${Math.round(pct*100)}%`;
    if (pct >= 1){
        holding = false;
        closeModal();
        theSneakySwap();
    } else {
        raf = requestAnimationFrame(tick);
    }
    }
    btn.addEventListener('mousedown', ()=>{ if (holding) return; holding=true; start=performance.now(); raf=requestAnimationFrame(tick); });
    btn.addEventListener('mouseup',   ()=>{ if (!holding) return; holding=false; hint.textContent = "Progress: 0% (reset)"; modalWindow.classList.add('shake'); setTimeout(()=> modalWindow.classList.remove('shake'), 320); });
    btn.addEventListener('mouseleave',()=>{ if (!holding) return; holding=false; hint.textContent = "Progress: 0% (reset)"; });
    // Touch
    btn.addEventListener('touchstart', e=>{ e.preventDefault(); if (holding) return; holding=true; start=performance.now(); raf=requestAnimationFrame(tick); }, {passive:false});
    btn.addEventListener('touchend',   ()=>{ if (!holding) return; holding=false; hint.textContent = "Progress: 0% (reset)"; });
    btn.addEventListener('touchcancel',()=>{ if (!holding) return; holding=false; hint.textContent = "Progress: 0% (reset)"; });
}

// The last confirm with swapped buttons (once)
let didSwapOnce = false;
function theSneakySwap(){
    openModal({
    title: "Last Tiny Confirmation",
    message: "Are you absolutely sure you want to lock the volume forever (or at least until you say otherwise)?",
    yesText: "Yes, lock it",
    noText: "No, take me back",
    onYes: ()=>{ lockVolumeNow(); },
    onNo: ()=>{ flashMessage("Retreat accepted. The gecko nods knowingly."); },
    });
    if (!didSwapOnce){
    didSwapOnce = true;
    setTimeout(()=>{
        modalActions.insertBefore(modalYes, modalNo); // swap positions once
    }, 50);
    }
}


function lockVolumeNow(){
    volumeLocked = true; const v = desiredVolumePct/100; setVolume(v);
    flashMessage(`🔒 Volume locked at ${desiredVolumePct}% — after only a few friendly obstacles!`);
    setGuide("<strong>Step 5:</strong> Volume locked.", "Start a new maze anytime. The lock stays.");
    closeModal();
}

// ==== Controls ====
document.getElementById('newMazeBtn').onclick = ()=>{
    document.getElementById('modal').style.display = 'none';
    maze = generateMaze(); drawMaze(); startZapTimer();
    madeFirstMove = false;
    setGuide("<strong>Step 1:</strong> Move the gecko with WASD/Arrows.", "Reach the shiny fly to choose your volume.");
    updateVolumeFromPlayer(); // no-op if locked
    flashMessage(volumeLocked ? `New maze. Volume locked at ${Math.round(volume*100)}%.` : 'New maze generated. Your gecko is ready.');
};

// ==== Init ====
function init(){
    maze = generateMaze(); updateVolumeFromPlayer(); drawMaze(); startZapTimer();
}
init();
