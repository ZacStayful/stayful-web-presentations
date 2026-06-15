(function () {

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SESSION = window.location.pathname.replace(/^\/|\.html$/g, '').split('/').pop();
  const isPresenter = new URLSearchParams(window.location.search).get('presenter') === '1';
  const API = window.location.origin;

  const KEYWORDS = [
    { slide: 'The Numbers', triggers: ['the numbers', 'income', 'revenue', 'monthly earnings', 'how much can', 'projections', 'the figures', 'gross income', 'net income'] },
    { slide: 'Investment Returns', triggers: ['investment return', 'return on investment', 'roi', 'mortgage', 'cover the mortgage', 'remortgage', 'yield', 'net profit', 'after the mortgage'] },
    { slide: 'Who Books', triggers: ['who books', 'type of guests', 'who stays', 'guest demographic', 'airbnb guests', 'kind of people', 'who are the guests'] },
    { slide: 'How Stayful works', triggers: ['how stayful works', 'how it works', 'what do you do', 'how does stayful', 'what does stayful do', 'tell me about stayful', 'what is stayful'] },
    { slide: 'Management', triggers: ['management fee', 'your fee', 'our fee', 'commission', '15 percent', '15%', 'what do you charge', 'how much do you take', 'the fee'] },
    { slide: 'Vet Guests', triggers: ['vet guests', 'vetting', 'screening', 'damage', 'insurance', 'security deposit', 'how do you protect', 'guest damage', 'trust'] },
    { slide: 'Your Experience', triggers: ['your experience', 'what will happen', 'what do i get', 'the service', 'what support', 'hands off', 'passive income', 'how involved'] },
    { slide: 'Onboarding', triggers: ['onboarding', 'getting started', 'how do we start', 'get set up', 'setup process', 'how long does it take'] },
    { slide: 'Next Steps', triggers: ['next steps', 'the contract', 'sign the', 'agreement', 'move forward', 'ready to go', 'how do we proceed'] },
    { slide: 'Property', triggers: ['your property', 'the property', 'the flat', 'the house', 'the apartment', 'bedrooms', 'location', 'postcode'] }
  ];

  function slideIndex(name) {
    const slides = [...document.querySelectorAll('.slide')];
    return slides.findIndex(s => s.dataset.name === name);
  }

  if (isPresenter && SpeechRecognition) {
    let lastSlide = null;
    let lastTime = 0;
    const DEBOUNCE = 5000;

    const panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;background:rgba(18,38,22,0.93);backdrop-filter:blur(10px);color:#f3eee0;padding:14px 16px;border-radius:12px;font-family:system-ui,sans-serif;font-size:12px;width:230px;box-shadow:0 6px 24px rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08)';
    panel.innerHTML = `<div style="font-size:9px;opacity:0.45;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">AI Navigator</div><div id="sn-text" style="opacity:0.65;min-height:30px;margin-bottom:8px;line-height:1.5;font-size:11px"></div><div id="sn-match" style="color:#8fcf87;font-weight:600;font-size:12px;min-height:16px"></div>`;
    document.body.appendChild(panel);

    const textEl = document.getElementById('sn-text');
    const matchEl = document.getElementById('sn-match');

    function checkKeywords(text) {
      const lower = text.toLowerCase();
      const now = Date.now();
      for (const entry of KEYWORDS) {
        for (const trigger of entry.triggers) {
          if (lower.includes(trigger)) {
            if (entry.slide === lastSlide && now - lastTime < DEBOUNCE) return;
            const idx = slideIndex(entry.slide);
            if (idx === -1) return;
            lastSlide = entry.slide;
            lastTime = now;
            matchEl.textContent = '→ ' + entry.slide;
            if (typeof goTo === 'function') goTo(idx);
            fetch(`${API}/api/meeting/navigate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: SESSION, slideId: idx })
            }).catch(() => {});
            return;
          }
        }
      }
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-GB';
    recog.onresult = e => {
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      textEl.textContent = t;
      checkKeywords(t);
    };
    recog.onerror = () => {};
    recog.onend = () => { try { recog.start(); } catch (_) {} };
    recog.start();
  }

  let lastSynced = null;
  setInterval(async () => {
    try {
      const res = await fetch(`${API}/api/meeting/slide?session=${SESSION}`);
      const { slideId } = await res.json();
      if (slideId !== null && slideId !== lastSynced) {
        lastSynced = slideId;
        if (!isPresenter && typeof goTo === 'function') goTo(Number(slideId));
      }
    } catch (_) {}
  }, 300);

})();
