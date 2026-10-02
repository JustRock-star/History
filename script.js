document.querySelectorAll('[data-quiz]').forEach((quiz) => {
	const options = [...quiz.querySelectorAll('.answer-option')];
	const checkButton = quiz.querySelector('.check-answer');
	const feedback = quiz.querySelector('.quiz-feedback');
	let selected = null;

	options.forEach((option) => {
		option.addEventListener('click', () => {
			options.forEach((item) => item.setAttribute('aria-pressed', 'false'));
			option.setAttribute('aria-pressed', 'true');
			selected = option.dataset.answer;
			feedback.textContent = '';
			feedback.className = 'quiz-feedback';
		});
	});

	checkButton.addEventListener('click', () => {
		if (!selected) {
			feedback.textContent = 'Նախ ընտրիր պատասխանը։';
			feedback.className = 'quiz-feedback feedback-neutral';
			return;
		}

		const isCorrect = selected === checkButton.dataset.correct;
		feedback.textContent = isCorrect ? checkButton.dataset.feedback : 'Դեռ ճիշտ չէ։ Կրկին նայիր բաժնի օրինակը և փորձիր նորից։';
		feedback.className = isCorrect ? 'quiz-feedback feedback-correct' : 'quiz-feedback feedback-wrong';
	});
});

const mapViews = [
	{ id: 'armenia-region-map', center: [40.2, 44.9], zoom: 6 },
	{ id: 'armenia-cities-map', center: [40.25, 44.85], zoom: 8, showCities: true },
];

mapViews.forEach((view) => {
	const mapElement = document.getElementById(view.id);
	if (!mapElement || !window.L) return;

	const map = window.L.map(mapElement, { scrollWheelZoom: false, zoomControl: false }).setView(view.center, view.zoom);
	window.L.control.zoom({
		zoomInTitle: 'Մեծացնել քարտեզը',
		zoomOutTitle: 'Փոքրացնել քարտեզը',
	}).addTo(map);
	const tiles = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
	}).addTo(map);

	if (view.showCities) {
		const places = [
			{ name: 'Երևան', coordinates: [40.1792, 44.4991] },
			{ name: 'Սևան', coordinates: [40.5472, 44.9536] },
			{ name: 'Արարատ քաղաք', coordinates: [39.8300, 44.7050] },
		];

		places.forEach((place) => {
			window.L.marker(place.coordinates, { title: place.name, alt: place.name })
				.addTo(map)
				.bindTooltip(place.name, { permanent: true, direction: 'top' });
		});
	}

	tiles.once('tileload', () => mapElement.classList.add('map-loaded'));
});

const challengeForm = document.querySelector('[data-final-quiz]');

if (challengeForm) {
	const scoreCount = document.querySelector('#score-count');
	const finalMessage = document.querySelector('.final-message');

	challengeForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const questions = [...challengeForm.querySelectorAll('.challenge')];
		let score = 0;

		questions.forEach((question) => {
			const selected = question.querySelector('input:checked');
			const response = question.querySelector('.challenge-feedback');
			const isCorrect = selected?.value === question.dataset.answer;
			if (isCorrect) score += 1;
			response.textContent = selected ? (isCorrect ? 'Ճիշտ է։' : `Ճիշտ պատասխանը՝ ${question.dataset.answer}`) : 'Պատասխան չի ընտրվել։';
			response.className = `challenge-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
			question.classList.toggle('challenge-correct', isCorrect);
			question.classList.toggle('challenge-wrong', !isCorrect);
		});

		scoreCount.textContent = `${score} / ${questions.length}`;
		finalMessage.textContent = score === questions.length
			? 'Բոլոր պատասխանները ճիշտ են։ Նյութը լավ ես յուրացրել։'
			: score >= 3
				? 'Լավ արդյունք է։ Ստուգիր սխալ պատասխանները և փորձիր կրկին։'
				: 'Վերանայիր համապատասխան բաժինների օրինակները և փորձիր կրկին։';
	});

	challengeForm.addEventListener('reset', () => {
		challengeForm.querySelectorAll('.challenge').forEach((question) => {
			question.classList.remove('challenge-correct', 'challenge-wrong');
			const response = question.querySelector('.challenge-feedback');
			response.textContent = '';
			response.className = 'challenge-feedback';
		});
		scoreCount.textContent = `0 / ${challengeForm.querySelectorAll('.challenge').length}`;
		finalMessage.textContent = '';
	});
}
