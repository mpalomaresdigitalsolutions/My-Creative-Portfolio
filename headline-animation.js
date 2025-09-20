document.addEventListener('DOMContentLoaded', () => {
  const headline = document.querySelector('.headline-container');
  if (headline) {
    setTimeout(() => {
      headline.classList.add('animate');
    }, 500); // Delay for effect
  }
});