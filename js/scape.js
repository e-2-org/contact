/*
 * Contact - single page scape
 *
 * Replaces the scapeframe.html frameset, names.html, sign.html and js/contact.js:
 *  - mouse/trackpad: the page scrolls when the pointer approaches an edge and
 *    boxes zoom on hover (as the original did)
 *  - touch: the page is scrolled by hand and the box nearest the centre of the
 *    screen is zoomed; boxes around it are enlarged in proportion
 *  - links open in overlay "windows" instead of popups, one per window type,
 *    sized and positioned as the original popups were; their content comes
 *    from windows.json (built by Jekyll from _data/windows.json)
 */
(function () {
	'use strict';

	var root = document.documentElement;
	var scape = document.querySelector('.scape');
	var names = document.querySelector('.names');
	var intro = document.getElementById('intro');
	var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
	var pointerQuery = matchMedia('(hover: hover) and (pointer: fine)');
	var mode;

	function viewW() { return root.clientWidth; }
	function viewH() { return root.clientHeight - names.offsetHeight; }
	function zoomInner() { return Math.min(350, viewW() - 32); }
	function zoomWidth() { return zoomInner() + 4; }
	function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

	/* ---------- box geometry ---------- */

	// measured once in the unzoomed state - box sizes never change otherwise
	var boxes = [];
	function measure() {
		boxes = Array.prototype.map.call(scape.querySelectorAll('.box'), function (el) {
			var b = { el: el, x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, p: 0 };
			el._box = b;
			return b;
		});
	}

	// shift a zoomed box sideways so that it stays on screen
	function setShift(b, scrollLeft, centre) {
		var w = zoomWidth();
		var left = centre ? b.x + b.w / 2 - w / 2 - scrollLeft : b.x - scrollLeft;
		left = clamp(left, 16, Math.max(16, viewW() - 16 - w));
		b.el.style.setProperty('--dx', Math.round(left - (b.x - scrollLeft)) + 'px');
	}

	/* ---------- zooming ---------- */

	// the box width and height animate; the text is cross-faded with a copy
	// laid out at the zoomed size, so it never re-flows (see scape.css)
	function zoomIn(b, scrollLeft, centre) {
		var el = b.el;
		var inner = zoomInner();
		if (!el._big) {
			el._big = document.createElement('span');
			el._big.className = 't-big';
			el._big.setAttribute('aria-hidden', 'true');
			el._big.textContent = el.querySelector('.t').textContent;
			el.appendChild(el._big);
		}
		clearTimeout(el._zoomTimer);
		el._big.style.width = inner + 'px';
		el.style.setProperty('--k', inner / 200);
		if (!el.classList.contains('is-zoomed') && !el.classList.contains('is-unzooming')) {
			// fix the starting height so that it can be transitioned
			el.style.height = (b.h - 4) + 'px';
			void el.offsetHeight;
		}
		el.classList.remove('is-unzooming');
		el.classList.add('is-zoomed');
		el.style.width = inner + 'px';
		el.style.height = el._big.offsetHeight + 'px';
		setShift(b, scrollLeft, centre);
	}

	function zoomOut(b) {
		var el = b.el;
		if (!el.classList.contains('is-zoomed')) return;
		el.classList.remove('is-zoomed');
		el.classList.add('is-unzooming');
		el.style.width = '';
		el.style.height = (b.h - 4) + 'px';
		el.style.setProperty('--dx', '0px');
		el._zoomTimer = setTimeout(function () {
			el.classList.remove('is-unzooming');
			el.style.height = '';
		}, reduceMotion.matches ? 0 : 450);
	}

	/* ---------- touch: centre focus ---------- */

	var focused = null;
	var pinned = null;
	var pinTimer = 0;
	var near = [];
	var ticking = false;

	function setFocus(b, scrollLeft) {
		if (focused === b) return;
		if (focused) zoomOut(focused);
		focused = b;
		if (b) zoomIn(b, scrollLeft, true);
	}

	function updateFocus() {
		ticking = false;
		if (mode !== 'touch') return;
		var vw = viewW(), vh = viewH();
		var cx = window.scrollX + vw / 2;
		var cy = window.scrollY + vh / 2;
		var radius = Math.max(160, Math.min(vw, vh) * 0.55);
		var best = null, bestScore = Infinity, focusScore = Infinity;
		var nowNear = [];

		for (var i = 0; i < boxes.length; i++) {
			var b = boxes[i];
			var dx = Math.max(b.x - cx, 0, cx - b.x - b.w);
			var dy = Math.max(b.y - cy, 0, cy - b.y - b.h);
			var d = Math.sqrt(dx * dx + dy * dy);
			var p = d < radius ? 1 - d / radius : 0;
			if (p > 0) nowNear.push(b);
			if (Math.abs(p - b.p) > 0.01 || (p === 0 && b.p !== 0)) {
				b.p = p;
				b.el.style.setProperty('--p', (p * p).toFixed(3));
				b.el.classList.toggle('is-near', p > 0);
			}
			// prefer boxes the centre is inside, then the one whose middle is closest
			var score = d + 0.15 * Math.hypot(b.x + b.w / 2 - cx, b.y + b.h / 2 - cy);
			if (score < bestScore) { bestScore = score; best = b; }
			if (b === focused) focusScore = score;
		}
		near.forEach(function (b) {
			if (nowNear.indexOf(b) === -1 && b.p !== 0) {
				b.p = 0;
				b.el.style.setProperty('--p', '0');
				b.el.classList.remove('is-near');
			}
		});
		near = nowNear;

		if (pinned) return;
		// hysteresis, so that the focus doesn't flicker between overlapping boxes
		if (bestScore > 60) best = null;
		if (focused && focusScore < 90 && focusScore <= bestScore + 24) best = focused;
		setFocus(best, window.scrollX);
	}

	function requestUpdate() {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(updateFocus);
		}
	}

	function unpin() {
		clearTimeout(pinTimer);
		pinned = null;
		requestUpdate();
	}

	// tapping a box that isn't focused brings it to the centre
	function centreBox(b) {
		var vw = viewW(), vh = viewH();
		var left = clamp(b.x + b.w / 2 - vw / 2, 0, root.scrollWidth - vw);
		var top = clamp(b.y + b.h / 2 - vh / 2, 0, root.scrollHeight - root.clientHeight);
		pinned = b;
		setFocus(b, left);
		window.scrollTo({ left: left, top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
		clearTimeout(pinTimer);
		pinTimer = setTimeout(unpin, 900);
	}

	function clearFocus() {
		setFocus(null, 0);
		boxes.forEach(function (b) {
			zoomOut(b);
			b.p = 0;
			b.el.style.setProperty('--p', '0');
			b.el.classList.remove('is-near');
		});
		near = [];
	}

	/* ---------- mouse: edge scrolling ---------- */

	var MAX_SPEED = 900; // px per second at the very edge
	var vel = { x: 0, y: 0 };
	var pos = { x: 0, y: 0 };
	var lastFrame = 0;
	var rafId = 0;

	function edgeSpeed(p, size) {
		var zone = size / 6; // the original used 1/6 of the screen, faster in the outer 1/12
		if (p < zone) return -MAX_SPEED * Math.pow(1 - p / zone, 1.6);
		if (p > size - zone) return MAX_SPEED * Math.pow(1 - (size - p) / zone, 1.6);
		return 0;
	}

	function scrollFrame(t) {
		var dt = Math.min(50, t - lastFrame) / 1000;
		lastFrame = t;
		// pick up any scrolling done some other way (wheel, keyboard)
		if (Math.abs(pos.x - window.scrollX) > 1) pos.x = window.scrollX;
		if (Math.abs(pos.y - window.scrollY) > 1) pos.y = window.scrollY;
		pos.x = clamp(pos.x + vel.x * dt, 0, root.scrollWidth - viewW());
		pos.y = clamp(pos.y + vel.y * dt, 0, root.scrollHeight - root.clientHeight);
		window.scrollTo(Math.round(pos.x), Math.round(pos.y));
		rafId = requestAnimationFrame(scrollFrame);
	}

	function setVelocity(x, y) {
		vel.x = x;
		vel.y = y;
		if ((x || y) && !rafId) {
			pos.x = window.scrollX;
			pos.y = window.scrollY;
			lastFrame = performance.now();
			rafId = requestAnimationFrame(scrollFrame);
		} else if (!x && !y && rafId) {
			cancelAnimationFrame(rafId);
			rafId = 0;
		}
	}

	function stopScrolling() { setVelocity(0, 0); }

	document.addEventListener('mousemove', function (e) {
		if (mode !== 'pointer' || intro.open || e.target.closest('.win, .names')) {
			stopScrolling();
			return;
		}
		var vh = viewH();
		setVelocity(edgeSpeed(e.clientX, viewW()), e.clientY > vh ? 0 : edgeSpeed(e.clientY, vh));
	});
	document.documentElement.addEventListener('mouseleave', stopScrolling);
	window.addEventListener('blur', stopScrolling);

	// zoom on hover (and keyboard focus)
	scape.addEventListener('mouseover', function (e) {
		var el = e.target.closest('.box');
		if (mode === 'pointer' && el) zoomIn(el._box, window.scrollX, false);
	});
	scape.addEventListener('mouseout', function (e) {
		var el = e.target.closest('.box');
		if (mode === 'pointer' && el && !el.contains(e.relatedTarget) && el !== document.activeElement) zoomOut(el._box);
	});
	scape.addEventListener('focusin', function (e) {
		var el = e.target.closest('.box');
		if (mode === 'pointer' && el) zoomIn(el._box, window.scrollX, false);
	});
	scape.addEventListener('focusout', function (e) {
		var el = e.target.closest('.box');
		if (mode === 'pointer' && el && !el.matches(':hover')) zoomOut(el._box);
	});

	/* ---------- overlay windows ---------- */

	// [width, height, left, top] of the original popup window types
	var TYPES = {
		1: [508, 500, 40, 80],
		2: [308, 580, 500, 100],
		3: [308, 360, 400, 20],
		4: [408, 500, 100, 100],
		5: [508, 300, 100, 70],
		6: [508, 540, 80, 50],
		7: [350, 300, 100, 60],
		8: [500, 500, 400, 80],
		link: [420, 0, 420, 120] // external links, now pointing at the Internet Archive
	};
	var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
		'August', 'September', 'October', 'November', 'December'];
	var THEMES = {
		fear: 'fear & loathing',
		sacred: 'sacred spaces',
		people: 'people power & participation',
		art: 'people & public art',
		city: 'city life & sociability',
		escape: 'escape routes & dreams',
		memory: 'memory & collectivity'
	};
	var wins = {};
	var zTop = 500;

	// the content of every window, keyed by the boxes' href="#key"
	var pages = null;
	var pagesReady = fetch('windows.json').then(function (r) {
		if (!r.ok) throw new Error(r.status + ' ' + r.url);
		return r.json();
	}).then(function (data) {
		pages = data;
	});

	function attr(name, value) {
		return value ? ' ' + name + '="' + value + '"' : '';
	}

	// build a window's content from its windows.json entry (see css/page.css)
	function renderPage(entry) {
		var html;
		if (entry.text) {
			html = entry.text.join('');
		} else {
			html = entry.media.map(function (m) {
				var a = attr('src', m.src) + attr('width', m.width) + attr('height', m.height) + attr('class', m.framed && 'framed');
				return /\.(mp4|mov)$/i.test(m.src) ?
					'<video' + a + ' controls playsinline preload="metadata"></video>' :
					'<img' + a + ' alt="">';
			}).join('');
			if (entry.mediaClass) html = '<div' + attr('class', entry.mediaClass) + '>' + html + '</div>';
			if (entry.caption) {
				html += '<figcaption' + attr('class', entry.captionClass) + '>' + entry.caption.map(function (p) {
					return '<p' + attr('class', p['class']) + '>' + p.html + '</p>';
				}).join('') + '</figcaption>';
			}
			html = '<figure>' + html + '</figure>';
		}
		return '<div class="page-body' + (entry['class'] ? ' ' + entry['class'] : '') + '">' + html + '</div>';
	}

	function createWin(type) {
		var w = document.createElement('section');
		w.className = 'win';
		w.setAttribute('role', 'dialog');
		w.innerHTML = '<header class="win-bar"><span class="win-title"></span>' +
			'<button type="button" class="win-close" aria-label="Close">&times;</button></header>' +
			'<div class="win-body">' + (type === 'link' ?
				'<div class="win-link"><p>This voice linked to a website, which you can visit as it was at the time:</p>' +
				'<p><a class="win-link-url" target="_blank" rel="noopener"></a></p><p class="win-link-date"></p></div>' :
				'<div class="page"></div>') + '</div>';
		w._type = type;
		w._page = w.querySelector('.page');
		w._title = w.querySelector('.win-title');
		w.querySelector('.win-close').addEventListener('click', function () { closeWin(w); });
		w.addEventListener('pointerdown', function () { raise(w); });
		w.addEventListener('mouseenter', stopScrolling);
		makeDraggable(w);
		document.body.appendChild(w);
		return w;
	}

	function raise(w) {
		w.style.zIndex = ++zTop;
	}

	function layoutWin(w) {
		var t = TYPES[w._type];
		var h = t[1] + (w._extraH || 0);
		var vw = viewW(), vh = viewH();
		var bar = w.querySelector('.win-bar').offsetHeight;
		var body = w.querySelector('.win-body');
		var s, width, height;
		if (w._page) {
			s = Math.min(1, (vw - 16) / t[0], (vh - 16 - bar) / h);
			width = Math.round(t[0] * s);
			height = Math.round(h * s);
			body.style.width = width + 'px';
			body.style.height = height + 'px';
			w._page.style.width = t[0] + 'px';
			w._page.style.height = h + 'px';
			w._page.style.transform = s < 1 ? 'scale(' + s + ')' : '';
		} else {
			width = Math.min(t[0], vw - 16);
			body.style.width = width + 'px';
			height = body.offsetHeight;
			s = width === t[0] ? 1 : 0;
		}

		var left, top;
		if (w._dragged) {
			left = w._left;
			top = w._top;
		} else if (vw >= 700 && s === 1) {
			left = t[2];
			top = t[3];
		} else {
			left = (vw - width) / 2;
			top = (vh - height - bar) / 2;
		}
		moveWin(w, left, top);
	}

	function moveWin(w, left, top) {
		w._left = clamp(left, 0, Math.max(0, viewW() - w.offsetWidth));
		w._top = clamp(top, 0, Math.max(0, viewH() - w.offsetHeight));
		w.style.left = Math.round(w._left) + 'px';
		w.style.top = Math.round(w._top) + 'px';
	}

	function prepareWin(type, title, colour) {
		var w = wins[type] || (wins[type] = createWin(type));
		// small screens: one window at a time
		if (viewW() < 700) {
			Object.keys(wins).forEach(function (k) { if (wins[k] !== w) closeWin(wins[k]); });
		}
		clearTimeout(w._blankTimer);
		w._title.textContent = title;
		w.setAttribute('aria-label', title);
		w.style.setProperty('--c', colour);
		return w;
	}

	function showWin(w) {
		layoutWin(w);
		raise(w);
		w.classList.add('is-open');
		stopScrolling();
	}

	// a window from windows.json; the title is the entry's own, or else the given one
	function openPage(key, type, title, colour) {
		if (!pages) {
			pagesReady.then(function () { openPage(key, type, title, colour); });
			return;
		}
		var entry = pages[key];
		if (!entry || !TYPES[type]) return;
		var w = prepareWin(type, entry.title || title, colour);
		if (w._key !== key) {
			w._key = key;
			w._page.innerHTML = renderPage(entry);
			w._page.scrollTop = 0;
			// let the window grow a little if the page doesn't quite fit
			w._extraH = 0;
			layoutWin(w);
			w._extraH = clamp(w._page.scrollHeight - TYPES[type][1], 0, 120);
		}
		showWin(w);
	}

	// an external website, linked to its Internet Archive copy
	function openLink(url, title, colour, link) {
		var w = prepareWin('link', title, colour);
		var a = w.querySelector('.win-link-url');
		var d = link.date;
		a.href = url;
		a.textContent = link.url;
		w.querySelector('.win-link-date').textContent = 'Opens the Internet Archive\u2019s copy from ' +
			(+d.slice(6, 8)) + ' ' + MONTHS[d.slice(4, 6) - 1] + ' ' + d.slice(0, 4) + ', in a new tab.';
		showWin(w);
	}

	function closeWin(w) {
		if (!w.classList.contains('is-open')) return;
		w.classList.remove('is-open');
		// empty the window once hidden, so that video stops
		if (!w._page) return;
		w._blankTimer = setTimeout(function () {
			w._key = null;
			w._page.innerHTML = '';
		}, 300);
	}

	function topWin() {
		var top = null;
		Object.keys(wins).forEach(function (k) {
			var w = wins[k];
			if (w.classList.contains('is-open') && (!top || +w.style.zIndex > +top.style.zIndex)) top = w;
		});
		return top;
	}

	function makeDraggable(w) {
		var bar = w.querySelector('.win-bar');
		var start = null;
		bar.addEventListener('pointerdown', function (e) {
			if (e.target.closest('button')) return;
			start = { x: e.clientX - w._left, y: e.clientY - w._top };
			bar.setPointerCapture(e.pointerId);
		});
		bar.addEventListener('pointermove', function (e) {
			if (!start) return;
			w._dragged = true;
			moveWin(w, e.clientX - start.x, e.clientY - start.y);
		});
		function end() {
			start = null;
		}
		bar.addEventListener('pointerup', end);
		bar.addEventListener('pointercancel', end);
	}

	function themeOf(el) {
		return THEMES[(el.id.match(/^[a-z]+/) || [''])[0]] || 'Contact';
	}

	scape.addEventListener('click', function (e) {
		var el = e.target.closest('.box');
		if (!el) return;
		if (mode === 'touch' && !el.classList.contains('is-zoomed') && e.detail !== 0) {
			e.preventDefault();
			centreBox(el._box);
			return;
		}
		if (el.tagName === 'A') {
			e.preventDefault();
			if (el.dataset.type === 'link') {
				openLink(el.getAttribute('href'), themeOf(el), el.style.backgroundColor,
					{ url: el.dataset.link, date: el.dataset.date });
			} else {
				openPage(el.getAttribute('href').slice(1), +el.dataset.type, themeOf(el), el.style.backgroundColor);
			}
		}
	});

	names.addEventListener('click', function (e) {
		var a = e.target.closest('a[data-type]');
		if (!a) return;
		e.preventDefault();
		openPage(a.getAttribute('href').slice(1), +a.dataset.type, a.textContent, getComputedStyle(a).backgroundColor);
	});

	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && !intro.open) {
			var w = topWin();
			if (w) closeWin(w);
		}
	});

	/* ---------- intro & fullscreen ---------- */

	var fsButton = document.getElementById('fullscreen');
	var fsEnabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;

	function isFullscreen() {
		return !!(document.fullscreenElement || document.webkitFullscreenElement);
	}
	function enterFullscreen() {
		if (!fsEnabled || isFullscreen()) return;
		try {
			var p = root.requestFullscreen ? root.requestFullscreen() : root.webkitRequestFullscreen();
			if (p && p.catch) p.catch(function () {});
		} catch (err) {}
	}
	function exitFullscreen() {
		if (document.exitFullscreen) document.exitFullscreen();
		else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
	}
	function updateFsButton() {
		var label = isFullscreen() ? 'Exit full screen' : 'Full screen';
		fsButton.setAttribute('aria-pressed', isFullscreen());
		fsButton.setAttribute('aria-label', label);
		fsButton.title = label;
	}
	if (fsEnabled) {
		fsButton.hidden = false;
		fsButton.addEventListener('click', function () {
			if (isFullscreen()) exitFullscreen(); else enterFullscreen();
		});
		document.addEventListener('fullscreenchange', updateFsButton);
		document.addEventListener('webkitfullscreenchange', updateFsButton);
		updateFsButton();
	}

	function closeIntro() {
		if (intro.classList.contains('is-leaving')) return;
		if (reduceMotion.matches) {
			intro.close();
			return;
		}
		intro.classList.add('is-leaving');
		setTimeout(function () {
			intro.close();
			intro.classList.remove('is-leaving');
		}, 600);
	}

	// a click anywhere on the intro closes it; the first time, it also goes full screen
	var introFullscreen = true;
	intro.addEventListener('click', function () {
		if (introFullscreen) enterFullscreen();
		introFullscreen = false;
		closeIntro();
	});
	document.getElementById('about').addEventListener('click', function () {
		stopScrolling();
		introFullscreen = false;
		intro.showModal();
	});
	intro.addEventListener('close', requestUpdate);

	/* ---------- setup ---------- */

	function setMode() {
		mode = pointerQuery.matches ? 'pointer' : 'touch';
		root.classList.toggle('mode-pointer', mode === 'pointer');
		root.classList.toggle('mode-touch', mode === 'touch');
		stopScrolling();
		clearFocus();
		requestUpdate();
	}

	if (pointerQuery.addEventListener) pointerQuery.addEventListener('change', setMode);
	window.addEventListener('scroll', requestUpdate, { passive: true });
	window.addEventListener('scrollend', function () { if (pinned) unpin(); });
	window.addEventListener('resize', function () {
		Object.keys(wins).forEach(function (k) {
			if (wins[k].classList.contains('is-open')) layoutWin(wins[k]);
		});
		requestUpdate();
	});

	// the names bar wraps, so its height varies
	function navResized() {
		root.style.setProperty('--nav-total', names.offsetHeight + 'px');
	}
	if (window.ResizeObserver) new ResizeObserver(navResized).observe(names);
	navResized();

	measure();
	setMode();
	intro.showModal();
})();
