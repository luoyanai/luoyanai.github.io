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

	var activeFilter = 'all';
	var manuallyExpandedProjects = false;
	var projectList = document.querySelector('.project-list');
	var projectToggle = document.getElementById('toggleProjects');

	function setProjectExpansion(expanded) {
		if (!projectList || !projectToggle) {
			return;
		}
		projectList.classList.toggle('is-expanded', expanded);
		projectToggle.setAttribute('aria-expanded', String(expanded));
		projectToggle.innerHTML = expanded
			? 'Show fewer demonstrations <span aria-hidden="true">↑</span>'
			: 'Show all demonstrations <span aria-hidden="true">↓</span>';
	}

	if (projectToggle) {
		projectToggle.addEventListener('click', function () {
			manuallyExpandedProjects = !manuallyExpandedProjects;
			setProjectExpansion(manuallyExpandedProjects);
		});
	}

	function applyResearchFilter(button) {
		if (!button) {
			return;
		}
		activeFilter = button.getAttribute('data-research-filter');
		document.querySelectorAll('[data-research-filter]').forEach(function (item) {
			var selected = item === button;
			item.classList.toggle('is-active', selected);
			item.setAttribute('aria-pressed', String(selected));
		});

		var publicationCount = 0;
		var projectCount = 0;
		document.querySelectorAll('[data-research]').forEach(function (item) {
			var topics = item.getAttribute('data-research').split(/\s+/);
			var visible = activeFilter === 'all' || topics.indexOf(activeFilter) !== -1;
			item.hidden = !visible;
			item.classList.remove('filter-enter');
			if (visible) {
				void item.offsetWidth;
				item.classList.add('filter-enter');
			}
			if (visible && item.classList.contains('publication-item')) {
				publicationCount += 1;
			}
			if (visible && item.classList.contains('project-row')) {
				projectCount += 1;
			}
		});

		if (projectToggle) {
			projectToggle.hidden = activeFilter !== 'all';
			setProjectExpansion(activeFilter !== 'all' || manuallyExpandedProjects);
		}

		var label = button.querySelector('strong').textContent;
		var status = document.getElementById('researchFilterStatus');
		if (status) {
			status.textContent = activeFilter === 'all'
				? 'Showing all selected work.'
				: 'Showing ' + publicationCount + ' publications and ' + projectCount + ' demonstrations for “' + label + '”.';
		}
	}

	document.querySelectorAll('[data-research-filter]').forEach(function (button) {
		button.addEventListener('click', function () {
			applyResearchFilter(button);
		});
	});

	document.querySelectorAll('[data-filter-target]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			event.preventDefault();
			var filter = link.getAttribute('data-filter-target');
			var button = document.querySelector('[data-research-filter="' + filter + '"]');
			applyResearchFilter(button);
			document.getElementById('about').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
		});
	});

	if (!prefersReducedMotion && 'IntersectionObserver' in window) {
		var revealItems = document.querySelectorAll('.section-heading, .content-grid, .research-map, .publication-item, .project-row, .timeline-item, .award-item, .letter-card, .contact-grid');
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
			if (link.hasAttribute('data-toggle') || link.hasAttribute('data-filter-target')) {
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
