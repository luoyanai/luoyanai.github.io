(function () {
	'use strict';

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	var siteHeader = document.querySelector('.site-header');
	var progressBar = document.querySelector('.scroll-progress span');
	var navLinks = Array.prototype.slice.call(document.querySelectorAll('.navbar-nav .nav-link[href^="#"]'));
	var menu = document.querySelector('.navbar-collapse');
	var menuClosing = null;
	var navigationId = 0;
	var scrollFrame = null;

	function updateScrollUI() {
		scrollFrame = null;
		var headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
		var scrollTop = window.pageYOffset;
		var scrollRange = document.documentElement.scrollHeight - window.innerHeight;
		if (siteHeader) siteHeader.classList.toggle('is-scrolled', scrollTop > 12);
		if (progressBar) progressBar.style.transform = 'scaleX(' + (scrollRange > 0 ? Math.min(1, scrollTop / scrollRange) : 0) + ')';
		document.documentElement.style.setProperty('--anchor-offset', (headerHeight + 16) + 'px');
		var current = null;
		navLinks.forEach(function (link) {
			var section = document.getElementById(link.hash.slice(1));
			if (section && section.getBoundingClientRect().top <= headerHeight + 100) current = link;
		});
		navLinks.forEach(function (link) {
			var active = link === current;
			link.parentElement.classList.toggle('active', active);
			if (active) link.setAttribute('aria-current', 'location');
			else link.removeAttribute('aria-current');
		});
	}

	function queueScrollUI() {
		if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateScrollUI);
	}
	updateScrollUI();
	window.addEventListener('scroll', queueScrollUI, { passive: true });
	window.addEventListener('resize', queueScrollUI);

	function closeMenu() {
		if (!menu || !window.jQuery || !window.jQuery.fn.collapse) return Promise.resolve();
		if (menuClosing) return menuClosing;
		if (!menu.classList.contains('show') && !menu.classList.contains('collapsing')) return Promise.resolve();
		menuClosing = new Promise(function (resolve) {
			var $menu = window.jQuery(menu);
			function finish() {
				$menu.off('.siteNavigation');
				updateScrollUI();
				resolve();
			}
			$menu.one('hidden.bs.collapse.siteNavigation', finish);
			if (menu.classList.contains('collapsing')) {
				// Wait for an opening menu before requesting the close animation.
				$menu.one('shown.bs.collapse.siteNavigation', function () { $menu.collapse('hide'); });
			} else {
				$menu.collapse('hide');
			}
		}).then(function () { menuClosing = null; });
		return menuClosing;
	}

	function hashTarget(hash) {
		if (!hash || hash === '#') return null;
		try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
		catch (error) { return null; }
	}

	function revealTarget(target, smooth) {
		updateScrollUI();
		if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		target.focus({ preventScroll: true });
		target.scrollIntoView({ behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant', block: 'start' });
		queueScrollUI();
	}

	document.querySelectorAll('a[href^="#"]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('data-toggle')) return;
			var hash = link.getAttribute('href');
			var target = hashTarget(hash);
			if (!target) return;
			event.preventDefault();
			var request = ++navigationId;
			closeMenu().then(function () {
				if (request !== navigationId) return;
				if (window.location.hash !== hash) window.history.pushState(null, '', hash);
				revealTarget(target, !link.classList.contains('skip-link'));
			});
		});
	});

	var historyFrame;
	function restoreHash() {
		window.cancelAnimationFrame(historyFrame);
		var request = ++navigationId;
		historyFrame = window.requestAnimationFrame(function () {
			closeMenu().then(function () {
				if (request !== navigationId) return;
				var target = hashTarget(window.location.hash) || document.getElementById('top');
				if (target) revealTarget(target, false);
			});
		});
	}
	window.addEventListener('popstate', restoreHash);
	window.addEventListener('hashchange', restoreHash);
	window.addEventListener('load', function () {
		if (window.location.hash) restoreHash();
	});

	window.addEventListener('beforeprint', function () {
		document.querySelectorAll('img[loading="lazy"]').forEach(function (image) {
			image.loading = 'eager';
		});
	});

	function legacyCopy(text) {
		var active = document.activeElement;
		var input = document.createElement('textarea');
		input.value = text;
		input.setAttribute('readonly', '');
		input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
		document.body.appendChild(input);
		input.select();
		var copied = false;
		try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
		input.remove();
		if (active) active.focus({ preventScroll: true });
		return copied;
	}

	function copyText(text) {
		if (navigator.clipboard && window.isSecureContext) {
			return navigator.clipboard.writeText(text).catch(function () {
				if (!legacyCopy(text)) throw new Error('Copy unavailable');
			});
		}
		return legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('Copy unavailable'));
	}

	document.querySelectorAll('[data-copy-email]').forEach(function (button) {
		var status = document.getElementById('email-copy-status');
		var fallback = document.getElementById('email-copy-fallback');
		var resetTimer;
		button.addEventListener('click', function () {
			window.clearTimeout(resetTimer);
			status.textContent = '';
			fallback.hidden = true;
			copyText(button.getAttribute('data-copy-email')).then(function () {
				status.textContent = 'Email copied.';
				resetTimer = window.setTimeout(function () { status.textContent = ''; }, 3500);
			}).catch(function () {
				status.textContent = 'Select and copy the address below.';
				fallback.hidden = false;
				var input = fallback.querySelector('input');
				input.focus();
				input.select();
			});
		});
	});

	if (window.jQuery) {
		document.querySelectorAll('.video-modal').forEach(function (modal) {
			var video = modal.querySelector('video');
			var source = video.querySelector('source');
			var status = modal.querySelector('.video-status');
			var errorMessage = modal.querySelector('.video-error');
			var directLink = modal.querySelector('.video-direct');
			var active = false;

			function showError() {
				if (!active) return;
				status.textContent = '';
				errorMessage.hidden = false;
			}
			video.addEventListener('error', showError);
			source.addEventListener('error', showError);
			video.addEventListener('loadedmetadata', function () {
				if (active) { status.textContent = 'Ready to play'; errorMessage.hidden = true; }
			});
			video.addEventListener('waiting', function () {
				if (active && !video.paused) status.textContent = 'Buffering…';
			});
			video.addEventListener('playing', function () {
				if (active) { status.textContent = ''; errorMessage.hidden = true; }
			});

			window.jQuery(modal).on('show.bs.modal', function (event) {
				active = true;
				status.textContent = 'Loading video…';
				errorMessage.hidden = true;
				video.preload = 'metadata';
				if (modal.id === 'projectVideoModal') {
					var trigger = event.relatedTarget;
					if (!trigger || !trigger.getAttribute('data-video-src')) {
						event.preventDefault();
						active = false;
						return;
					}
					source.setAttribute('src', trigger.getAttribute('data-video-src'));
					video.setAttribute('poster', trigger.getAttribute('data-video-poster'));
					modal.querySelector('#projectVideoTitle').textContent = trigger.getAttribute('data-video-title');
					video.setAttribute('aria-label', trigger.getAttribute('data-video-title'));
				} else {
					source.setAttribute('src', source.getAttribute('data-src'));
				}
				directLink.setAttribute('href', source.getAttribute('src'));
				video.load();
			}).on('shown.bs.modal', function () {
				modal.querySelector('.video-close').focus();
			}).on('hide.bs.modal', function () {
				active = false;
				video.pause();
			}).on('hidden.bs.modal', function () {
				if (video.readyState > 0) video.currentTime = 0;
				if (modal.id === 'projectVideoModal') {
					source.removeAttribute('src');
					video.removeAttribute('poster');
					video.load();
				}
				status.textContent = '';
				errorMessage.hidden = true;
			});
		});
	}
})();
