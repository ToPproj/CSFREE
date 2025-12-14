async function loadPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // 1️⃣ LOAD QUESTION
  const qRes = await fetch("http://localhost:3000/api/questions");
  const questions = await qRes.json();
  const question = questions.find(q => q.id == id);

  const questionContainer = document.getElementById("question-container");
  questionContainer.innerHTML = `
    <div class="question-box">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
            <h2 class="h4 text-primary">${question.title}</h2>
            <p class="text-light">${question.body}</p>
            <p class="text-secondary small">tags: ${question.tags}</p>
        </div>
        <div class="text-center ms-3">
            <button id="vote-btn-detail" class="btn btn-sm btn-outline-primary vote-btn">
                ▲
            </button>
            <div class="question-votes mt-1" id="vote-count-detail">${question.votes ?? 0}</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("vote-btn-detail").onclick = () => voteQuestionDetail(id, question.votes ?? 0);

  async function voteQuestionDetail(id, currentVotes) {
    const newVotes = currentVotes + 1;
    try {
      const res = await fetch(`http://localhost:3000/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes: newVotes })
      });

      if (res.ok) {
        document.getElementById("vote-count-detail").textContent = newVotes;
        const btn = document.getElementById("vote-btn-detail");
        btn.onclick = () => voteQuestionDetail(id, newVotes);
      }
    } catch (err) {
      console.error("Voting failed:", err);
    }
  }

  // 2️⃣ LOAD ANSWERS
  const aRes = await fetch(
    `http://localhost:3000/api/questions/${id}/answers`
  );
  const answers = await aRes.json();

  const answersContainer = document.getElementById("answers-container");
  answersContainer.innerHTML = "";

  if (answers.length === 0) {
    answersContainer.innerHTML =
      `<p class="text-muted">no answers yet</p>`;
  }

  answers.forEach((a, i) => {
    const div = document.createElement("div");
    div.className = "answer-box";

    div.innerHTML = `
      <div class="answer-author">anonymous said:</div>
      <div class="answer-body">${a.body}</div>
    `;

    answersContainer.appendChild(div);

    setTimeout(() => div.classList.add("visible"), i * 120);
  });

  // 3️⃣ SUBMIT ANSWER
  document.getElementById("submit-answer").onclick = async () => {
    const input = document.getElementById("answer-input");
    const text = input.value.trim();

    if (!text) return alert("answer cannot be empty");

    const res = await fetch(
      `http://localhost:3000/api/questions/${id}/answers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text })
      }
    );

    const newAnswer = await res.json();

    const added = document.createElement("div");
    added.className = "answer-box visible";
    added.innerHTML = `
      <div class="answer-author">anonymous said:</div>
      <div class="answer-body">${newAnswer.body}</div>
    `;

    answersContainer.prepend(added);
    input.value = "";
  };
}

document.addEventListener("DOMContentLoaded", loadPage);
