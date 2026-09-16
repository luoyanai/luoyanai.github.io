(function () {
	'use strict';

	var guideEntries = [
		{
			terms: ['foundation', 'foundation model', 'postdoc', 'postdoctoral', 'fit', 'lab', 'collaboration', 'self-improving', 'self improving', 'embodied ai'],
			answer: '<p><strong>Research fit.</strong> The central trajectory is to connect foundation-model perception and evaluation with policies that can be validated on physical robots. MotionVL contributes model-guided learning, TOVEP contributes grounded multimodal evidence, and the humanoid systems provide the deployment layer.</p><p class="guide-sources">Sources: <a href="#motionvl-publication">MotionVL</a> · <a href="#tovep-publication">TOVEP</a> · <a href="#projects">real-robot demonstrations</a></p>'
		},
		{
			terms: ['vlm', 'vision-language', 'vision language', 'language model', 'feedback', 'reward', 'reinforcement learning', 'robot learning'],
			answer: '<p><strong>Model-guided robot learning.</strong> MotionVL uses visual-language evaluation and LLM-generated rewards as supervision for humanoid reinforcement learning. TOVEP uses a complementary strategy: it structures RGB-D and geometric evidence before asking a multimodal model to localize a physical action.</p><p class="guide-sources">Sources: <a href="#motionvl-publication">MotionVL</a> · <a href="#tovep-publication">TOVEP</a></p>'
		},
		{
			terms: ['real robot', 'real-robot', 'deployment', 'deploy', 'hardware', 'evidence', 'experiment', 'physical'],
			answer: '<p><strong>Deployment evidence.</strong> The portfolio includes real humanoid motion experiments, disturbance-resilient walking, outdoor fruit picking, retail manipulation, beverage serving, and whole-body teleoperation. Together they test perception, planning, control, and reliability beyond simulation.</p><p class="guide-sources">Sources: <a href="#walking-publication">dynamic walking paper</a> · <a href="#projects">systems and demonstrations</a></p>'
		},
		{
			terms: ['perception', 'perceive', 'rgb-d', 'rgbd', 'fruit', 'picking', 'visual', 'segmentation', 'geometric'],
			answer: '<p><strong>Grounded perception.</strong> TOVEP converts RGB-D observations into enhanced depth, structural support, and confidence cues for VLM-guided picking-point localization. The visual-servo work provides an earlier link between learned segmentation and closed-loop physical action.</p><p class="guide-sources">Sources: <a href="#tovep-publication">TOVEP</a> · <a href="#visual-servo-publication">visual-servo segmentation</a></p>'
		},
		{
			terms: ['walking', 'balance', 'terrain', 'disturbance', 'control', 'whole-body', 'whole body', 'humanoid'],
			answer: '<p><strong>Humanoid control.</strong> The DCM-based walking work handles terrain-induced, time-varying disturbances through variable-height stabilization and capturability. MotionVL extends the control agenda by introducing semantic visual supervision into humanoid reinforcement learning.</p><p class="guide-sources">Sources: <a href="#walking-publication">dynamic walking</a> · <a href="#motionvl-publication">MotionVL</a></p>'
		}
	];

	function scoreEntry(question, entry) {
		var normalized = question.toLowerCase();
		return entry.terms.reduce(function (score, term) {
			return score + (normalized.indexOf(term) !== -1 ? Math.max(1, term.split(' ').length) : 0);
		}, 0);
	}

	function runResearchGuide(question) {
		var answer = document.getElementById('researchGuideAnswer');
		var input = document.getElementById('researchQuestion');
		if (!answer || !input) {
			return;
		}

		var cleanQuestion = String(question || '').trim();
		input.value = cleanQuestion;
		if (!cleanQuestion) {
			answer.innerHTML = '<p>Try asking about VLM feedback, real-robot deployment, humanoid control, grounded perception, or postdoctoral research fit.</p>';
			answer.hidden = false;
			return;
		}

		var ranked = guideEntries.map(function (entry, index) {
			return { entry: entry, score: scoreEntry(cleanQuestion, entry), index: index };
		}).sort(function (a, b) {
			return b.score - a.score || a.index - b.index;
		});

		if (ranked[0].score === 0) {
			answer.innerHTML = '<p><strong>Closest overview.</strong> Yan Luo\'s work connects multimodal perception, foundation-model guidance, reinforcement learning, and whole-body robot control. Use the research map below to narrow the page by contribution.</p><p class="guide-sources">Start with: <a href="#publications">selected publications</a> · <a href="#projects">robot demonstrations</a></p>';
		} else {
			answer.innerHTML = ranked[0].entry.answer;
		}
		answer.hidden = false;
	}

	var guideForm = document.getElementById('researchGuideForm');
	if (guideForm) {
		guideForm.addEventListener('submit', function (event) {
			event.preventDefault();
			runResearchGuide(document.getElementById('researchQuestion').value);
		});
	}

	document.querySelectorAll('[data-research-question]').forEach(function (button) {
		button.addEventListener('click', function () {
			runResearchGuide(button.getAttribute('data-research-question'));
		});
	});

	document.querySelectorAll('[data-guide-query]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			event.preventDefault();
			runResearchGuide(link.getAttribute('data-guide-query'));
			document.querySelector('.research-guide').scrollIntoView({ behavior: 'smooth', block: 'center' });
		});
	});

	document.querySelectorAll('.ai-brief-toggle').forEach(function (button) {
		button.addEventListener('click', function () {
			var brief = button.closest('.publication-content').querySelector('.ai-brief');
			var willOpen = brief.hidden;
			brief.hidden = !willOpen;
			button.setAttribute('aria-expanded', String(willOpen));
			button.innerHTML = willOpen
				? '<i class="fas fa-times" aria-hidden="true"></i> Hide Research Brief'
				: '<i class="fas fa-magic" aria-hidden="true"></i> AI Research Brief';
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

	document.querySelectorAll('[data-research-filter]').forEach(function (button) {
		button.addEventListener('click', function () {
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
		});
	});

	document.querySelectorAll('a[href^="#"]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			if (link.hasAttribute('data-toggle') || link.hasAttribute('data-guide-query')) {
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
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			if (window.jQuery) {
				window.jQuery('.navbar-collapse').collapse('hide');
			}
		});
	});

	if (window.jQuery) {
		window.jQuery('.modal').on('show.bs.modal', function () {
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
		});
	}
})();
