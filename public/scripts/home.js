let slideIndex = 0
function flipSlide() {
  const slides = document.getElementsByClassName("slide")
  slides[slideIndex].classList.remove('showing')
  slideIndex = (slideIndex + 1) % slides.length
  slides[slideIndex].classList.add('showing')
}

setInterval(flipSlide, 3000)
