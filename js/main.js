/* 2 Brothers Elevator
   1. Mobile menu   2. Quote form to WhatsApp   3. Elevator simulator
   4. Series specifications   5. Budget estimator */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '966539486241';

  function $(id) { return document.getElementById(id); }
  function all(selector) { return [].slice.call(document.querySelectorAll(selector)); }

  /* 1. Mobile menu ---------------------------------------------------------- */
  var navToggle = $('nav-toggle');
  var nav = $('site-nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.textContent = open ? 'Close' : 'Menu';
  }
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setMenu(false);
    });
  }

  /* 2. Quote form to WhatsApp ----------------------------------------------- */
  var form = $('quote-form');
  var waLink = $('wa-send');

  function fieldValue(id) {
    var el = $(id);
    return el ? el.value : '';
  }
  function updateWhatsApp() {
    if (!waLink) return;
    var text = 'Hello 2 Brothers Elevator,\n' +
      'Name: ' + fieldValue('f-name') + '\n' +
      'Phone: ' + fieldValue('f-phone') + '\n' +
      'Email: ' + fieldValue('f-email') + '\n' +
      'Building: ' + fieldValue('f-type') + '\n' +
      'Need: ' + fieldValue('f-service') + '\n' +
      'Floors: ' + fieldValue('f-floors') + '\n' +
      'Message: ' + fieldValue('f-msg');
    waLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }
  if (form) {
    form.addEventListener('input', updateWhatsApp);
    form.addEventListener('change', updateWhatsApp);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    updateWhatsApp();
  }

  /* 3. Elevator simulator --------------------------------------------------- */
  var cab = $('sim-cab');
  var statusEl = $('sim-status');
  var floorEl = $('sim-floor');
  var arrowEl = $('sim-arrow');
  var floorButtons = all('.floor-btn');
  var openButton = $('sim-open');
  var closeButton = $('sim-close');
  var chimeButton = $('sim-chime');

  var FLOOR_CODES = ['GF', '1', '2', '3', '4', 'PH'];
  var currentFloor = 0;
  var moving = false;
  var chimeOn = true;
  var audioCtx = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playChime() {
    if (!chimeOn) return;
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioCtx = audioCtx || new AudioCtx();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.8);
    } catch (err) { /* audio not available, ignore */ }
  }

  function setStatus(text) { statusEl.textContent = text; }
  function setDoors(open) { cab.classList.toggle('open', open); }
  function markActive(index) {
    floorButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(Number(btn.getAttribute('data-floor')) === index));
    });
  }
  function lockControls(locked) {
    floorButtons.forEach(function (btn) { btn.disabled = locked; });
    openButton.disabled = locked;
    closeButton.disabled = locked;
  }

  function goToFloor(target) {
    if (moving) return;
    if (target === currentFloor) {
      setDoors(true);
      setStatus('DOORS OPEN · FLOOR ' + FLOOR_CODES[currentFloor]);
      return;
    }
    moving = true;
    lockControls(true);

    var direction = target > currentFloor ? 1 : -1;
    var distance = Math.abs(target - currentFloor);
    var doorWait = reduceMotion ? 20 : 800;
    var travelTime = reduceMotion ? 60 : 500 + distance * 450;

    setDoors(false);
    arrowEl.textContent = direction > 0 ? '▲' : '▼';
    setStatus(direction > 0 ? 'MOVING UP' : 'MOVING DOWN');
    playChime();

    setTimeout(function () {
      cab.style.setProperty('--travel', travelTime + 'ms');
      cab.style.setProperty('--floor', target);
      markActive(target);

      /* update the display as the cab passes each floor */
      for (var step = 1; step < distance; step++) {
        (function (s) {
          setTimeout(function () { floorEl.textContent = FLOOR_CODES[currentFloor + direction * s]; }, travelTime * s / distance);
        })(step);
      }

      setTimeout(function () {
        currentFloor = target;
        floorEl.textContent = FLOOR_CODES[target];
        arrowEl.textContent = '●';
        setStatus('ARRIVED · FLOOR ' + FLOOR_CODES[target]);
        playChime();
        setDoors(true);
        moving = false;
        lockControls(false);
      }, travelTime + 100);
    }, doorWait);
  }

  if (cab) {
    floorButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { goToFloor(Number(btn.getAttribute('data-floor'))); });
    });
    openButton.addEventListener('click', function () {
      if (moving) return;
      setDoors(true);
      setStatus('DOORS OPEN · FLOOR ' + FLOOR_CODES[currentFloor]);
    });
    closeButton.addEventListener('click', function () {
      if (moving) return;
      setDoors(false);
      setStatus('DOORS CLOSED · FLOOR ' + FLOOR_CODES[currentFloor]);
    });
    chimeButton.addEventListener('click', function () {
      chimeOn = !chimeOn;
      chimeButton.setAttribute('aria-pressed', String(chimeOn));
      chimeButton.textContent = 'Chime: ' + (chimeOn ? 'on' : 'off');
    });
  }

  /* 4. Series specifications ------------------------------------------------ */
  var SERIES = {
    passenger: {
      title: 'Passenger Series: Apex-V1',
      subtitle: 'High-speed commercial grade',
      desc: 'Designed for high-rise commercial hubs and premium residential complexes. A gearless permanent magnet motor gives smooth acceleration and saves energy.',
      capacity: '630 kg – 1600 kg', speed: '1.0 – 4.0 m/s',
      finish: 'Titanium gold and glass', drive: 'VVVF gearless'
    },
    panoramic: {
      title: 'Panoramic Glass Series: Aero-Sight',
      subtitle: 'Architectural scenic lift',
      desc: 'Laminated safety glass cabins with a 180° to 360° view. Ideal for shopping malls, hotels and high-end modern villas.',
      capacity: '800 kg – 1250 kg', speed: '1.0 – 2.5 m/s',
      finish: 'Laminated curved glass', drive: 'Silent gearless traction'
    },
    villa: {
      title: 'Private Villa Series: Residence-Pro',
      subtitle: 'Compact, shallow pit',
      desc: 'Needs minimal headroom and no deep civil pit, and runs from a standard home power supply.',
      capacity: '320 kg – 450 kg', speed: '0.4 – 1.0 m/s',
      finish: 'Wood veneer and soft gold', drive: 'Compact hydraulic or gearless'
    },
    freight: {
      title: 'Heavy Freight Series: Titan Cargo',
      subtitle: 'Industrial heavy duty',
      desc: 'Built for warehouses, factories and hospitals, with reinforced anti-collision bumper rails and a heavy steel floor.',
      capacity: '2000 kg – 5000 kg', speed: '0.5 – 1.0 m/s',
      finish: 'Chequered steel plate', drive: 'Heavy duty VVVF motor'
    }
  };
  var seriesButtons = all('[data-series]');

  function showSeries(key) {
    var data = SERIES[key];
    if (!data) return;
    $('series-title').textContent = data.title;
    $('series-subtitle').textContent = data.subtitle;
    $('series-desc').textContent = data.desc;
    $('spec-capacity').textContent = data.capacity;
    $('spec-speed').textContent = data.speed;
    $('spec-finish').textContent = data.finish;
    $('spec-drive').textContent = data.drive;
    seriesButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-series') === key));
    });
    Object.keys(SERIES).forEach(function (k) {
      var visual = $('vis-' + k);
      if (visual) visual.hidden = (k !== key);
    });
  }
  seriesButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { showSeries(btn.getAttribute('data-series')); });
  });
  if (seriesButtons.length) showSeries('passenger');

  /* 5. Budget estimator ----------------------------------------------------- */
  var USD_TO_SAR = 3.75;
  var est = {
    type: 'residential', typeMult: 1, typeLabel: 'Residential',
    finish: 'standard', finishMult: 1, finishLabel: 'Stainless steel'
  };
  var BUILDING_OPTIONS = {
    residential: 'Residential building',
    commercial: 'Commercial / office',
    villa: 'Villa / house',
    industrial: 'Warehouse / factory'
  };
  var floorsInput = $('est-floors');
  var capacitySelect = $('est-capacity');

  function formatNumber(n) { return n.toLocaleString('en-US'); }

  function updateEstimate() {
    if (!floorsInput) return;
    var floors = Number(floorsInput.value);
    var capacity = Number(capacitySelect.value);

    /* base price + per-floor cost + load cost, scaled by building type and finish */
    var usd = (12000 + floors * 1800 + (capacity / 100) * 400) * est.typeMult * est.finishMult;
    var min = Math.round(usd * USD_TO_SAR / 500) * 500;
    var max = Math.round(usd * 1.25 * USD_TO_SAR / 500) * 500;

    est.floors = floors;
    est.priceText = 'SAR ' + formatNumber(min) + ' – ' + formatNumber(max);
    est.selectionText = est.typeLabel + ', ' + floors + ' floors, ' + capacity + ' kg, ' + est.finishLabel;

    $('est-price').textContent = est.priceText;
    $('est-floors-val').textContent = floors + ' floors';
    $('est-selection').textContent = est.typeLabel + ' · ' + floors + ' floors · ' + capacity + ' kg';
    $('est-speed').textContent = floors <= 6 ? '1.0 m/s' : floors <= 15 ? '1.75 m/s' : '2.5 – 4.0 m/s';
  }

  all('.opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.getAttribute('data-group');
      all('.opt[data-group="' + group + '"]').forEach(function (other) {
        other.setAttribute('aria-pressed', String(other === btn));
      });
      est[group] = btn.getAttribute('data-key');
      est[group + 'Mult'] = parseFloat(btn.getAttribute('data-mult'));
      est[group + 'Label'] = btn.textContent;
      updateEstimate();
    });
  });

  if (floorsInput) {
    floorsInput.addEventListener('input', updateEstimate);
    capacitySelect.addEventListener('change', updateEstimate);
    updateEstimate();

    /* "Request this quote" fills the form below with the estimate */
    $('est-cta').addEventListener('click', function () {
      var floors = $('f-floors'), type = $('f-type'), service = $('f-service'), message = $('f-msg');
      if (floors) floors.value = String(est.floors);
      if (type) type.value = BUILDING_OPTIONS[est.type];
      if (service) service.value = 'New elevator';
      if (message) message.value = 'Estimate request: ' + est.selectionText + '. Indicative range: ' + est.priceText + '.';
      updateWhatsApp();
    });
  }
})();
