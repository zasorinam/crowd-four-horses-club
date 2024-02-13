const mediaMedium = 768;
const mediaLarge = 1024;
const stepsSlider = document.querySelector('.steps-slider');
const participantsSlider = document.querySelector('.participant-slider');
const partSliderStep = 20;
const pEls = Array.from(document.querySelectorAll('.parallax .parallax-item'));

let participantsShowedCount = 1;
let pertSliderSpeed = 1000 * (Number(participantsSlider.dataset.speed) || 0.5);

/* Parallax animation*/
function parallax(event) {
    let _w = window.innerWidth/2;
    let _h = window.innerHeight/2;
    let _mouseX = event.clientX;
    let _mouseY = event.clientY;

    let _posX1 = `${(_w - _mouseX) * 0.005}px`;
    let _posX2 = `${(_w - _mouseX) * 0.04}px`;
    let _posX3 = `${(_w - _mouseX) * 0.15}px`;


    pEls[0].style.left =_posX1;
    pEls[1].style.left =_posX2;
    pEls[2].style.left =_posX3;
}

function initParallax() {
    if (window.innerWidth > mediaLarge - 1) {
        document.addEventListener("mousemove", parallax);
    } else {
        pEls.forEach((el) => {
            el.removeAttribute('style');
        });
        document.removeEventListener("mousemove", parallax);
    }
}

/* Tickers */
function initTicker(ticker) {
    let docWidth = document.body.clientWidth;
    let tickerItems = Array.from(ticker.querySelectorAll('.ticker-items'));
    let tickerItemsWidth = tickerItems[0].offsetWidth;
    let itemsCount = 2 * Math.ceil(docWidth / tickerItemsWidth);

    if ( tickerItems.length === itemsCount ) {
        return;
    }
    if ( tickerItems.length > itemsCount ) {
        for (let i = itemsCount; i < tickerItems.length; i++) {
            tickerItems[i].remove();
        }
    } else {
        for (let i = tickerItems.length; i < itemsCount; i++) {
            tickerItems[0].parentElement.appendChild(tickerItems[0].cloneNode(true));
        }
    }
}

function initTickers() {
    Array.from(document.querySelectorAll('.ticker'))
        .forEach((ticker) => { initTicker(ticker); });
}


/* Steps Slider */

function showNextStepSlide(event) {
    changeStepSlide(Number(stepsSlider.dataset.index) + 1);
}

function showPreviousStepSlide(event) {
    changeStepSlide(Number(stepsSlider.dataset.index) - 1);
}

function changeStepSlide(event) {
    let slideIndex = Number(stepsSlider.dataset.index);
    let newIndex = (typeof event === 'number')? event: Number(event.currentTarget.getAttribute('data-slider-id'));

    if (newIndex === slideIndex) { return false; }
    stepsSlider.dataset.index = newIndex;
    updateStepSlider(stepsSlider);
}

function updateStepSlider(slider) {
    let slideIndex = Number(slider.dataset.index);
    let slidesCount = Number(slider.dataset.slides);
    let sliderControls = document.querySelector('.steps-slider-controls');
    let prevButton = sliderControls.querySelector('.btn-prev');
    let nextButton = sliderControls.querySelector('.btn-next');
    let dots = Array.from(sliderControls.querySelectorAll('.slider_dot'));

    if (slideIndex < 0) {
        slideIndex = 0;
    } else if (slideIndex > slidesCount - 1) {
        slideIndex = slidesCount - 1;
    }

    dots.forEach((dot, index) => {
        if (index === slideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    prevButton.disabled = (slideIndex === 0);
    nextButton.disabled = (slideIndex === slidesCount - 1);
}

function initStepSlider(slider) {
    let sliderControls = document.querySelector('.steps-slider-controls');
    let prevButton = sliderControls.querySelector('.btn-prev');
    let nextButton = sliderControls.querySelector('.btn-next');
    let dot = sliderControls.querySelector('.slider_dot');
    let dotParent = dot.parentElement;

    let slideCount = Array.from(slider.querySelectorAll('.steps-slide')).length;

    slider.dataset.index = '0';
    slider.dataset.slides = String(slideCount);

    prevButton.addEventListener('click', showPreviousStepSlide);
    nextButton.addEventListener('click', showNextStepSlide);

    dot.remove();

    for (let i = 0; i < slideCount; i++) {
        let newDot = dot.cloneNode(true);
        newDot.setAttribute('data-slider-id', i);
        newDot.addEventListener('click', changeStepSlide);
        dotParent.appendChild(newDot);
    }

    updateStepSlider(slider)
}

/* Participants Slider */
function changePartSlidesOrder(slideIndex) {
    let track = participantsSlider.querySelector('.participant-track');
    let slides = Array.from(participantsSlider.querySelectorAll('.participant-slide'));
    let firstSlideIndex = Number(slides[0].dataset.index);
    let firstTrueIndex = (slideIndex < (participantsShowedCount - 1))?
        slides.length - (participantsShowedCount - 1 - slideIndex): slideIndex - (participantsShowedCount - 1);
    let noEndlessLoop = slides.length;

    while (firstSlideIndex !== firstTrueIndex && noEndlessLoop) {
        track.prepend(track.lastElementChild);
        slides = Array.from(track.querySelectorAll('.participant-slide'));
        firstSlideIndex = Number(slides[0].dataset.index);
        noEndlessLoop--;
    }

}

function updateParticipantsSlider(slider) {
    let slideIndex = Number(slider.dataset.index);
    let track = slider.querySelector('.participant-track');
    let slides = Array.from(slider.querySelectorAll('.participant-slide'));
    let curNum = document.querySelector('.participant-slider-controls .current-num');

    changePartSlidesOrder(slideIndex);

    slides.forEach((slide) => {slide.classList.remove('active');});
    track.removeAttribute('style');
    slider.classList.remove('slider_animated');
    curNum.innerHTML = slideIndex + 1;
}

function showPreviousParticipant() {
    if (participantsSlider.classList.contains('slider_animated')) {
        return false;
    }
    let slideIndex = Number(participantsSlider.dataset.index);
    let slidesCount = Number(participantsSlider.dataset.slides);
    let track = document.querySelector('.participant-track');
    let slides = Array.from(track.querySelectorAll('.participant-slide'));
    let newIndex = (slideIndex - 1 + slidesCount) % slidesCount;
    let sliderGap = 20;//track.style.columnGap || 20;
    let dist = slides[0].offsetWidth + sliderGap;

    slides[participantsShowedCount - 1].classList.add('active'); + 'px';

    changePartSlidesOrder(newIndex);

    track.style.width = 'calc(100% + ' + dist + 'px)';
    track.style.left = -dist + 'px';

    let progress = dist / partSliderStep;
    participantsSlider.classList.add('slider_animated');
    let animation = setInterval(
        function () {
            let left = track.offsetLeft + progress;
            if ( left > 0) {
                clearInterval(animation);
                participantsSlider.dataset.index = newIndex;
                participantsSlider.classList.remove('slider_animated');
                updateParticipantsSlider(participantsSlider);
            } else {
                track.style.left = left + 'px';
            }
        }
        , pertSliderSpeed / partSliderStep);
}

function showNextParticipant() {
    if (participantsSlider.classList.contains('slider_animated')) {
        return false;
    }
    let slideIndex = Number(participantsSlider.dataset.index);
    let slidesCount = Number(participantsSlider.dataset.slides);
    let track = document.querySelector('.participant-track');
    let slides = Array.from(track.querySelectorAll('.participant-slide'));
    let newIndex = (slideIndex + 1) % slidesCount;
    let sliderGap = 20;//track.style.columnGap || 20;
    let dist = slides[0].offsetWidth + sliderGap;

    track.style.width = 'calc(100% + ' + dist + 'px)';
    track.querySelector('[data-index="' + newIndex + '"]').classList.add('active');

    let progress = dist / partSliderStep;
    participantsSlider.classList.add('slider_animated');
    let animation = setInterval(
        function () {
            let left = track.offsetLeft - progress;
            if ( left < -dist) {
                clearInterval(animation);
                participantsSlider.dataset.index = newIndex;
                participantsSlider.classList.remove('slider_animated');
                updateParticipantsSlider(participantsSlider);
            } else {
                track.style.left = left + 'px';
            }
        }
        , pertSliderSpeed/partSliderStep);
}

function initParticipantsSlider(slider) {
    let sliderControls = document.querySelector('.participant-slider-controls');
    let prevButton = sliderControls.querySelector('.btn-prev');
    let nextButton = sliderControls.querySelector('.btn-next');
    let sliders = Array.from(slider.querySelectorAll('.participant-slide'));
    let slideCount = sliders.length;

    prevButton.addEventListener('click', showPreviousParticipant);
    nextButton.addEventListener('click', showNextParticipant);

    slider.dataset.index = '2';
    slider.dataset.slides = String(slideCount);
    sliders.forEach((slide, index) => {
        slide.dataset.index = index;
    });

    updateParticipantsSlider(slider);
}

function cancParticipantsCount() {
    participantsShowedCount = 1;
    if (window.innerWidth > mediaMedium - 1) {
        participantsShowedCount = 2;
    }
    if (window.innerWidth > mediaLarge - 1) {
        participantsShowedCount = 3;
    }
}

function onResizeWindowHandler() {
    initParallax();
    initTickers();

    cancParticipantsCount();
    updateParticipantsSlider(participantsSlider);
}

function initPage () {
    // Parallax animation
    initParallax();

    // Setup tickers for animation
    initTickers();

    // Step Slider settings
    initStepSlider(stepsSlider);

    // Participants slider settings
    cancParticipantsCount();
    initParticipantsSlider(participantsSlider);
    // auto change every 4sec
    setInterval(function() {
        showNextParticipant();
    }, 4000);

    window.addEventListener("resize", onResizeWindowHandler);
}

initPage();
