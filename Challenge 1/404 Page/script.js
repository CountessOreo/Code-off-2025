(() => {
  // ======= Global state =======
  let errorCode = 404;
  let clicks = 0;
  let captchaAttempts = 0;
  const MAX_ATTEMPTS = 10;

  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  const detailsBtn = document.getElementById('detailsBtn');
  const homeBtn = document.getElementById('homeBtn');
  const backBtn = document.getElementById('backBtn');
  const card = document.getElementById('card');

  const modal = document.getElementById('modal');
  const gridEl = document.getElementById('grid');
  const verifyBtn = document.getElementById('verifyBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const capMsg = document.getElementById('capMsg');
  const bar = document.getElementById('bar');
  const triesLeft = document.getElementById('triesLeft');

  const bsod = document.getElementById('bsod');
  const bsodPct = document.getElementById('bsodPct');

  // Sure modal
  const sure = document.getElementById('sure');
  const sureTitle = document.getElementById('sureTitle');
  const sureMsg = document.getElementById('sureMsg');
  const sureSteps = document.getElementById('sureSteps');
  const sureYes = document.getElementById('sureYes');
  const sureNo = document.getElementById('sureNo');

  // Excuse
  const excuseBox = document.getElementById('excuseBox');
  const excuseText = document.getElementById('excuseText');
  const excuseOk = document.getElementById('excuseOk');

  // Fake cursor
  const fake = document.getElementById('cursor');
  const bubble = document.getElementById('bubble');
  let cursorFrozen = false;

  // Guide / tour
  const guide = document.getElementById('guide');
  const helpBtn = document.getElementById('helpBtn');
  const tour = document.getElementById('tour');
  const tourRing = document.getElementById('tourRing');
  const tourCard = document.getElementById('tourCard');
  const tourText = document.getElementById('tourText');
  const tourNext = document.getElementById('tourNext');
  const tourSkip = document.getElementById('tourSkip');
  const tourStart = document.getElementById('tourStart');
  const tourReset = document.getElementById('tourReset');
  const nextHint = document.getElementById('nextHint');
  const chkFlip = document.getElementById('chkFlip');
  const chkCaptcha = document.getElementById('chkCaptcha');
  const chkSure = document.getElementById('chkSure');
  const chkCursor = document.getElementById('chkCursor');
  const chkBsod = document.getElementById('chkBsod');
  const muteTgl = document.getElementById('muteTgl');
  const calmTgl = document.getElementById('calmTgl');
  const sr = document.getElementById('sr');

  // ======= Audio =======
  let audio, audioMuted = false;

  function initAudio(){
    if (!audio && !audioMuted) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      const dummy = audio.createOscillator();
      const g = audio.createGain(); 
      g.gain.value=0; 
      dummy.connect(g).connect(audio.destination);
      dummy.start(); 
      dummy.stop((audio.currentTime||0)+0.01);
    }
  }

  function now(){ return audio ? audio.currentTime : 0; }

  function tone(freq=880, dur=0.08, type='square', gain=0.03){
    if(!audio || audioMuted) return;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type; 
    o.frequency.value=freq; 
    g.gain.value=gain;
    o.connect(g).connect(audio.destination);
    const t = now();
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.stop(t+dur+0.02);
  }
  function clickBlip(){ tone(1200, 0.05, 'square', 0.04); }
  function errorBuzz(){
    if(!audio || audioMuted) return;
    const o = audio.createOscillator(); 
    const g = audio.createGain();
    o.type='sawtooth'; o.frequency.value=180; g.gain.value=0.02;
    o.connect(g).connect(audio.destination);
    const t=now(); o.start(t);
    o.frequency.exponentialRampToValueAtTime(70, t+0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t+0.28);
    o.stop(t+0.3);
  }
  function snapSnd(){ tone(400,0.05,'square',0.05); tone(160,0.08,'sawtooth',0.05); }
  function bsodBeeps(){ tone(500,0.12,'sine',0.02); setTimeout(()=>tone(420,0.12,'sine',0.02),130); }

  window.addEventListener('mousedown', () => { initAudio(); document.body.classList.add('hide-cursor'); fake.classList.add('show'); }, {once:true});

  // ======= Utils =======
  const r = (n) => Math.floor(Math.random()*n);
  const wait = (ms) => new Promise(res => setTimeout(res, ms));
  const announce = (msg) => { sr.textContent = msg; };

  function setErrorView(code){
    title.innerHTML = `Error <span class="errorNumber">${code}</span>`;
    card.classList.remove('flip-x','flip-xy','jiggle');
    const mode = code % 3;
    if (mode===0) card.classList.add('flip-xy');
    else if (mode===1) card.classList.add('flip-x');
    else card.classList.add('jiggle');

    const snark = [
      "The thing you wanted did not survive re-entry.",
      "According to our logs, this is your fault.",
      "We filed a ticket. It fell into a void.",
      "Directions unclear, opened 17 more tabs.",
      "You look lost. Please prove you’re not a robot first."
    ];
    subtitle.textContent = snark[code % snark.length];

    // Mark flip badge
    setBadge('flip');
    announce(`Error view changed to ${code}.`);
  }

  function nextError(){
    setTimeout(clickBlip, 0);
    errorCode++;
    if (errorCode>499 && errorCode<900) errorCode = 404; 
    setErrorView(errorCode);
  }

  // ======= Are you sure? (5 steps) =======
  const stepsCopy = [
    "Are you sure?",
    "Are you really sure?",
    "Are you really really sure?",
    "FINAL WARNING: Proceeding may do… something.",
    "Ok last chance. Pinky promise?"
  ];

  // Focus management for modals
  let lastFocus = null;
  function openModal(el){
    lastFocus = document.activeElement;
    el.classList.add('show');
    const btn = el.querySelector('button, [href], input, select, textarea') || el;
    setTimeout(()=> btn && btn.focus(), 20);
  }
  function closeModal(el){
    el.classList.remove('show');
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
  }

function areYouSureFlow(label="this"){
  return new Promise((resolve)=>{
    setBadge('sure');
    let step = 0;

    function open(){
      sureTitle.textContent = `Confirm: ${label}`;
      // show the actual prompt text, but hide the counter
      sureMsg.textContent = stepsCopy[step];
      // hide the step counter for both visuals and screen readers
      sureSteps.setAttribute('aria-hidden','true');
      sureSteps.style.display = 'none';

      openModal(sure); 
      tone(900,0.07,'triangle',0.02);
    }
    open();

    sureYes.onclick = ()=>{
      step++;
      clickBlip();
      if(step >= stepsCopy.length){ // no hardcoded "5"
        closeModal(sure);
        resolve(true);
      } else {
        sureMsg.textContent = stepsCopy[step];
        // (intentionally not updating sureSteps)
      }
    };

    sureNo.onclick = ()=>{
      errorBuzz();
      step = Math.max(0, step-1);
      sureMsg.innerHTML = `You clicked <span class="ghost">No</span>. Interesting choice. Let's try that again.`;
      // (intentionally not updating sureSteps)
    };
  });
}
  // ======= Guarded actions =======
  function guard(handler,label){
    return async () => {
      const ok = await areYouSureFlow(label);
      if(!ok) return;
      handler();
    };
  }

  detailsBtn.addEventListener('click', guard(async () => {
    clicks++;
    if (clicks % 3 === 0){ openCaptcha(); return; }
    detailsBtn.disabled = true;
    const old = detailsBtn.textContent;
    detailsBtn.textContent = 'Fetching details…';
    await wait(700 + r(900));
    detailsBtn.disabled = false;
    detailsBtn.textContent = old;
    nextError();
  }, "See details"));

  homeBtn.addEventListener('click', guard(() => { nextError(); }, "Go Home"));
  backBtn.addEventListener('click', guard(() => { errorCode += 2; setErrorView(errorCode); }, "Go Back"));

  // ======= Captcha =======
  const emojiPool = ['🚦','🚗','🚌','🚴‍♀️','🚧','🏍️','🚓','🚕','🚥','🚙','🚚','🚜','🚒'];
  function buildCaptcha(){
    gridEl.innerHTML = '';
    capMsg.innerHTML = '&nbsp;';
    const correctIdxs = new Set();
    while (correctIdxs.size<3) correctIdxs.add(r(9));
    for (let i=0;i<9;i++){
      const tile = document.createElement('div');
      tile.className = 'tile';
      const span = document.createElement('div');
      span.className = 'emoji';
      const showBait = Math.random()<.4;
      const isCorrect = correctIdxs.has(i);
      span.textContent = isCorrect ? '🚦' : (showBait ? '🚥' : emojiPool[r(emojiPool.length)]);
      tile.dataset.correct = isCorrect ? '1' : '0';
      tile.addEventListener('click', () => { tile.classList.toggle('selected'); clickBlip(); });
      tile.appendChild(span);
      gridEl.appendChild(tile);
    }
    triesLeft.textContent = (MAX_ATTEMPTS - captchaAttempts);
    const pct = Math.min(95, Math.floor((captchaAttempts / MAX_ATTEMPTS) * 92) + r(6));
    bar.style.width = pct + '%';

    // Create/update a centered percentage label on top of the bar
    let pctEl = document.getElementById('barPct');
    if (!pctEl) {
      pctEl = document.createElement('div');
      pctEl.id = 'barPct';
      pctEl.className = 'bar-pct';
      // ensure the container can position the label
      bar.parentElement.style.position = 'relative';
      bar.parentElement.appendChild(pctEl);

      // (nice to have) accessibility for screen readers
      const progressEl = bar.parentElement;
      progressEl.setAttribute('role','progressbar');
      progressEl.setAttribute('aria-label','Captcha attempts progress');
      progressEl.setAttribute('aria-valuemin','0');
      progressEl.setAttribute('aria-valuemax','100');
    }
    pctEl.textContent = `${pct}%`;
    bar.parentElement.setAttribute('aria-valuenow', String(pct));
  }

  function openCaptcha(){
    setBadge('captcha');
    buildCaptcha();
    openModal(modal);
    tone(1000,0.08,'triangle',0.03);
  }

  refreshBtn.addEventListener('click', () => { buildCaptcha(); clickBlip(); });

  verifyBtn.addEventListener('click', async () => {
    captchaAttempts++;
    triesLeft.textContent = (MAX_ATTEMPTS - captchaAttempts);
    verifyBtn.disabled = true;
    capMsg.textContent = 'Verifying…';
    tone(1200,0.07,'sine',0.03);
    await wait(700 + r(900));
    verifyBtn.disabled = false;

    if (captchaAttempts < MAX_ATTEMPTS-1){
      const excuses = [
        "Hmm, one of those wasn’t a traffic light.",
        "Try again, we detected a bus with main character energy.",
        "Close! But the algorithm is feeling sassy.",
        "Calibration drift. Please re-identify your traffic lights.",
        "Our AI says that was a mailbox. Argue with it in 3…2…",
        "Error: Too much confidence detected in your clicking.",
        "Nice try. Unfortunately, we only accept answers from certified giraffes.",
        "Almost! But did you consider the metaphysical traffic lights?",
        "Our lawyers have advised us not to let you pass yet.",
        "System requires you to hum the Tetris theme before continuing.",
        "That was correct… in an alternate timeline.",
        "You selected 3 squares. The correct answer was ∞ squares.",
        "Oops, we ran out of traffic lights. Please start again.",
        "Captcha server went on lunch break. Please retry in 47 minutes.",
        "Detected suspicious activity: your mouse moved like a human.",
        "One of those lights was yellow, not green. Try again when you learn colors.",
        "Your solution was fact-checked on Wikipedia and failed.",
        "Captcha validation failed: vibes were off.",
        "Our hamster server tripped over the power cord. Retry.",
        "Good effort, but the moon is in retrograde. Denied.",
        "AI has flagged your clicks as sarcastic. Please click sincerely next time.",
        "We accept traffic lights, but you clicked a *stoplight*. Rookie mistake.",
        "Retry blocked: We sensed enjoyment. This site forbids joy.",
        "Your captcha answer was correct, but we didn’t like your attitude.",
        "Processing… oh wait, I lost the results. Do it again."
      ];
      showExcuse(excuses[r(excuses.length)]);
      errorBuzz();
      buildCaptcha();
      return;
    }

    if (captchaAttempts >= MAX_ATTEMPTS){
      closeModal(modal);
      await fakeBsod();
      hardReset();
    }
  });

  const progressEl = document.querySelector('.progress');
  const barLabel = document.createElement('div');
  barLabel.id = 'barLabel';
  barLabel.className = 'bar-label';
  barLabel.textContent = 'Select 3 traffic lights (0/3)';
  progressEl.appendChild(barLabel);

  // ARIA for screen readers
  progressEl.setAttribute('role','progressbar');
  progressEl.setAttribute('aria-label','Captcha progress');
  progressEl.setAttribute('aria-valuemin','0');
  progressEl.setAttribute('aria-valuemax','3');

  function updateCaptchaGuide(){
    const selected = gridEl.querySelectorAll('.tile.selected').length;
    const needed = 3;
    // Fill based on selection count
    bar.style.width = Math.min(100, (selected/needed)*100) + '%';

    // Guidance text
    if (selected < needed) {
      barLabel.textContent = `Select 3 traffic lights (${selected}/3)`;
      progressEl.dataset.state = 'incomplete';
    } else if (selected === needed) {
      barLabel.textContent = 'Perfect — click Verify';
      progressEl.dataset.state = 'ready';
    } else {
      barLabel.textContent = `Too many selected (${selected}/3) — unselect down to 3`;
      progressEl.dataset.state = 'error';
    }

    // ARIA live value
    progressEl.setAttribute('aria-valuenow', String(Math.min(selected, 3)));
  }

  function flashProgress(){
    progressEl.classList.remove('shake'); // restart animation
    // Force reflow
    // eslint-disable-next-line no-unused-expressions
    progressEl.offsetWidth;
    progressEl.classList.add('shake');
  }


  function showExcuse(msg){
    excuseText.textContent = msg;
    openModal(excuseBox);
  }
  excuseOk.addEventListener('click', ()=> closeModal(excuseBox));

  // ======= BSOD =======
  async function fakeBsod(){
    setBadge('bsod');
    bsod.classList.add('show');
    for (let i=0;i<=100;i+= (3 + r(12))){
      bsodPct.textContent = Math.min(i, 100);
      bsodBeeps();
      await wait(120 + r(180));
    }
    await wait(7000);
    bsod.classList.remove('show');
  }

  // ======= Reset =======
  function hardReset(){
    errorCode = 404;
    clicks = 0;
    captchaAttempts = 0;
    setErrorView(errorCode);
    updateNextHint();
    announce('Reset complete.');
  }

  // ======= Keyboard =======
  document.addEventListener('keydown', (e)=>{
    const k = e.key.toLowerCase();
    if (k === 'escape'){
      // Old behavior: flash the card
      card.style.outline = '3px solid #36f3c3';
      setTimeout(()=> card.style.outline = 'none', 200);
      errorBuzz();
      // But if tour is open, allow escape to close the guide.
      if (tour.classList.contains('show')) endTour();
    }
    if (k === 'd') detailsBtn.click();
    if (k === 'h') homeBtn.click();
    if (k === 'b') backBtn.click();
    if (k === '?'){ startTour(); }
    if (k === 'm'){ muteTgl.checked = !muteTgl.checked; audioMuted = muteTgl.checked; announce(audioMuted?'Muted':'Unmuted'); }
    if (k === 'r'){ hardReset(); resetBadges(); }
  });

  // ======= Fake cursor =======
  let lastX=0, lastY=0, freezeTimer=null;
  window.addEventListener('mousemove', (e)=>{
    if(!fake.classList.contains('show')) return;
    if(cursorFrozen) return;
    lastX = e.clientX; lastY = e.clientY;
    fake.style.left = lastX + 'px';
    fake.style.top  = lastY + 'px';
    if(Math.random() < 0.01) doSnap(false);
  });
  window.addEventListener('click', ()=>{
    if(!fake.classList.contains('show')) return;
    doSnap(true);
  });
  function doSnap(fromClick){
    if(cursorFrozen) return;
    cursorFrozen = true;
    fake.classList.add('snap');
    snapSnd();
    setBadge('cursor');

    bubble.style.left = (lastX + 12) + 'px';
    bubble.style.top  = (lastY - 12) + 'px';
    bubble.classList.add('show');
    setTimeout(()=> bubble.classList.remove('show'), 480);

    clearTimeout(freezeTimer);
    freezeTimer = setTimeout(()=>{
      cursorFrozen = false;
      fake.classList.remove('snap');
    }, fromClick ? 650 : 450);
  }

  // ======= Guide: badges & hints =======
  const badges = {
    flip:false, captcha:false, sure:false, cursor:false, bsod:false
  };
  const storageKey = 'chaos404_badges_v1';

  function loadBadges(){
    try{
      const saved = JSON.parse(localStorage.getItem(storageKey)||'{}');
      Object.assign(badges, saved);
    }catch{}
    syncBadgesUI();
  }
  function saveBadges(){ localStorage.setItem(storageKey, JSON.stringify(badges)); }
  function syncBadgesUI(){
    chkFlip.checked = !!badges.flip;
    chkCaptcha.checked = !!badges.captcha;
    chkSure.checked = !!badges.sure;
    chkCursor.checked = !!badges.cursor;
    chkBsod.checked = !!badges.bsod;
    updateNextHint();
  }
  function setBadge(name){
    if (!badges[name]) {
      badges[name] = true;
      saveBadges(); syncBadgesUI();
    }
  }
  function resetBadges(){
    Object.keys(badges).forEach(k=> badges[k]=false);
    saveBadges(); syncBadgesUI();
  }
  function updateNextHint(){
    if(!badges.flip) { nextHint.innerHTML = 'Hint: Press <b>D</b> to flip errors.'; return; }
    if(!badges.captcha) { nextHint.textContent = 'Keep pressing “See details” until a captcha shows up.'; return; }
    if(!badges.sure) { nextHint.textContent = 'Any main button triggers a 5-step “Are you sure?” loop.'; return; }
    if(!badges.cursor) { nextHint.textContent = 'Move and click your mouse to spring the fake cursor trap.'; return; }
    if(!badges.bsod) { nextHint.textContent = 'Fail the captcha enough times to reach the faux BSOD.'; return; }
    nextHint.textContent = 'You found everything. Congrats? Press R to reset and do it again.';
  }

  muteTgl.addEventListener('change', ()=>{ audioMuted = muteTgl.checked; announce(audioMuted?'Muted':'Unmuted'); });
  calmTgl.addEventListener('change', ()=>{ document.body.classList.toggle('calm', calmTgl.checked); announce(calmTgl.checked?'Reduced motion on':'Reduced motion off'); });
  tourReset.addEventListener('click', ()=>{ resetBadges(); hardReset(); });

  // ======= Coach-mark tour =======
  const steps = [
    { sel:'#detailsBtn', msg:'Step 1/5 — Click “See details” (or press D). Sometimes a captcha will appear. That’s intentional.' },
    { sel:'#homeBtn', msg:'Step 2/5 — Try “Home” (H). It… does not go home.' },
    { sel:'#backBtn', msg:'Step 3/5 — Try “Back” (B). Notice the “creative” error code behavior.' },
    { sel:null,       msg:'Step 4/5 — Move and click your mouse to trigger the fake cursor trap.' },
    { sel:null,       msg:'Step 5/5 — If a captcha appears, attempt it repeatedly. When you fail enough, a fake BSOD will visit.' }
  ];
  let stepIdx = 0;

  function placeCoach(target){
    // Default position near bottom-right of target (or center)
    const rect = target ? target.getBoundingClientRect() : {left:window.innerWidth/2-120, top:window.innerHeight/2-40, width:240, height:80};
    const pad = 8;
    tourRing.style.left = (rect.left - pad) + 'px';
    tourRing.style.top = (rect.top - pad) + 'px';
    tourRing.style.width = (rect.width + pad*2) + 'px';
    tourRing.style.height = (rect.height + pad*2) + 'px';

    const cardW = 320, cardH = 120;
    let cx = rect.left + rect.width + 12;
    let cy = rect.top;
    if (cx + cardW > window.innerWidth - 12) cx = rect.left - cardW - 12;
    if (cx < 12) cx = 12;
    if (cy + cardH > window.innerHeight - 12) cy = window.innerHeight - cardH - 12;
    if (cy < 12) cy = 12;
    tourCard.style.left = cx + 'px';
    tourCard.style.top = cy + 'px';
  }

  function showStep(i){
    stepIdx = i;
    const st = steps[stepIdx];
    tourText.textContent = st.msg;
    const target = st.sel ? document.querySelector(st.sel) : null;
    if (target && target.offsetParent !== null){
      tourRing.style.display = 'block';
      placeCoach(target);
    } else {
      // Generic center placement
      tourRing.style.display = 'none';
      placeCoach(null);
    }
  }

  function startTour(){
    tour.classList.add('show');
    tour.setAttribute('aria-hidden','false');
    showStep(0);
  }
  function endTour(){
    tour.classList.remove('show');
    tour.setAttribute('aria-hidden','true');
  }

  helpBtn.addEventListener('click', startTour);
  tourStart.addEventListener('click', startTour);
  tourSkip.addEventListener('click', endTour);
  tourNext.addEventListener('click', ()=>{
    if (stepIdx < steps.length-1) showStep(stepIdx+1);
    else endTour();
  });
  window.addEventListener('resize', ()=> showStep(stepIdx));

  // ======= Boot =======
  setErrorView(errorCode);
  loadBadges();
})();
