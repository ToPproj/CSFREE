async function loadQuestions() {
  const res = await fetch("http://localhost:3000/api/questions");
  const questions = await res.json();

  const container = document.getElementById("questions-list");
  container.innerHTML = "";

  questions.forEach((q, index) => {
  // COLUMN (this fixes the width)
  const col = document.createElement("div");
  col.className = "col-12";

  // CARD
  const card = document.createElement("div");
  card.className = "question-card";

  card.innerHTML = `
    <a href="question.html?id=${q.id}" class="text-decoration-none">
      <div class="question-title">${q.title.toLowerCase()}</div>
      <div class="question-body">${q.body.toLowerCase()}</div>
      <div class="question-tags">tags: ${q.tags.toLowerCase()}</div>
      <div class="question-votes">votes: ${q.votes ?? 0}</div>
    </a>
  `;

  // 👇 THIS IS THE KEY PART
  col.appendChild(card);
  container.appendChild(col);

  setTimeout(() => card.classList.add("visible"), index * 120);
});
}

loadQuestions();

document.getElementById("submit-question").onclick = async () => {
  const title = document.getElementById("q-title").value.trim();
  const body = document.getElementById("q-body").value.trim();
  const tags = document.getElementById("q-tags").value.trim();

  if (!title || !body) {
    return alert("title and body required");
  }

  await fetch("http://localhost:3000/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      body,
      tags
    })
  });

  // clear form
  document.getElementById("q-title").value = "";
  document.getElementById("q-body").value = "";
  document.getElementById("q-tags").value = "";

  // reload questions
  loadQuestions();
};
