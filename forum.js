async function loadQuestions() {
    const response = await fetch('./data/questions.json');
    const questions = await response.json();

    const container = document.getElementById('questions-list');
    container.innerHTML = '';

    questions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';

        card.innerHTML = `
            <a href="question.html?id=${q.id}" class="text-decoration-none">
                <div class="question-title">${q.title}</div>
                <div class="question-body">${q.body}</div>
                <div class="question-tags">tags: ${q.tags.join(', ')}</div>
                <div class="question-votes">votes: ${q.votes}</div>
            </a>
        `;

        container.appendChild(card);
    });

    document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".question-card");

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("visible");
        }, index * 150); // stagger animation
    });
});

}

loadQuestions();
