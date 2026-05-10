/* Universal interface — chat shell with stack/expand/pull-down results */

const chatEl = document.getElementById('chat');
const emptyEl = document.getElementById('empty');
const composer = document.getElementById('composer');
const inputEl = document.getElementById('input');
const sendBtn = composer.querySelector('.send');
const suggestionsEl = document.getElementById('suggestions');

const blocks = [];

/* ---------- Canned data ---------- */
const unsplashUrl = (id) => `https://images.unsplash.com/photo-${id}?w=720&h=640&fit=crop&auto=format&q=70`;

const photoBank = {
  miami: [
    '1564013799919-ab600027ffc6', // modern home
    '1600585154340-be6161a56a0c', // white modern home
    '1600596542815-ffad4c1539a9', // luxury exterior
    '1613490493576-7fde63acd811', // modern interior
    '1512917774080-9991f1c4c750', // white architecture
    '1568605114967-8130f3a36994', // modern home
    '1502672260266-1c1ef2d93688', // beach house
    '1605276374104-dee2a0ed3cd6', // luxury apartment
    '1600210492493-0946911123ea', // pool home
    '1605146768851-eda79da39897', // miami building
  ],
  shoe: [
    '1542291026-7eec264c27ff', // red Nike
    '1606107557195-0e29a4b5b4aa', // white sneaker
    '1595950653106-6c9ebd614d3a', // sneaker top
    '1608231387042-66d1773070a5', // sneakers pair
    '1556906781-9a412961c28c',   // yellow sneaker
    '1539185441755-769473a23570', // sneakers
    '1551107696-a4b0c5a0d9a2',   // gray sneakers
    '1525966222134-fcfa99b8ae77', // white sneakers
    '1460353581641-37baddab0fa2', // sneaker side
    '1597248374161-426f0d6d2fc9', // running shoe
  ],
  tokyo: [
    '1540541338287-41700207dee6', // Tokyo at night
    '1551882547-ff40c63fe5fa',   // luxury hotel room
    '1566073771259-6a8506099945', // hotel room
    '1455587734955-081b22074882', // modern hotel
    '1549693578-d683be217e58',   // hotel room
    '1535827841776-24afc1e255ac', // Tokyo street
    '1542051841857-5f90071e7989', // Tokyo lights
    '1540541338287-41700207dee6', // tokyo
    '1531366936337-7c912a4589a7', // shibuya
    '1492571350019-22de08371fd3', // tokyo neon
  ],
  book: [
    '1481627834876-b7833e8f5570', // books stack
    '1495446815901-a7297e633e8d', // books shelf
    '1512820790803-83ca734da794', // books
    '1544947950-fa07a98d237f',    // books open
    '1535905557558-afc4877a26fc', // books
    '1589998059171-988d887df646', // books
    '1456513080510-7bf3a84b82f8', // book
    '1474932430478-367dbb6832c1', // book
    '1532012197267-da84d127e765', // books
    '1551029506-0807df4e2031',    // open book
  ],
  fallback: [
    '1557682250-33bd709cbe85', '1557683316-973673baf926', '1557683304-673a23048d34',
    '1557682233-43e671d27b50', '1557682260-96773eb01377',
  ],
};

const img = (prefix, i) => {
  const list = photoBank[prefix] || photoBank.fallback;
  return unsplashUrl(list[i % list.length]);
};

const miamiItems = [
  ['Sunlit Pool House',         'Wynwood · Entire home',           '$320 / night',    4.97, 109, true],
  ['Mid-Century Bungalow',      'Coconut Grove · Entire home',     '$540 / night',    4.88, 84,  false],
  ['Designer Loft',             'Brickell · Entire condo',         '$245 / night',    4.76, 212, false],
  ['Beachfront Studio',         'South Beach · Entire studio',     '$410 / night',    4.92, 156, true],
  ['Garden Cottage',            'Coral Gables · Entire home',      '$370 / night',    4.85, 73,  false],
  ['Skyline Penthouse',         'Edgewater · Entire condo',        '$680 / night',    4.94, 41,  true],
  ['Art Deco Apartment',        'South of Fifth · Entire apt',     '$295 / night',    4.71, 188, false],
  ['Bayfront Villa',            'Key Biscayne · Entire home',      '$890 / night',    4.96, 28,  true],
  ['Pastel Bungalow',           'Little Haiti · Entire home',      '$215 / night',    4.82, 95,  false],
  ['Ocean Drive Suite',         'South Beach · Entire suite',      '$465 / night',    4.78, 142, false],
  ['Architect’s House',    'Coconut Grove · Entire home',     '$720 / night',    4.99, 19,  true],
  ['Studio with Terrace',       'Wynwood · Entire studio',         '$185 / night',    4.66, 277, false],
  ['Tropical Modernist',        'Coral Gables · Entire home',      '$610 / night',    4.91, 52,  true],
  ['Skyline Loft',              'Brickell · Entire loft',          '$350 / night',    4.74, 198, false],
  ['Casita on the Bay',         'Belle Isle · Entire home',        '$520 / night',    4.93, 67,  true],
  ['Quiet Studio Retreat',      'Buena Vista · Entire studio',     '$170 / night',    4.69, 312, false],
  ['Marina Pied‑à‑terre',       'Miami Beach · Entire apt',        '$430 / night',    4.83, 88,  false],
  ['Beachy 1‑Bedroom',          'Surfside · Entire apt',           '$305 / night',    4.79, 121, false],
];

const shoeItems = [
  ['Pegasus 41',          'Daily trainer',           '$140',   4.6, 2148, false],
  ['Endorphin Speed 4',   'Tempo trainer',           '$170',   4.7, 1322, true],
  ['Cloudmonster 2',      'Max-cushion daily',       '$180',   4.5,  973, false],
  ['Bondi 8',             'Recovery / easy',         '$165',   4.4, 1860, false],
  ['Mach 6',              'Lightweight tempo',       '$145',   4.6,  712, true],
  ['Novablast 4',         'Daily trainer',           '$140',   4.5, 1011, false],
  ['Rebel v4',            'Speed daily',             '$130',   4.7,  604, true],
  ['Triumph 22',          'Plush daily',             '$160',   4.4, 1195, false],
  ['Glycerin 21',         'Cushioned trainer',       '$165',   4.5,  854, false],
  ['Adios Pro 3',         'Race day',                '$200',   4.8,  421, true],
  ['Vaporfly 3',          'Race day',                '$200',   4.7,  1098, true],
  ['Ride 17',             'Daily trainer',           '$140',   4.4,  710, false],
  ['Floatride Energy 5',  'Value daily',             '$110',   4.3,  988, false],
  ['Wave Rider 27',       'Daily trainer',           '$140',   4.4,  672, false],
  ['Speedgoat 6',         'Trail racer',             '$155',   4.6, 1450, true],
  ['Cascadia 17',         'Trail daily',             '$140',   4.3,  605, false],
  ['Magnify 4',           'Plush daily',             '$165',   4.5,  411, false],
  ['Kinvara 14',          'Lightweight daily',       '$120',   4.5,  812, false],
];

const tokyoItems = [
  ['Hoshinoya Tokyo',          'Otemachi · Modern ryokan',      '$680 / night',    4.9, 412, true],
  ['Aman Tokyo',               'Otemachi · Luxury',             '$1,420 / night',  4.95, 287, true],
  ['Trunk(House)',             'Kagurazaka · Boutique',         '$890 / night',    4.88, 53, true],
  ['Park Hyatt Tokyo',         'Shinjuku · Iconic',             '$520 / night',    4.7, 1024, false],
  ['The Tokyo Edition',        'Toranomon · Design',            '$455 / night',    4.82, 388, false],
  ['Ace Hotel Kyoto',          'Karasuma · Design',             '$390 / night',    4.79, 612, true],
  ['Mandarin Oriental Tokyo',  'Nihombashi · Luxury',           '$870 / night',    4.86, 442, true],
  ['Bulgari Hotel Tokyo',      'Yaesu · Luxury',                '$1,640 / night',  4.93, 96,  true],
  ['Andaz Tokyo',              'Toranomon · Modern',            '$510 / night',    4.74, 712, false],
  ['Hotel Okura',              'Toranomon · Heritage',          '$430 / night',    4.71, 388, false],
  ['Trunk(Hotel) Yoyogi',      'Yoyogi Park · Boutique',        '$520 / night',    4.83, 220, true],
  ['Capitol Hotel Tokyu',      'Nagatacho · Quiet luxury',      '$485 / night',    4.78, 312, false],
  ['Hotel Niwa Tokyo',         'Suidobashi · Boutique',         '$240 / night',    4.66, 905, false],
  ['Aoyama Granz',             'Aoyama · Apartments',           '$295 / night',    4.7, 137, false],
  ['Conrad Tokyo',             'Shiodome · Skyline',            '$540 / night',    4.75, 822, false],
  ['Imperial Hotel',           'Hibiya · Heritage',             '$420 / night',    4.7, 1122, false],
  ['Janu Tokyo',               'Azabudai · New luxury',         '$1,180 / night',  4.92, 38, true],
  ['The Strings by InterCon',  'Shinagawa · City',              '$320 / night',    4.62, 511, false],
];

const bookItems = [
  ['The Library, A Visual History', 'Alphawood Press',     '$80',  4.8, 1244, true],
  ['Tokyo: A Pocket Atlas',         'Phaidon',             '$95',  4.7, 832, false],
  ['Beyond the Stars',              'Taschen',             '$120', 4.9, 411, true],
  ['Iconic Architecture',           'Thames & Hudson',     '$75',  4.6, 670, false],
  ['Color in Design',               'Princeton AP',        '$85',  4.7, 522, false],
  ['Wabi Sabi: The Wisdom',         'Penguin',             '$28',  4.6, 1880, false],
  ['Mid-Century Modern',            'Thames & Hudson',     '$60',  4.8, 412, true],
  ['Photographers on Photography',  'Laurence King',       '$45',  4.5, 287, false],
  ['Atlas Obscura',                 'Workman',             '$42',  4.9, 4112, true],
  ['On Looking',                    'Scribner',            '$22',  4.7, 1503, false],
  ['Kinfolk Garden',                'Artisan',             '$45',  4.6, 905, false],
  ['Phaidon Design Classics',       'Phaidon',             '$220', 4.9, 78,  true],
  ['Helvetica & The New York Subway','Standards Manual',   '$60',  4.7, 222, false],
  ['Dieter Rams: As Little Design', 'Phaidon',             '$80',  4.9, 612, true],
  ['Origin: A Journey',             'Bloomsbury',          '$30',  4.5, 712, false],
  ['Cabin Porn',                    'Little, Brown',       '$35',  4.6, 1488, false],
  ['Bauhaus 1919–1933',             'MoMA',                '$95',  4.8, 188, false],
  ['Saul Bass: A Life',             'Laurence King',       '$70',  4.7, 442, false],
];

function makeItem([title, sub, meta, rating, reviews, fav], i, prefix) {
  return {
    img: img(prefix, i),
    title, sub, meta, rating, reviews, fav,
  };
}

const responses = [
  {
    keywords: ['miami', 'airbnb', 'home', 'stay', 'place', 'trip'],
    bubble: 'Found 1,200+ places to stay in Miami next week.',
    bubbleSub: 'Top picks shown first',
    items: miamiItems.map((it, i) => makeItem(it, i, 'miami')),
  },
  {
    keywords: ['shoe', 'sneaker', 'running', 'trainer', 'pegasus'],
    bubble: 'Top running shoes under $200, ranked by review consensus.',
    bubbleSub: '348 results',
    items: shoeItems.map((it, i) => makeItem(it, i, 'shoe')),
  },
  {
    keywords: ['hotel', 'tokyo', 'japan', 'kyoto', 'osaka', 'ryokan'],
    bubble: 'Top-rated hotels in Tokyo, mixing iconic and design-forward.',
    bubbleSub: '530+ hotels',
    items: tokyoItems.map((it, i) => makeItem(it, i, 'tokyo')),
  },
  {
    keywords: ['book', 'gift', 'read', 'novel', 'coffee', 'present'],
    bubble: 'Coffee table books that always make a great gift.',
    bubbleSub: '120 picks',
    items: bookItems.map((it, i) => makeItem(it, i, 'book')),
  }
];

const fallback = {
  bubble: "Here are a few directions worth exploring.",
  bubbleSub: '',
  items: [
    ['Direction one',   'A starting point',  '',  0, 0, false],
    ['Direction two',   'Another angle',     '',  0, 0, false],
    ['Direction three', 'Worth considering', '',  0, 0, false],
    ['Direction four',  'Often overlooked',  '',  0, 0, false],
    ['Direction five',  'A wildcard',        '',  0, 0, false],
  ].map((it, i) => makeItem(it, i, 'fallback')),
};

function pickResponse(text) {
  const t = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const r of responses) {
    const score = r.keywords.reduce((s, k) => t.includes(k) ? s + 1 : s, 0);
    if (score > bestScore) { best = r; bestScore = score; }
  }
  return best || fallback;
}

/* ---------- DOM helpers ---------- */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith('--')) node.style.setProperty(sk, String(sv));
        else node.style[sk] = sv;
      }
    }
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function svgEl(viewBox, ...inner) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', viewBox);
  s.setAttribute('fill', 'currentColor');
  s.setAttribute('aria-hidden', 'true');
  for (const i of inner) {
    const p = document.createElementNS(ns, 'path');
    for (const [k, v] of Object.entries(i)) p.setAttribute(k, v);
    s.appendChild(p);
  }
  return s;
}

function starSvg() {
  return svgEl('0 0 24 24', { d: 'M12 2l2.95 6.59 7.05.86-5.2 4.93 1.4 7.12L12 17.77 5.8 21.5l1.4-7.12L2 9.45l7.05-.86z' });
}
function heartSvg() {
  return svgEl('0 0 32 32',
    { d: 'M16 28s-11-7.2-11-15a6 6 0 0111-3.4A6 6 0 0127 13c0 7.8-11 15-11 15z',
      fill: 'rgba(0,0,0,0.55)', stroke: 'white', 'stroke-width': '2' });
}

/* ---------- Rendering ---------- */
function scrollChatToBottom(smooth = true) {
  chatEl.scrollTo({ top: chatEl.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
}

function addUserMessage(text) {
  emptyEl.classList.add('hidden');
  suggestionsEl.classList.add('hidden');
  const msg = el('div', { class: 'msg user' }, el('div', { class: 'bubble' }, text));
  chatEl.appendChild(msg);
  scrollChatToBottom();
}

function addTyping() {
  const t = el('div', { class: 'msg ai' },
    el('div', { class: 'typing' },
      el('span'), el('span'), el('span')
    )
  );
  chatEl.appendChild(t);
  scrollChatToBottom();
  return t;
}

function buildCard(item, i) {
  const photo = el('div', { class: 'card-photo' },
    el('img', { src: item.img, alt: '', loading: 'lazy', decoding: 'async' })
  );
  if (item.fav) {
    photo.appendChild(el('div', { class: 'badge' }, 'Guest favorite'));
  }
  const heart = el('div', { class: 'heart' });
  heart.appendChild(heartSvg());
  photo.appendChild(heart);

  const titleRow = el('div', { class: 'card-title-row' },
    el('div', { class: 'card-title' }, item.title)
  );
  if (item.rating > 0) {
    const rating = el('div', { class: 'card-rating' });
    rating.appendChild(starSvg());
    rating.appendChild(document.createTextNode(' ' + item.rating.toFixed(2) + (item.reviews ? ` (${item.reviews})` : '')));
    titleRow.appendChild(rating);
  }

  const info = el('div', { class: 'card-info' },
    titleRow,
    el('div', { class: 'card-sub' }, item.sub),
    item.meta ? (() => {
      const m = el('div', { class: 'card-meta' });
      const parts = item.meta.match(/^(\$[\d,]+(?:\.\d+)?)(.*)$/);
      if (parts) {
        m.appendChild(el('span', { class: 'price' }, parts[1]));
        m.appendChild(document.createTextNode(' '));
        m.appendChild(el('span', { class: 'for' }, parts[2].trim()));
      } else {
        m.textContent = item.meta;
      }
      return m;
    })() : null
  );

  return el('button', {
    class: 'card',
    type: 'button',
    style: { '--i': String(i) }
  }, photo, info);
}

function addAiResponse(response) {
  const cards = response.items.map((it, i) => buildCard(it, i));

  const results = el('div', {
    class: 'results',
    dataset: { state: 'collapsed' },
    style: { '--n': String(response.items.length) }
  }, el('div', { class: 'pull-handle' }), ...cards);
  results.style.setProperty('--p', '0');

  const bubble = el('div', { class: 'bubble' });
  bubble.appendChild(document.createTextNode(response.bubble));
  if (response.bubbleSub) {
    bubble.appendChild(el('span', { class: 'bubble-sub' }, response.bubbleSub));
  }

  const msg = el('div', { class: 'msg ai' }, bubble, results);

  chatEl.appendChild(msg);
  scrollChatToBottom();

  const block = { el: results, p: 0, animating: false, raf: 0 };
  blocks.push(block);
  attachBlockGestures(results, block);
  return block;
}

/* ---------- p-state + animation ---------- */
function setP(block, p) {
  p = Math.max(0, Math.min(1, p));
  block.p = p;
  block.el.style.setProperty('--p', p.toFixed(4));
  if (p >= 0.999) block.el.dataset.state = 'expanded';
  else if (p <= 0.001) block.el.dataset.state = 'collapsed';
  else block.el.dataset.state = 'animating';
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t) {
  const c1 = 1.4, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Schedule next frame: prefer rAF when it runs, fall back to setTimeout
const nextFrame = (cb) => {
  let fired = false;
  const run = () => { if (fired) return; fired = true; cb(); };
  requestAnimationFrame(run);
  setTimeout(run, 18); // fallback so headless / background still ticks
};

function animateP(block, target, opts = {}) {
  block.animCancel = (block.animCancel || 0) + 1;
  const myToken = block.animCancel;
  const start = block.p;
  const dist = Math.abs(target - start);
  const duration = opts.duration ?? Math.max(220, Math.min(520, 320 + dist * 200));
  const ease = opts.ease ?? (target > start ? easeOutBack : easeOutCubic);
  const t0 = performance.now();
  block.animating = true;

  const tick = () => {
    if (block.animCancel !== myToken) return;
    const now = performance.now();
    const t = Math.min(1, (now - t0) / duration);
    const eased = ease(t);
    const p = start + (target - start) * eased;
    setP(block, p);
    if (t < 1) {
      nextFrame(tick);
    } else {
      block.animating = false;
      setP(block, target);
      if (target === 1) {
        block.el.scrollTop = 0;
        const rect = block.el.getBoundingClientRect();
        const chatRect = chatEl.getBoundingClientRect();
        if (rect.top < chatRect.top + 80) {
          chatEl.scrollBy({ top: rect.top - chatRect.top - 80, behavior: 'smooth' });
        }
      }
    }
  };
  nextFrame(tick);
}

/* ---------- Gestures: tap to expand, pull to collapse ---------- */
function attachBlockGestures(resultsEl, block) {
  const pull = {
    active: false,
    startY: 0,
    pointerId: null,
    locked: false,
  };

  // Tap to expand (only when collapsed and not currently dragging)
  resultsEl.addEventListener('click', (e) => {
    if (pull.locked) return;
    if (block.p < 0.5) {
      e.preventDefault();
      animateP(block, 1);
    }
  });

  const onDown = (e) => {
    if (block.p < 0.99) return;
    if (resultsEl.scrollTop > 1) return;
    pull.active = true;
    pull.startY = e.clientY;
    pull.pointerId = e.pointerId;
    pull.locked = false;
  };

  const onMove = (e) => {
    if (!pull.active) return;
    if (e.pointerId !== pull.pointerId) return;
    const dy = e.clientY - pull.startY;

    if (!pull.locked) {
      if (dy > 8) {
        pull.locked = true;
        try { resultsEl.setPointerCapture(e.pointerId); } catch {}
      } else if (dy < -4) {
        pull.active = false;
        return;
      } else {
        return;
      }
    }

    if (pull.locked) {
      e.preventDefault();
      const distance = 320;
      const p = 1 - dy / distance;
      setP(block, p);
    }
  };

  const onUp = (e) => {
    if (!pull.active) return;
    const wasLocked = pull.locked;
    pull.active = false;
    pull.locked = false;
    if (wasLocked) {
      try { resultsEl.releasePointerCapture?.(e.pointerId); } catch {}
      const target = block.p < 0.55 ? 0 : 1;
      animateP(block, target);
      const suppressClick = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
      resultsEl.addEventListener('click', suppressClick, { capture: true, once: true });
      setTimeout(() => resultsEl.removeEventListener('click', suppressClick, { capture: true }), 60);
    }
  };

  resultsEl.addEventListener('pointerdown', onDown);
  resultsEl.addEventListener('pointermove', onMove);
  resultsEl.addEventListener('pointerup', onUp);
  resultsEl.addEventListener('pointercancel', onUp);
}

/* ---------- Composer ---------- */
function send(text) {
  text = text.trim();
  if (!text) return;
  inputEl.value = '';
  sendBtn.disabled = true;
  addUserMessage(text);

  const typing = addTyping();
  const r = pickResponse(text);
  const delay = 500 + Math.random() * 350;

  setTimeout(() => {
    typing.remove();
    addAiResponse(r);
  }, delay);
}

inputEl.addEventListener('input', () => {
  sendBtn.disabled = inputEl.value.trim().length === 0;
});

composer.addEventListener('submit', (e) => {
  e.preventDefault();
  send(inputEl.value);
});

suggestionsEl.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  const prompt = chip.dataset.prompt || chip.textContent.trim();
  send(prompt);
});
