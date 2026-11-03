/* EmailJS setup: set the public key, service ID, and reply template ID before publishing. */
const EMAILJS = {
  publicKey: "6Y-KOovKuzwoOBOaE",
  serviceId: "service_3ri14qb",
  messageTemplateId: "template_6mzqz7l"
};

const paragraphs = [
  "مش عارف إذا كان الوقت مناسب إني أقولك الكلام ده، ولا إذا كان المفروض أسيب كل حاجة زي ما هي، بس حسيت إني محتاج أكون صريح معاكي مرة أخيرة.",
  "أنا مش ناسيكي، ومش هكدب عليكي وأقول إني قدرت أتخطى كل حاجة.",
  "الحقيقة إنك وحشتيني، ووحشني وجودك في حياتي، ولسه بحبك.",
  "أنا عارف إن اللي حصل بينا مكانش سهل، وعارف إن الظروف وقتها مكنتش في صالحنا، ويمكن كل واحد فينا شاف الأمور من زاوية مختلفة.",
  "أنا مش جاي ألومك على إنك بعدتي، ولا أعاتبك على حاجة، ومش جاي أطلب منك قرار أو وعد إنتِ مش مستعدة ليه.",
  "أنا بس حابب أقولك إن رغبتي في إننا نكون مع بعض لسه موجودة.",
  "ولو إنتِ كمان لسه عندك نفس الرغبة، محتاج اعرف ده، ونسيب الأيام والظروف توضحلنا الطريق، لحد ما أكون قادر أخد الخطوة الرسمية اللي قربت...",
  "لكن في نفس الوقت، أنا محتاج أعرف الحقيقة.",
  "لسه فيه جواكي مشاعر ناحيتي؟ وعندك رغبة إننا نفضل موجودين في حياة بعض، ونحاول ندي للحكاية فرصة بشكل مختلف؟",
  "ولو مشاعرك اتغيرت، وشايفة إنه خلاص إنتِ تعبتي لحد هنا ومش قادرة تكملي المشوار، معنديش مشكلة بس هكون ارتحت إني حاولت المحاولة الأخيرة اللي مش هتخليني أندم بعدين.",
  "هحترم قرارك، حتى لو مش ده اللي نفسي فيه.",
  "أنا مش بكتب الكلام ده عشان أرجع الماضي، أنا بكتبه عشان أعرف إذا كان لسه فيه مستقبل ممكن نبنيه."
];

const screens = [...document.querySelectorAll(".screen")];
let currentScreen = "welcome";
let paragraphIndex = 0;
let sending = false;

function showScreen(id, direction = "forward") {
  currentScreen = id;
  document.body.dataset.direction = direction;
  document.body.classList.toggle("no-choice", id === "no-response");
  screens.forEach(screen => {
    screen.classList.toggle("active", screen.id === id);
    screen.setAttribute("aria-hidden", screen.id === id ? "false" : "true");
  });
}

function renderParagraph(direction = "forward") {
  document.body.dataset.direction = direction;
  document.querySelector("#letter-text").textContent = paragraphs[paragraphIndex];
  const letterText = document.querySelector("#letter-text");
  letterText.classList.remove("step-in");
  void letterText.offsetWidth;
  letterText.classList.add("step-in");
  document.querySelector("#progress-label").textContent = `${paragraphIndex + 1} / ${paragraphs.length}`;
  const route = document.querySelector("#journey-route");
  const progress = document.querySelector("#journey-progress");
  const marker = document.querySelector("#journey-marker");
  const stops = document.querySelector("#journey-stops");
  const routeLength = route.getTotalLength();
  const journeyProgress = paragraphIndex / (paragraphs.length - 1);
  progress.setAttribute("d", route.getAttribute("d"));
  progress.style.strokeDasharray = routeLength;
  progress.style.strokeDashoffset = routeLength * (1 - journeyProgress);
  stops.replaceChildren();
  paragraphs.forEach((_, index) => {
    const point = route.getPointAtLength(routeLength * index / (paragraphs.length - 1));
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    stop.setAttribute("cx", point.x);
    stop.setAttribute("cy", point.y);
    stop.setAttribute("r", index <= paragraphIndex ? "4" : "2.5");
    stop.setAttribute("class", index <= paragraphIndex ? "journey-stop visited" : "journey-stop");
    stops.appendChild(stop);
  });
  const currentPoint = route.getPointAtLength(routeLength * journeyProgress);
  marker.setAttribute("cx", currentPoint.x);
  marker.setAttribute("cy", currentPoint.y);
  const back = document.querySelector('#letter .navigation [data-action="back"]');
  back.disabled = false;
  back.style.visibility = "visible";
}

document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "start") { paragraphIndex = 0; renderParagraph(); showScreen("letter"); }
  if (action === "next-letter") {
    if (paragraphIndex < paragraphs.length - 1) { paragraphIndex++; renderParagraph(); }
    else showScreen("question");
  }
  if (action === "back") {
    if (currentScreen === "letter") {
      if (paragraphIndex > 0) { paragraphIndex--; renderParagraph("back"); }
      else showScreen("welcome", "back");
    } else if (currentScreen === "question") { paragraphIndex = paragraphs.length - 1; renderParagraph(); showScreen("letter", "back"); }
    else if (currentScreen === "reply" || currentScreen === "no-response") showScreen("question", "back");
  }
  if (action === "yes") { showScreen("reply"); document.querySelector("#reply-message").focus({ preventScroll: true }); }
  if (action === "no") showScreen("no-response");
});

function hasEmailSetup(templateId) {
  return window.emailjs && EMAILJS.publicKey && !EMAILJS.publicKey.startsWith("YOUR_") &&
    EMAILJS.serviceId && !EMAILJS.serviceId.startsWith("YOUR_") &&
    templateId && !templateId.startsWith("YOUR_");
}
document.querySelector("#reply-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (sending) return;
  const message = document.querySelector("#reply-message").value.trim();
  const status = document.querySelector("#form-status");
  if (!message) {
    status.textContent = "اكتبي اللي حابة توصليه قبل الإرسال.";
    status.classList.add("error");
    return;
  }
  if (!hasEmailSetup(EMAILJS.messageTemplateId)) {
    status.textContent = "إعدادات استقبال الرسائل لسه مش مكتملة.";
    status.classList.add("error");
    return;
  }
  sending = true;
  const button = document.querySelector("#send-button");
  button.disabled = true;
  button.textContent = "...";
  status.textContent = "جاري إرسال رسالتك...";
  status.classList.remove("error");
  try {
    emailjs.init({ publicKey: EMAILJS.publicKey });
    await emailjs.send(EMAILJS.serviceId, EMAILJS.messageTemplateId, {
      message,
      sent_at: new Date().toLocaleString("ar-EG")
    });
    document.querySelector("#reply-form").reset();
    showScreen("final");
  } catch (error) {
    console.error("EmailJS message delivery failed", error);
    status.textContent = "محصلش إرسال للرسالة. جربي تاني بعد شوية.";
    status.classList.add("error");
  } finally {
    sending = false;
    button.disabled = false;
    button.innerHTML = 'SEND <span aria-hidden="true">←</span>';
  }
});
