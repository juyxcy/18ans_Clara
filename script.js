const loveGate = document.querySelector('#loveGate');
const yes = document.querySelector('#yes');
const no = document.querySelector('#no');
const gateMessage = document.querySelector('#gateMessage');
const gateCount = document.querySelector('#gateCount');
const quizPage = document.querySelector('#quizPage');
const quizCard = document.querySelector('#quizCard');
const quizQuestion = document.querySelector('#quizQuestion');
const quizCount = document.querySelector('#quizCount');
const quizScore = document.querySelector('#quizScore');
const quizBar = document.querySelector('#quizBar');
const quizForm = document.querySelector('#quizForm');
const quizAnswer = document.querySelector('#quizAnswer');
const quizFeedback = document.querySelector('#quizFeedback');
const quizGifts = document.querySelector('#quizGifts');
const quizRetry = document.querySelector('#quizRetry');
const quizBurst = document.querySelector('#quizBurst');
const cameraPage = document.querySelector('#cameraPage');
const cameraVideo = document.querySelector('#cameraVideo');
const cameraStatus = document.querySelector('#cameraStatus');
const cameraPrompt = document.querySelector('#cameraPrompt');
const cameraError = document.querySelector('#cameraError');
const cameraContinue = document.querySelector('#cameraContinue');
let cameraStream = null;
let noCount = 0;
const confirmations = [
  'Tu es vraiment sûre ? 🤍',
  'Même pas un tout petit peu ?',
  'Allez… pense à tous nos souvenirs.',
  'Cette réponse me brise un peu le cœur…',
  'Dernière chance : tu m’aimes, hein ?'
];

no.addEventListener('click', () => {
  noCount += 1;
  const scaleNo = Math.max(.24, 1 - noCount * .16);
  const scaleYes = 1 + noCount * .16;
  no.style.transform = `scale(${scaleNo})`;
  no.style.opacity = Math.max(.25, 1 - noCount * .14);
  yes.style.transform = `scale(${scaleYes})`;
  gateMessage.textContent = confirmations[Math.min(noCount - 1, confirmations.length - 1)];
  gateCount.textContent = `TENTATIVE ${noCount} SUR 5`;
  if (noCount >= 5) {
    no.textContent = '…';
    no.setAttribute('aria-label', 'Toujours non');
  }
});

yes.addEventListener('click', () => {
  gateMessage.textContent = 'Je le savais. Je t’aime aussi. ♥';
  loveGate.classList.add('closed');
  setTimeout(() => {
    loveGate.hidden = true;
    quizPage.hidden = false;
    quizAnswer.focus();
  }, 680);
});

// Ces questions sont mélangées à chaque ouverture. Tu peux changer questions et réponses ici.
const coupleQuestions = [
  { question: 'Qui est le plus jaloux entre nous deux ?', answers: ['noa'], reveal: 'Noa.' },
  { question: 'Quelle est la date où on s’est mis ensemble ?', answers: ['la nuit du 1er mai', 'nuit du 1er mai', '1er mai', '1 mai'], reveal: 'La nuit du 1er mai.' },
  { question: 'Où nous sommes-nous rencontrés pour la première fois ?', answers: ['le royale', 'bar le royale', 'au royale', 'bar royale'], reveal: 'Au bar Le Royale.' },
  { question: 'Quel était notre premier vrai rendez-vous ?', answers: ['cinema', 'un cinema', 'au cinema'], reveal: 'Un cinéma.' },
  { question: 'Qui vole le plus les pulls de l’autre ?', answers: ['clara'], reveal: 'Clara.' },
  { question: 'Quelle est ma boisson préférée ?', answers: ['coca 0', 'coca zero', 'coca zéro'], reveal: 'Coca 0.' },
  { question: 'Quelle est ma couleur préférée ?', answers: ['rouge', 'le rouge'], reveal: 'Rouge.' },
  { question: 'Quel est le premier film ou la première série qu’on a regardé ensemble ?', answers: ['the drama'], reveal: 'The Drama.' },
  { question: 'Qui a fait les premiers pas ?', answers: ['noa'], reveal: 'Noa.' },
  { question: 'Quel est le premier voyage qu’on a fait en amoureux ?', answers: ['paris'], reveal: 'Paris.' }
];
let quizQuestions = [...coupleQuestions].sort(() => Math.random() - .5);
let quizIndex = 0;
let correctAnswers = 0;
const normaliseAnswer = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
function levenshteinDistance(first, second) {
  const row = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let i = 1; i <= first.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= second.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (first[i - 1] === second[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[second.length];
}
const answerMatches = (answer, expectedAnswers) => expectedAnswers.some((expected) => {
  const expectedNormalised = normaliseAnswer(expected);
  const distance = levenshteinDistance(answer, expectedNormalised);
  const tolerance = Math.max(1, Math.floor(expectedNormalised.length * .24));
  return answer === expectedNormalised || (expectedNormalised.length > 2 && answer.includes(expectedNormalised)) || (answer.length > 2 && expectedNormalised.includes(answer)) || distance <= tolerance;
});
function showQuizQuestion() {
  const current = quizQuestions[quizIndex];
  quizQuestion.textContent = current.question;
  quizCount.textContent = `QUESTION ${String(quizIndex + 1).padStart(2, '0')} / 10`;
  quizScore.textContent = `${correctAnswers} BONNE${correctAnswers > 1 ? 'S' : ''} RÉPONSE${correctAnswers > 1 ? 'S' : ''}`;
  quizBar.style.width = `${quizIndex * 10}%`;
  quizAnswer.value = '';
  quizFeedback.textContent = '';
}
function makeQuizFireworks() {
  const symbols = ['♥', '✦', '♡', '✧'];
  for (let i = 0; i < 26; i += 1) {
    const spark = document.createElement('span');
    spark.className = 'quiz-spark';
    spark.textContent = symbols[i % symbols.length];
    spark.style.setProperty('--x', `${(Math.random() - .5) * 680}px`);
    spark.style.setProperty('--y', `${(Math.random() - .5) * 500}px`);
    spark.style.color = i % 2 ? '#b9e5b3' : '#f4fff4';
    quizBurst.appendChild(spark);
    setTimeout(() => spark.remove(), 900);
  }
}
quizForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const current = quizQuestions[quizIndex];
  const answer = normaliseAnswer(quizAnswer.value);
  const isCorrect = answerMatches(answer, current.answers);
  if (!isCorrect) {
    quizFeedback.textContent = `Raté… la réponse était : ${current.reveal}`;
    quizFeedback.style.color = '#ff8490';
    quizPage.classList.add('alarm');
    quizCard.classList.add('alarm');
    setTimeout(() => { quizPage.classList.remove('alarm'); quizCard.classList.remove('alarm'); }, 650);
  } else {
    correctAnswers += 1;
    quizFeedback.textContent = 'Oui ! C’est exactement ça. ✦';
    quizFeedback.style.color = 'var(--pink)';
    makeQuizFireworks();
  }
  quizIndex += 1;
  setTimeout(() => {
    if (quizIndex === quizQuestions.length) {
      quizQuestion.innerHTML = `Ta note :<br /><em>${correctAnswers} / 10</em>`;
      quizCount.textContent = 'QUIZ TERMINÉ';
      quizScore.textContent = `${correctAnswers} / 10 BONNES RÉPONSES`;
      quizBar.style.width = '100%';
      quizForm.hidden = true;
      if (correctAnswers >= 8) {
        quizFeedback.textContent = correctAnswers === 10 ? 'Un sans-faute. Les cadeaux peuvent s’ouvrir. ♥' : 'Bravo, tu peux maintenant ouvrir les cadeaux. ♥';
        quizGifts.hidden = false;
      } else {
        quizFeedback.textContent = 'Il faut au moins 8/10 pour déverrouiller les cadeaux. À recommencer !';
        quizRetry.hidden = false;
      }
      return;
    }
    showQuizQuestion();
    quizAnswer.focus();
  }, 900);
});
quizRetry.addEventListener('click', () => {
  quizQuestions = [...coupleQuestions].sort(() => Math.random() - .5);
  quizIndex = 0;
  correctAnswers = 0;
  quizForm.hidden = false;
  quizRetry.hidden = true;
  quizGifts.hidden = true;
  showQuizQuestion();
  quizAnswer.focus();
});
quizGifts.addEventListener('click', () => {
  quizPage.hidden = true;
  startCameraScan();
});
async function startCameraScan() {
  cameraPage.hidden = false;
  cameraStatus.textContent = 'DEMANDE D’ACCÈS À LA CAMÉRA…';
  cameraPrompt.textContent = 'Montre ta tête à la caméra.';
  cameraError.textContent = '';
  cameraContinue.hidden = true;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    cameraVideo.srcObject = cameraStream;
    cameraStatus.textContent = 'ANALYSE DU VISAGE EN COURS…';
    setTimeout(() => {
      cameraStatus.textContent = 'ERREUR 18 — RÉSULTAT INATTENDU';
      cameraPrompt.textContent = 'Scan interrompu.';
      cameraError.textContent = 'Erreur 404 : personne beaucoup trop incroyable.';
      setTimeout(() => { cameraContinue.hidden = false; }, 5000);
    }, 3600);
  } catch {
    cameraStatus.textContent = 'CAMÉRA INDISPONIBLE';
    cameraPrompt.textContent = 'Le scan ne peut pas démarrer pour le moment.';
    cameraError.textContent = 'Erreur 404 : personne beaucoup trop incroyable.';
    setTimeout(() => { cameraContinue.hidden = false; }, 5000);
  }
}
cameraContinue.addEventListener('click', () => {
  if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  cameraVideo.srcObject = null;
  cameraPage.hidden = true;
  document.querySelector('.surprise').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
showQuizQuestion();

const secret = document.querySelector('#secret');
const secretText = document.querySelector('#secretText');
const secretNote = document.querySelector('#secretNote');
const giftScreen = document.querySelector('#giftScreen');
const giftScreenTitle = document.querySelector('#giftScreenTitle');
const giftScreenText = document.querySelector('#giftScreenText');
const giftScreenNote = document.querySelector('#giftScreenNote');
const giftNumber = document.querySelector('#giftNumber');
const giftScreenContent = document.querySelector('#giftScreenContent');
const screenContinue = document.querySelector('#screenContinue');
const memoriesButton = document.querySelector('#memoriesButton');
const memoriesPage = document.querySelector('#memoriesPage');
const collageOptions = document.querySelector('#collageOptions');
const assemblyEditor = document.querySelector('#assemblyEditor');
const photoLayout = document.querySelector('#photoLayout');
const photoInput = document.querySelector('#photoInput');
const downloadCollage = document.querySelector('#downloadCollage');
const finalPage = document.querySelector('#finalPage');
const mathPage = document.querySelector('#mathPage');
let gameState = null;
const GAME_DURATION = 60;
const openedGifts = new Set();
let fourthGiftUnlocked = false;
let selectedGift = 0;
document.querySelectorAll('.gift').forEach((gift) => gift.addEventListener('click', () => {
  const gifts = [...document.querySelectorAll('.gift')];
  selectedGift = gifts.indexOf(gift);
  if (selectedGift === 3 && !fourthGiftUnlocked) {
    secretText.innerHTML = '<em>Encore verrouillé.</em><br>Gagne le mini-jeu du cadeau 03 pour l’ouvrir.';
    secretNote.textContent = 'Courage, il est tout près. ♥';
    secret.classList.add('open');
    return;
  }
  openedGifts.add(selectedGift);
  gifts.forEach((item) => item.setAttribute('aria-expanded', 'false'));
  gift.setAttribute('aria-expanded', 'true');
  secretText.innerHTML = `<em>${gift.dataset.title}</em><br>${gift.dataset.text}`;
  secretNote.textContent = gift.dataset.note;
  secret.classList.add('open');
  giftNumber.textContent = `CADEAU 0${selectedGift + 1}`;
  if (selectedGift === 0) {
    giftScreenContent.innerHTML = `
      <div class="concert-ticket">
        <div class="ticket-top"><span>TON CADEAU D'ANNIVERSAIRE</span><span class="ticket-star">✦</span></div>
        <div class="ticket-artist">Adèle<br />Castillon</div>
        <div class="ticket-details">
          <div><span>DATE</span><strong>02 AVRIL<br />2027</strong></div>
          <div><span>LIEU</span><strong>STEREOLUX<br />NANTES</strong></div>
          <div><span>PLACEMENT</span><strong>LIBRE</strong></div>
          <div><span>AVEC</span><strong>QUI TU VEUX ♥</strong></div>
        </div>
        <div class="ticket-footer">UNE SOIRÉE À CHANTER, DANSER &amp; VIBRER ENSEMBLE</div>
      </div>
      <p class="concert-reveal">Une soirée à vivre, à chanter et à transformer en <em>souvenir précieux.</em></p>
      <small class="concert-note">Le 2 avril 2027, à Nantes — avec qui tu veux. ♥</small>`;
  } else if (selectedGift === 1) {
    giftScreenContent.innerHTML = `
      <div class="music-card">
        <div class="music-top"><span>CADEAU 02</span><span>NOTRE BANDE-SON</span></div>
        <div class="vinyl"></div>
        <h2 class="music-name">Big Jet<br /><em>Plane.</em></h2>
        <p class="music-copy">Angus &amp; Julia Stone — cette chanson qui nous ressemble et qui garde un peu de nous à chaque écoute.</p>
        <div class="music-footer">À ÉCOUTER FORT · À GARDER LONGTEMPS</div>
        <iframe class="spotify-player" src="https://open.spotify.com/embed/track/2fbXJ0VpxhW7j0qcg1DnoZ?utm_source=generator" title="Big Jet Plane — Angus & Julia Stone" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
      <p class="concert-reveal">Parce qu’il y a des morceaux qui deviennent une partie de notre <em>histoire.</em></p>
      <small class="concert-note">Notre musique, pour toujours. ♥</small>`;
  } else if (selectedGift === 2) {
    giftScreenContent.innerHTML = '';
  } else {
    giftScreenContent.innerHTML = `
      <article class="love-letter">
        <p class="eyebrow">POUR TES 18 ANS</p>
        <h2>Mon <em>amour,</em></h2>
        <p>Aujourd’hui, le 31 août, tu fêtes tes 18 ans. Et franchement, j’ai surtout l’impression de célébrer le jour où le monde a eu l’excellente idée de créer une nouvelle déesse… parce que, pour une fois, il a vraiment bien fait les choses.</p>
        <p>Depuis ce 1er mai où on s’est mis ensemble, tu as rendu mes journées beaucoup plus belles. Avec toi, même les moments les plus simples deviennent importants : un regard, un fou rire, une discussion qui dure trop longtemps, ou juste être à côté de toi sans forcément parler.</p>
        <p>Tu es belle, évidemment. Mais ce que j’aime le plus chez toi, c’est tout ce qu’il y a derrière ton sourire : ta façon d’être toi-même, ta force, ta douceur, et ton rire qui peut clairement être considéré comme une arme contre ma mauvaise humeur. Même si, soyons honnêtes, quand tu rigoles vraiment, on dirait parfois que tu grinces un peu… Je te vanne toujours en te disant qu’il te faudrait du WD-40. Mais au fond, c’est aussi ce rire-là que j’aime : celui que je reconnaîtrais entre mille et qui nous fait repartir de plus belle à chaque fois.</p>
        <p>Et puis il y a tous ces petits détails que seules les personnes qui te connaissent vraiment remarquent. Ton collier, celui que tu portes toujours. Ton doudou, sans lequel tu ne peux pas vraiment dormir. Et maintenant, mon pull aussi ;) Tu as quand même une sacrée tendance à taper dans les dressings des autres, surtout dans le mien.</p>
        <p>Il y a cette façon que tu as de faire semblant d’être forte quand ça ne va pas. De cacher beaucoup de choses derrière un sourire, comme si tu ne voulais pas déranger ou inquiéter les autres. Tu attends souvent qu’on te comprenne sans avoir à tout expliquer. Et moi, je veux apprendre à te comprendre, même dans tes silences.</p>
        <p>Je sais que tu peux pleurer pour presque rien, que tu as vite les larmes aux yeux quand on te crie dessus, et que ton premier réflexe est parfois de te protéger. Je sais aussi que tu t’énerves vite quand tu ne comprends pas quelque chose. Mais même ça, je l’aime, parce que c’est toi. Simplement toi.</p>
        <p>Tu t’attaches vite, tu as besoin d’être rassurée, et tu donnes tout aux personnes que tu aimes. Tu aimes vraiment fort, sans calculer. Et c’est une de tes plus belles qualités, même si parfois tu ne t’en rends pas compte.</p>
        <p>À 18 ans, tu entres officiellement dans le monde des adultes : les premières sorties, les boîtes, les nuits trop courtes, les nouvelles libertés et toutes les aventures qui vont avec. Et je veux que tu saches une chose : je serai là pour les découvrir avec toi, pour danser avec toi, rire avec toi, te raccompagner quand il le faudra, et vivre toutes ces nouvelles étapes à tes côtés.</p>
        <p>Je ne sais pas si les étoiles brillent autant parce qu’elles ont de la lumière ou parce qu’elles essaient de te copier. Et honnêtement, même Google n’a pas la réponse à la question que je me pose depuis le 1er mai : comment j’ai fait pour avoir autant de chance ?</p>
        <p>J’espère réussir à te faire sourire autant que tu illumines ma vie. Je t’aime pour ce que tu es, pour tout ce que tu m’apportes sans même t’en rendre compte, pour tous ces petits détails qui font que tu es toi, et pour tous les souvenirs qu’il nous reste encore à créer.</p>
        <p class="letter-ending">Joyeux 18 ans, ma chérie.<br />Je t’aime aujourd’hui, demain, et dans toutes les versions de nous qui nous attendent.</p>
      </article>`;
  }
  giftScreen.classList.add('open');
  giftScreen.setAttribute('aria-hidden', 'false');
  screenContinue.hidden = selectedGift === 0 || selectedGift === 2;
  if (selectedGift === 2) setupRunnerGame();
  // Le quatrième cadeau est bonus : les trois premiers suffisent pour continuer le parcours.
  if ([0, 1, 2].every((index) => openedGifts.has(index))) memoriesButton.hidden = false;
}));

function continueJourney() {
  stopRunnerGame();
  giftScreen.classList.remove('open');
  giftScreen.setAttribute('aria-hidden', 'true');
  const gifts = [...document.querySelectorAll('.gift')];
  const nextGift = gifts[selectedGift + 1];
  if (nextGift) {
    nextGift.focus();
    secretText.innerHTML = `Le prochain paquet t’attend :<br><em>cadeau 0${selectedGift + 2}</em>`;
    secretNote.textContent = 'Clique dessus pour continuer. ♥';
  } else {
    secretText.innerHTML = '<em>Tu as tout ouvert.</em><br>Le meilleur cadeau, c’est encore nous.';
    secretNote.textContent = 'Je t’aime. Joyeux anniversaire. ♥';
  }
}
document.querySelector('#screenContinue').addEventListener('click', continueJourney);
document.querySelector('#continueGift').addEventListener('click', continueJourney);
document.querySelector('#giftBack').addEventListener('click', () => {
  stopRunnerGame();
  giftScreen.classList.remove('open');
  giftScreen.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.gift')[selectedGift].focus();
});
memoriesButton.addEventListener('click', () => {
  memoriesPage.hidden = false;
  document.body.style.overflow = 'hidden';
});
document.querySelector('#memoriesBack').addEventListener('click', () => {
  memoriesPage.hidden = true;
  document.body.style.overflow = '';
  memoriesButton.focus();
});
let chosenPhotoSlot = null;
const selectedPhotoUrls = [null, null, null, null];
document.querySelectorAll('.collage-option').forEach((option) => option.addEventListener('click', () => {
  const layout = option.dataset.layout;
  collageOptions.hidden = true;
  assemblyEditor.hidden = false;
  photoLayout.dataset.layout = layout;
  document.querySelector('#assemblyTitle').innerHTML = layout === 'film' ? 'Notre <em>film.</em>' : layout === 'polaroids' ? 'Nos <em>polaroïds.</em>' : 'Notre <em>album.</em>';
}));
document.querySelector('#assemblyBack').addEventListener('click', () => {
  assemblyEditor.hidden = true;
  collageOptions.hidden = false;
});
document.querySelectorAll('.photo-slot').forEach((slot) => slot.addEventListener('click', () => {
  chosenPhotoSlot = slot;
  photoInput.click();
}));
photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file || !chosenPhotoSlot) return;
  const previous = chosenPhotoSlot.querySelector('img');
  if (previous) URL.revokeObjectURL(previous.src);
  const image = document.createElement('img');
  image.src = URL.createObjectURL(file);
  image.alt = 'Souvenir importé';
  chosenPhotoSlot.prepend(image);
  chosenPhotoSlot.classList.add('has-photo');
  selectedPhotoUrls[Number(chosenPhotoSlot.dataset.slot)] = image.src;
  downloadCollage.hidden = !selectedPhotoUrls.every(Boolean);
  photoInput.value = '';
});
document.querySelector('#assemblyNext').addEventListener('click', () => {
  mathPage.hidden = false;
});
document.querySelector('#mathNext').addEventListener('click', () => {
  mathPage.hidden = true;
  finalPage.hidden = false;
});
document.querySelector('#mathBack').addEventListener('click', () => {
  mathPage.hidden = true;
});
document.querySelector('#finalBack').addEventListener('click', () => {
  finalPage.hidden = true;
  mathPage.hidden = false;
});
downloadCollage.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  context.fillStyle = '#0d2418';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const images = [...document.querySelectorAll('.photo-slot img')];
  const layout = photoLayout.dataset.layout;
  if (layout === 'film') drawFilmCollage(context, images);
  else if (layout === 'polaroids') drawPolaroidCollage(context, images);
  else drawJournalCollage(context, images);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'nos-souvenirs.png';
  link.click();
});
function drawCover(context, image, x, y, width, height) {
  const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * ratio;
  const drawHeight = image.naturalHeight * ratio;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}
function drawFilmCollage(context, images) {
  context.fillStyle = '#07130c'; context.fillRect(50, 50, 1100, 800);
  const slots = [[95, 95], [620, 95], [95, 470], [620, 470]];
  slots.forEach(([x, y], index) => { drawCover(context, images[index], x, y, 485, 325); });
  context.fillStyle = '#b9e5b3';
  for (let i = 0; i < 16; i += 1) { context.fillRect(70 + i * 68, 62, 28, 15); context.fillRect(70 + i * 68, 823, 28, 15); }
}
function drawPolaroidCollage(context, images) {
  context.fillStyle = '#2f7549'; context.fillRect(0, 0, 1200, 900);
  const cards = [[100, 150, -0.12], [515, 85, 0.06], [730, 420, 0.13], [310, 475, -0.05]];
  cards.forEach(([x, y, rotation], index) => {
    context.save(); context.translate(x + 190, y + 205); context.rotate(rotation);
    context.fillStyle = '#f4fff4'; context.fillRect(-190, -205, 380, 410);
    drawCover(context, images[index], -165, -180, 330, 305);
    context.restore();
  });
}
function drawJournalCollage(context, images) {
  context.fillStyle = '#d7f2d2'; context.fillRect(0, 0, 1200, 900);
  const slots = [[45, 45, 690, 385], [755, 45, 400, 385], [45, 450, 690, 405], [755, 450, 400, 405]];
  slots.forEach(([x, y, width, height], index) => drawCover(context, images[index], x, y, width, height));
}

function setupRunnerGame() {
  giftScreenContent.innerHTML = `
    <h2>Le jeu d’<br /><em>1 minute.</em></h2>
    <div class="game-wrap">
      <div class="game-hud"><span>NE TOUCHE PERSONNE</span><strong id="gameTimer">01:00</strong></div>
      <div class="runner-game" id="runnerGame"><div class="runner-player" id="runnerPlayer"></div><div class="game-result" id="gameResult"><h3>Prêt·e ?</h3><p>Saute avec la barre espace.<br />Tiens une minute sans toucher les filles.</p><button class="game-start" id="gameStart" type="button">Commencer</button></div></div>
      <p class="game-prompt">Si tu gagnes, tu retrouves ta copine. ♥</p>
    </div>`;
  document.querySelector('#gameStart').addEventListener('click', startRunnerGame);
}

function startRunnerGame() {
  const game = document.querySelector('#runnerGame');
  const player = document.querySelector('#runnerPlayer');
  const result = document.querySelector('#gameResult');
  result.hidden = true;
  gameState = { game, player, result, startedAt: performance.now(), lastFrame: performance.now(), lastSpawn: performance.now(), y: 0, velocity: 0, obstacles: [], frame: 0 };
  spawnGirl();
  game.addEventListener('pointerdown', runnerJump);
  gameState.frame = requestAnimationFrame(runGameFrame);
}

function runGameFrame(now) {
  if (!gameState) return;
  const elapsed = (now - gameState.startedAt) / 1000;
  const delta = Math.min(.04, (now - gameState.lastFrame) / 1000);
  gameState.lastFrame = now;
  gameState.velocity -= 980 * delta;
  gameState.y = Math.max(0, gameState.y + gameState.velocity * delta);
  if (gameState.y === 0 && gameState.velocity < 0) gameState.velocity = 0;
  gameState.player.style.bottom = `${31 + gameState.y}px`;
  if (now - gameState.lastSpawn > 1400 + Math.random() * 1200) spawnGirl();
  gameState.obstacles = gameState.obstacles.filter((obstacle) => {
    obstacle.x -= (165 + elapsed * 1.55) * delta;
    obstacle.el.style.left = `${obstacle.x}px`;
    if (obstacle.x < -55) { obstacle.el.remove(); return false; }
    const p = gameState.player.getBoundingClientRect();
    const o = obstacle.el.getBoundingClientRect();
    if (p.left < o.right - 8 && p.right > o.left + 8 && p.bottom > o.top + 10) endRunnerGame(false);
    return true;
  });
  const left = Math.max(0, Math.ceil(GAME_DURATION - elapsed));
  document.querySelector('#gameTimer').textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  if (elapsed >= GAME_DURATION) { endRunnerGame(true); return; }
  if (gameState) gameState.frame = requestAnimationFrame(runGameFrame);
}

function runnerJump() {
  if (gameState && gameState.y === 0) gameState.velocity = 440;
}

function spawnGirl() {
  if (!gameState) return;
  const girl = document.createElement('div');
  girl.className = 'runner-girl';
  girl.textContent = ['👩', '👩‍🦰', '👩‍🦱', '👩‍🦳'][Math.floor(Math.random() * 4)];
  const startX = gameState.obstacles.length === 0 ? gameState.game.clientWidth * .78 : gameState.game.clientWidth + 5;
  girl.style.left = `${startX}px`;
  gameState.game.appendChild(girl);
  gameState.obstacles.push({ el: girl, x: startX });
  gameState.lastSpawn = performance.now();
}

function endRunnerGame(won) {
  if (!gameState) return;
  cancelAnimationFrame(gameState.frame);
  gameState.result.hidden = false;
  gameState.result.innerHTML = won
    ? '<div class="victory-heart">♥</div><div class="victory-love">👩‍❤️‍👨</div><h3>Tu as gagné !</h3><p>Tu retrouves ta copine. ✦<br />Vous avez gagné votre moment à deux.</p>'
    : '<h3>Perdu…</h3><p>Tu as touché une fille. Essaie encore !</p><button class="game-restart" id="gameRestart" type="button">Rejouer</button>';
  gameState = null;
  if (won) unlockFourthGift();
  const restart = document.querySelector('#gameRestart');
  if (restart) restart.addEventListener('click', setupRunnerGame);
}

function unlockFourthGift() {
  fourthGiftUnlocked = true;
  const fourthGift = document.querySelectorAll('.gift')[3];
  fourthGift.classList.remove('gift-locked');
  fourthGift.classList.add('gift-unlocked');
  fourthGift.removeAttribute('aria-disabled');
  fourthGift.querySelector('.gift-label').innerHTML = 'Cadeau 04<br /><small>Déverrouillé ✦</small>';
}

function stopRunnerGame() {
  if (gameState) cancelAnimationFrame(gameState.frame);
  gameState = null;
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && gameState) { event.preventDefault(); runnerJump(); }
});
