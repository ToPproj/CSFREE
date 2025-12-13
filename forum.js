async function loadQuestions() {
  const response = await fetch("http://localhost:3000/api/questions");
  const questions = await response.json();

  const container = document.getElementById("questions-list");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "question-card";

    card.innerHTML = `
      <a href="question.html?id=${q.id}" class="text-decoration-none text-light">
        <div class="question-title">${q.title}</div>
        <div class="question-body">${q.body}</div>
        <div class="question-tags">tags: ${q.tags}</div>
        <div class="question-votes">votes: ${q.votes}</div>
      </a>
    `;

    container.appendChild(card);

    setTimeout(() => {
      card.classList.add("visible");
    }, index * 120);
  });
}

document.addEventListener("DOMContentLoaded", loadQuestions);

