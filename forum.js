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
    <div class="d-flex justify-content-between align-items-start">
      <a href="question.html?id=${q.id}" class="text-decoration-none flex-grow-1">
        <div class="question-title">${q.title.toLowerCase()}</div>
        <div class="question-body">${q.body.toLowerCase()}</div>
        <div class="question-tags">tags: ${q.tags.toLowerCase()}</div>
      </a>
      <div class="text-center ms-3">
         <button class="btn btn-sm btn-outline-primary vote-btn" data-id="${q.id}">
           ▲
         </button>
         <div class="question-votes mt-1" id="vote-count-${q.id}">${q.votes ?? 0}</div>
      </div>
    </div>
  `;

    // Add click event for vote button
    const voteBtn = card.querySelector(".vote-btn");
    voteBtn.onclick = (e) => {
      e.stopPropagation(); // prevent navigation
      e.preventDefault();
      voteQuestion(q.id, q.votes ?? 0);
    };

    col.appendChild(card);
    container.appendChild(col);

    setTimeout(() => card.classList.add("visible"), index * 120);
  });
}

async function voteQuestion(id, currentVotes) {
  try {
    const newVotes = currentVotes + 1;
    const res = await fetch(`http://localhost:3000/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ votes: newVotes })
    });

    if (!res.ok) {
      alert(`Vote failed! Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log("Server response:", text);
      return;
    }

    // Success
    const el = document.getElementById(`vote-count-${id}`);
    if (el) el.textContent = newVotes;

    const btn = document.querySelector(`button[data-id="${id}"]`);
    if (btn) {
      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        voteQuestion(id, newVotes);
      };
    }
  } catch (err) {
    alert(`Vote error: ${err.message}`);
    console.error(err);
  }
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
      tags,
      votes: 0
    })
  });

  // clear form
  document.getElementById("q-title").value = "";
  document.getElementById("q-body").value = "";
  document.getElementById("q-tags").value = "";

  // reload questions
  loadQuestions();
};
