// Toggle detailed metrics
function toggleDetails() {
    const details = document.querySelector('.details');
    details.classList.toggle('hidden');
}

// Typing effect for the review text
const reviewText = document.querySelector('.review-text p');
const text = reviewText.textContent;
reviewText.textContent = '';
let i = 0;

function typeWriter() {
    if (i < text.length) {
        reviewText.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 50); // Adjust speed here
    }
}

window.onload = typeWriter;