(function () {
	'use strict';

	var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var siteHeader = document.querySelector('.site-header');
	var progressBar = document.querySelector('.scroll-progress span');

	function updateScrollUI() {
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		var scrollRange = document.documentElement.scrollHeight - window.innerHeight;
		if (siteHeader) {
			siteHeader.classList.toggle('is-scrolled', scrollTop > 12);
		}
		if (progressBar) {
			var progress = scrollRange > 0 ? Math.min(1, scrollTop / scrollRange) : 0;
			progressBar.style.transform = 'scaleX(' + progress + ')';
		}
	}

	updateScrollUI();
	window.addEventListener('scroll', updateScrollUI, { passive: true });
	window.addEventListener('resize', updateScrollUI);

	function copyText(text) {
		if (navigator.clipboard && window.isSecureContext) {
			return navigator.clipboard.writeText(text);
		}

		return new Promise(function (resolve, reject) {
			var temporaryInput = document.createElement('textarea');
			temporaryInput.value = text;
			temporaryInput.setAttribute('readonly', '');
			temporaryInput.style.position = 'fixed';
			temporaryInput.style.opacity = '0';
			document.body.appendChild(temporaryInput);
			temporaryInput.select();
			var copied = document.execCommand('copy');
			document.body.removeChild(temporaryInput);
			if (copied) {
				resolve();
			} else {
				reject(new Error('Clipboard copy failed'));
			}
		});
	}

	document.querySelectorAll('[data-copy-email]').forEach(function (link) {
		var resetTimer;
		link.addEventListener('click', function (event) {
			event.preventDefault();
			copyText(link.getAttribute('data-copy-email')).then(function () {
				window.clearTimeout(resetTimer);
				link.textContent = 'Email copied';
				link.setAttribute('aria-label', 'Email address copied');
				resetTimer = window.setTimeout(function () {
					link.textContent = 'Email';
					link.setAttribute('aria-label', 'Copy email address');
				}, 1800);
			}).catch(function () {
				window.location.href = link.href;
			});
		});
	});

	document.querySelectorAll('.summary-toggle').forEach(function (button) {
		button.addEventListener('click', function () {
			var summary = button.closest('.publication-content').querySelector('.research-summary');
			var willOpen = summary.hidden;
			summary.hidden = !willOpen;
			button.setAttribute('aria-expanded', String(willOpen));
			button.innerHTML = willOpen
				? '<i class="fas fa-plus" aria-hidden="true"></i> Hide Summary'
				: '<i class="fas fa-plus" aria-hidden="true"></i> Research Summary';
		});
	});

	if (!prefersReducedMotion && 'IntersectionObserver' in window) {
		var revealItems = document.querySelectorAll('.section-heading, .content-grid, .publication-item, .timeline-item, .award-item, .letter-card, .contact-grid');
		var revealObserver = new IntersectionObserver(function (entries, observer) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });

		revealItems.forEach(function (item) {
			item.classList.add('reveal-ready');
			revealObserver.observe(item);
		});
	}

	if ('IntersectionObserver' in window) {
		var navLinks = Array.prototype.slice.call(document.querySelectorAll('.navbar-nav .nav-link[href^="#"]'));
		var sectionObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) {
					return;
				}
				navLinks.forEach(function (link) {
					link.parentElement.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
				});
			});
		}, { rootMargin: '-22% 0px -68% 0px', threshold: 0 });

		document.querySelectorAll('main section[id]').forEach(function (section) {
			sectionObserver.observe(section);
		});
	}

	document.querySelectorAll('a[href^="#"]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			if (link.hasAttribute('data-toggle')) {
				return;
			}
			var targetId = link.getAttribute('href');
			if (!targetId || targetId === '#') {
				return;
			}
			var target = document.querySelector(targetId);
			if (!target) {
				return;
			}
			event.preventDefault();
			target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
			if (window.jQuery) {
				window.jQuery('.navbar-collapse').collapse('hide');
			}
		});
	});

	if (window.jQuery) {
		window.jQuery('.modal').on('show.bs.modal', function (event) {
			if (this.id === 'projectVideoModal') {
				var trigger = event.relatedTarget;
				var projectVideo = this.querySelector('video');
				var projectSource = projectVideo.querySelector('source');
				var projectTitle = this.querySelector('#projectVideoTitle');
				if (trigger) {
					projectSource.setAttribute('src', trigger.getAttribute('data-video-src'));
					projectVideo.setAttribute('poster', trigger.getAttribute('data-video-poster'));
					projectTitle.textContent = trigger.getAttribute('data-video-title');
					projectVideo.setAttribute('aria-label', trigger.getAttribute('data-video-title') + ' demonstration video');
					projectVideo.load();
				}
				return;
			}
			window.jQuery(this).find('video source[data-src]').each(function () {
				if (!this.getAttribute('src')) {
					this.setAttribute('src', this.dataset.src);
					this.parentElement.load();
				}
			});
		});

		window.jQuery('.modal').on('hidden.bs.modal', function () {
			window.jQuery(this).find('video').each(function () {
				this.pause();
				this.currentTime = 0;
			});
			if (this.id === 'projectVideoModal') {
				var projectVideo = this.querySelector('video');
				projectVideo.querySelector('source').removeAttribute('src');
				projectVideo.removeAttribute('poster');
				projectVideo.load();
			}
		});
	}
})();
