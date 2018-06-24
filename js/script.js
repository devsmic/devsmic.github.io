$('#modal, #closemodal').click(function () {
	isEnded = false;
	$('#modal').fadeOut();
});

$('body').css('overflow-y', 'hidden');
$('#meetingWaters').css('overflow', 'hidden');
$('svg').css('width', '100%');
$('#modal').hide();
$('.progress span').css({
	width: '100%',
	transform: 'scaleX(0)',
	transformOrigin: 'left',
	transition: 'all 1s ease'
});

var pos = 0,
	cruise = new Cruise($('#cruise')),
	cruiseLegend = new CruiseLegend($('.cruise')),
	sections = [],
	isEnded = false,
	isManualScrolling = false,
	intervalId = -1,
	lastPos = 0,
	startPos = $('#cruise')[0].getBoundingClientRect().left,
	lastScrollX = -1,
	bullets = $('.bullets li'),
	colTemplate = $($('.col')[0]).clone(),
	backgroundSound = new Audio('audio/background.mp3'),
	alligatorSound = new Audio('audio/alligator.mp3'),
	classic_musicSound = new Audio('audio/classic_music.mp3'),
	cruise_departureSound = new Audio('audio/cruise_departure.mp3'),
	cruise_arrivalSound = new Audio('audio/cruise_arrival.mp3');

backgroundSound.autoplay = true;
alligatorSound.autoplay = true;
classic_musicSound.autoplay = true;
cruise_departureSound.autoplay = true;

backgroundSound.loop = true;
alligatorSound.loop = true;
classic_musicSound.loop = true;

alligatorSound.volume = 0;
classic_musicSound.volume = 0;

function inBoundary(lb, c, ub) {
	return lb <= c && c < ub;
}

function limit(lb, c, ub) {
	return Math.max(lb, Math.min(c, ub));
}

function Cruise(el) {
	el.css('z-index', 99).css('perspective', 180);
	var rotYArr = [], tzArr = [], imgEl = el.find('img');
	for (var i = 0; i < 5; i++) {
		rotYArr[i] = rotYArr[9-i] = i * -3;
	}
	for (var i = 0; i < 10; i++) {
		rotYArr.push(-1 * rotYArr[i]);
		tzArr[i] = tzArr[19-i] = i * 4;
	}
	this.update = function (pos) {
		var index = Math.floor(pos) % 20;
		el.css('transform', 'translateX('+(pos * 30) +'px)');
		imgEl.css('transform', 'rotateY('+rotYArr[index]+'deg) translateZ('+tzArr[index]+'px)');

		var left = el[0].getBoundingClientRect().left,
			ub = window.innerWidth * .75;

		if (left > ub) window.scrollTo(window.scrollX + left - ub, 0);
		else if (left < startPos) window.scrollTo(window.scrollX + left - startPos, 0);
	}
}

function CruiseLegend(el) {
	this.update = function (pos) {
		var tx = limit(0, pos, 183) / 183 * 250;
		el.css('transform', 'translateX('+tx+'px)');
	}
}

function Section(start, end, sectionElement, infoEls, arr, fn) {
	this.start = start;
	this.end = end;

	if (infoEls) infoEls.css('transformOrigin', 'bottom');

	this.update = function (pos) {
		pos = Math.floor(limit(start, pos, end));
		sectionElement.css('opacity', (pos - start) / 10);
		if (infoEls) {
			infoEls.css('transform', 'perspective(300px) scale('+ limit(0, 0.5 + (pos - start) / 10, 1) +') rotateX('+(limit(0, (-1 * (pos - start) + 10), 10))+'deg) translateY('+ (limit(-100, (pos - start - 10) * 10 ,0)) +'px)');
			infoEls.css('-webkit-filter', 'grayscale('+limit(0, 10 * (10 + start - pos), 100)+'%) brightness('+ (100 + limit(0, (10 + start - pos) * 3, 30)) +'%)');
			infoEls.find('h3').css('transform', 'translateY('+ limit(-20, 2 * (pos - start - 10), 0) +'px)');
			infoEls.find('p').css('transform', 'translateY('+ limit(0, (start - pos + 10) * 2, 20) +'px)');
		}
		$(arr).each(function (_, el) { el.update(pos); });
		fn && fn(pos);
	};
	this.update(0);
}

function Macaws(el, start, elevation, direction) {
	var arr = [];
	for (var i = 0; i < 10; i++) {
		arr[i] = arr[19-i] = i / 10;
	}
	el.style.zIndex = '100';
	el.style.transformOrigin = 'center';
	el.children[0].style.transformOrigin = 'top';
	el.children[1].style.transformOrigin = 'bottom';

	this.update = function (pos) {
		var index = (pos - start),
			scale = .6 + .4 * arr[index],
			rot = 60 * arr[index],
			skew = 30 * arr[index];

		el.style.transform = 'rotateZ('+(Math.sin((pos - start) * direction * Math.PI / 180) * -90)+'deg) translateX('+ ((pos-start) * elevation) +'px) scale('+scale+')';
		el.children[0].style.transform = 'rotateX('+(-1 * rot)+'deg) skewX('+(-1 * skew) +'deg)';
		el.children[1].style.transform = 'rotateX('+(rot)+'deg) skewX('+(skew) +'deg)';
	}
}
Macaws.provide = function (start) {
	return function (_, el) {
		var index = [].indexOf.call(el.parentNode.parentNode.children, el.parentNode);
		return new Macaws(el, start, el.getBoundingClientRect().width / 7, index % 2 == 0 ? 1 : -1);
	}
};

function Violin(el, posArr) {
	var arr = [];
	for (var i = 0; i < 10; i++) arr[i] = arr[19-i] = [posArr[0] * i / 10, posArr[1] * i / 10];
	this.update = function (pos) {
		var index = pos % 20;
		el.style.transform = 'translate('+arr[index][0]+'px, '+arr[index][1]+'px)';
	}
}

function Piranha(el, row) {
	var arr = [], rot = [];
	for (var i = 0; i < 6; i++) {
		arr[i] = arr[11-i] = i / 6;
		rot[i] = 0;
		rot[6 + i] = i *15;
	}
	this.update = function (pos) {
		var index = pos - 103 - (row * 12);
		if (inBoundary(0, index, 12))
			$(el).css({
				opacity: arr[index],
				transform: 'scale('+(.5 + arr[index] / 1.5)+') rotateX('+rot[index]+'deg) translateY('+(arr[index] * -50)+'px)'
			});
		else
			$(el).css({
				opacity: 0,
				transform: 'none'
			});
	}
}

function Alligator(el, row) {
	var arr = [];
	for (var i = 0; i < 3; i++) {
		arr[i] = arr[5-i] = i / 3;
	}
	this.update = function (pos) {
		var index = pos - 143 - (row * 6);
		if (inBoundary(0, index, 6))
			$(el).css({
				opacity: arr[index]
			});
		else
			$(el).css({
				opacity: 0
			});
	}
}

function Native(el, start) {
	this.update = function (pos) {
		var x = 20 * (pos - start),
			y = 30 * Math.sin(x * Math.PI / 180);

		el.children[0].children[1].style.transform =
			el.children[1].children[0].style.transform =
				'translate('+x+'px, '+y+'px)';

		el.children[0].children[0].style.transform =
			el.children[1].children[1].style.transform =
				'translate('+x+'px, '+(-1 * y)+'px)';
	}
}

function WaterPlant(el, start, offsetX, offsetY) {
	this.update = function(pos) {
		var y = offsetY + 8 * (start - pos),
			x = offsetX + 50 *  Math.sin(y * Math.PI / 180);

		el.css('transform', 'translate('+x+'px, '+y+'px)');
	}
}

function setup() {
	sections[0] = new Section(0, 23, $('#portOfManausStart svg, #portOfManausStart .info-box, #portOfManausStart img'), $('#portOfManausStart .info-box'),
		$('#portOfManausStart .animation svg > g > g').map(Macaws.provide(0)));

	$('#portOfManausEnd .animation').css('transform', 'scaleX(-1) translateX(25%)');
	sections[5] = new Section(183, 204, $('#portOfManausEnd svg, #portOfManausEnd .info-box, #portOfManausEnd img'), $('#portOfManausEnd .info-box'),
		$('#portOfManausEnd .animation svg > g > g').map(Macaws.provide(183)));

	$('#meetingWaters .animation > img').css('transformOrigin', 'left');
	$('#meetingWaters .animation > :first-child').css('transform', 'scaleX(2)');
	$('#meetingWaters .animation > :last-child').css('transform', 'scaleX(2) translateY(-50px)');
	sections[1] = new Section(23, 63, $('#meetingWaters .info-box'), $('#meetingWaters .info-box'), null, function(pos) {
		$('#meetingWaters .animation').css('transform','translateY('+ ((pos - 23) * -5) +'px)');
	});

	var sun = $('#classicMusic .top svg').css('transform', 'translate(25%, 0)'),
		sunLight = sun.find('path:first-child'),
		classicMusicNative = new Native($('#classicMusic .native')[0], 63),
		classicMusicWaterPlant = new WaterPlant($('#classicMusic .waterplant'), 63, 100, 100);


	sun.css('margin-top', '-' + sun[0].getBoundingClientRect().top +'px');
	sections[2] = new Section(63, 103, $('#classicMusic svg, #classicMusic img'), null,
		$('#classicMusic .animation svg > g > polygon').map(function (i, el) {
			return new Violin(el, [[-20, 20], [-20, 0], [-20, 10], [-20, 10]][i]);
		}), function (pos) {

			$('#classicMusic .animation > svg > g:first-child > g:nth-child(4) > polygon:not(:first-child)')
				.css('transform', 'translateY('+ (limit(-20, 2 * (-10 + pos - 63), 0)) +'px)');

			$('#classicMusic .animation svg > g + text').css('transform', 'translate(200px, '+ (limit(-20, (-10 + pos - 63) * 2, 0)) +'px)');

			$('#classicMusic text:last-child').css('transform', 'translate(200px, '+ limit(80, 80 + 2 * (73 - pos), 160) +'px)')

			if (pos < 83) classic_musicSound.volume = limit(0, (pos - 63) / 10, 1);
			else {
				classic_musicSound.volume = limit(0, (102 - pos) / 10, 1);
				sun.css('transform', 'translate(25%, '+ ((pos - 83) * -7) +'px)');
				sunLight.css('opacity', (93 - pos) / 10);
			}
			classicMusicNative.update(pos);
			classicMusicWaterPlant.update(pos);
		});

	$('#piranhas svg').css('width', '25%').css('transform', 'translateX(250%)');
	sections[3] = new Section(103, 143, $('#piranhas svg, #piranhas .info-box'), $('#piranhas .info-box'),
		$('#piranhas .animation svg > g').css('transformOrigin', 'bottom').map(function (i, el) {
			return new Piranha(el, Math.floor(i / 4));
		}));

	$('#alligator .animation').css('transform', 'translateY(100px)');
	var alligatorWaterPlant = new WaterPlant($('#alligator .waterplant'), 143, 0, 0);
	var alligatorNative = new Native($('#alligator .native').css('transform','scaleX(-1) translateY(-100px)')[0], 143);
	sections[4] = new Section(143, 183, $('#alligator svg, #alligator .info-box, #alligator img'), $('#alligator .info-box'),
		$('#alligator .animation > svg > g > g').map(function (i, el) {
			return new Alligator(el, i);
		}), function (pos) {
			if (pos < 163) alligatorSound.volume = limit(0, (pos - 143) / 10, 1);
			else alligatorSound.volume = limit(0, (182 - pos) / 10, 1);
			alligatorNative.update(pos);
			alligatorWaterPlant.update(pos);
		});
}

function update(pos) {
	cruise.update(pos);
	cruiseLegend.update(pos);
	sections.forEach(function (section) { section.update(pos); });
	var index = sections.findIndex(function (section) {
		return inBoundary(section.start, pos, section.end);
	});
	bullets.removeClass('active');
	bullets[limit(0, index, 4)].classList.add('active');

	if (pos == 203 && lastPos != 203) {
		isEnded = true;
		lastScrollX = window.scrollX;
		cruise_arrivalSound.play();
	}
}

function processData(data) {
	$("#modal .col").remove();
	$('#modal').fadeIn();
	data.dates.forEach(function (d, i) {
		var col = colTemplate.clone();
		setTimeout(function () {
			col.find('.progress span').css('transform', 'scaleX('+(d.booked / 250)+')');
		}, 300 + 500 * i);
		var date = new Date(d.date);
		var dateStr = ('' + (100 + date.getDate())).substr(1) + "/" + ('' + (101 + date.getMonth())).substr(1) + "/" + date.getFullYear();

		col.find('h4').html(dateStr);
		col.find('.percent').html((d.booked / 2.5).toFixed(2) + "% Booked");
		$('#modal .box').append(col);
	})
}

setup();

document.addEventListener('wheel', function (e) {
	clearInterval(intervalId);
	if (isEnded) return;;
	lastPos = pos;
	pos = limit(0, pos + (e.deltaY > 0 ? 1 : -1), 203);
	isManualScrolling = true;
	update(pos);
});

cruise_arrivalSound.addEventListener('ended', function () {
	$.ajax('dates.json').success(processData).error(function () {
		processData(data);
		console && console.clear && console.clear();
	})
});

bullets.each(function (i, el) {
	var targetPos = limit(0, sections[i].start, 203);
	el.onclick = function() {
		if (isEnded) return;
		intervalId = setInterval(function() {
			lastPos = pos;
			if (pos < targetPos) pos++;
			else if (pos > targetPos) pos--;

			if(Math.floor(pos) == targetPos) {
				clearInterval(intervalId);
			}
			isManualScrolling = true;
			update(pos);
		}, 1000 / 60);
	}
});

let currX = 0;

var hammer = new Hammer(document.getElementById('cruise'));
hammer.on('pan', (e) => {
    if (e.additionalEvent === 'panright') {
        currX += e.center.x;
    } else if (e.additionalEvent === 'panleft') {
        currX -= e.center.x;
    }

    if (isManualScrolling) {
        isManualScrolling = false;
        return;
    }

    clearInterval(intervalId);
    pos = limit(0, currX / 800 ,203);
    update(pos);
    window.scrollTo(currX / 30, 0);
});

window.onscroll = function() {
    if (isEnded) {
        window.scrollTo(lastScrollX, 0);
        return;
    }
};

window.onbeforeunload = function() {
	window.scrollTo(0, 0);
};

window.onerror = function(e) {
	console && console.clear && console.clear();
	e.preventDefault && e.preventDefault();
};