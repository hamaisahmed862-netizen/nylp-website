const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwAXVHHgERH2Jf4zMAnR6bHLZRj-pe8GRT67oxyQh5RYaW-ky52kmZg-ofZDxZY6NH/exec";

let questions = [];
let currentQuestion = 0;
let score = 0;
let studentName = "";
let quizStarted = false;
let selectedOption = null;

const nameStage = document.getElementById("nameStage");
const quizStage = document.getElementById("quizStage");
const certStage = document.getElementById("certStage");

const studentNameInput = document.getElementById("studentName");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const progressText = document.getElementById("progressText");
const certName = document.getElementById("certName");
const certScore = document.getElementById("certScore");
const downloadBtn = document.getElementById("downloadBtn");

startBtn.addEventListener("click", async () => {
  const name = studentNameInput.value.trim();

  if (!name) {
    alert("Please enter your name to start.");
    return;
  }

  startBtn.disabled = true;
  startBtn.textContent = "Loading...";

  try {
    const res = await fetch(
      `${SCRIPT_URL}?action=startQuiz&name=${encodeURIComponent(name)}`
    );

    const data = await res.json();

    if (data.blocked) {
      alert(
        "This name has already submitted the quiz. Each person can only attempt once."
      );

      startBtn.disabled = false;
      startBtn.textContent = "Start Quiz";

      return;
    }

    questions = data.questions;

    if (!questions || questions.length === 0) {
      alert("No questions available right now. Please try again later.");

      startBtn.disabled = false;
      startBtn.textContent = "Start Quiz";

      return;
    }

    studentName = name;
    quizStarted = true;

    nameStage.style.display = "none";
    quizStage.style.display = "block";

    loadQuestion();

    history.pushState(null, "", location.href);

  } catch (err) {

    console.error(err);

    alert(
      "Something went wrong connecting to the quiz server. Please check your internet and try again."
    );

    startBtn.disabled = false;
    startBtn.textContent = "Start Quiz";
  }
});


function loadQuestion() {

  selectedOption = null;

  const q = questions[currentQuestion];

  questionText.textContent = q.question;

  progressText.textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  optionsContainer.innerHTML = "";

  const progressBar = document.getElementById("progressBar");

  if (progressBar) {

    const progress =
      ((currentQuestion + 1) / questions.length) * 100;

    progressBar.style.width = `${progress}%`;
  }

  q.options.forEach(opt => {

    const btn = document.createElement("button");

    btn.textContent = opt;

    btn.className = "option-btn";

    btn.addEventListener("click", () => {

      selectedOption = opt;

      document
        .querySelectorAll(".option-btn")
        .forEach(b => b.classList.remove("selected"));

      btn.classList.add("selected");

    });

    optionsContainer.appendChild(btn);

  });
}


nextBtn.addEventListener("click", () => {

  if (!selectedOption) {

    alert("Please select an answer.");

    return;
  }

  if (
    selectedOption ===
    questions[currentQuestion].answer
  ) {
    score++;
  }

  currentQuestion++;

  if (currentQuestion < questions.length) {

    loadQuestion();

  } else {

    showCertificate();

  }

});


async function showCertificate() {

  quizStage.style.display = "none";

  certStage.style.display = "block";

  certName.textContent = studentName;

  certScore.textContent =
    `Score: ${score} / ${questions.length}`;

  document.getElementById("certDate").textContent =
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  quizStarted = false;

  try {

    await fetch(SCRIPT_URL, {

      method: "POST",

      body: JSON.stringify({
        name: studentName,
        score: score,
        total: questions.length
      })

    });

  } catch (err) {

    console.error(
      "Failed to record submission:",
      err
    );

  }

}


window.addEventListener("popstate", () => {

  if (quizStarted) {

    history.pushState(
      null,
      "",
      location.href
    );

    alert(
      "You cannot go back during the quiz."
    );

  }

});


window.addEventListener("beforeunload", (e) => {

  if (quizStarted) {

    e.preventDefault();

    e.returnValue = "";

  }

});


downloadBtn.addEventListener("click", async () => {

  const certElement = document.querySelector(".cert-border");
  const logo = certElement.querySelector(".cert-logo");

  downloadBtn.disabled = true;
  downloadBtn.textContent = "Preparing...";

  try {

    // Create a canvas version of the logo.
    // This prevents the certificate canvas from becoming tainted.
    let logoDataUrl = null;

    if (logo) {

      const logoCanvas = document.createElement("canvas");
      const ctx = logoCanvas.getContext("2d");

      logoCanvas.width = logo.naturalWidth || 300;
      logoCanvas.height = logo.naturalHeight || 300;

      ctx.drawImage(
        logo,
        0,
        0,
        logoCanvas.width,
        logoCanvas.height
      );

      logoDataUrl = logoCanvas.toDataURL("image/jpeg");

    }

    // Clone the certificate
    const certificateClone = certElement.cloneNode(true);

    // Replace the original logo with the data URL
    const clonedLogo =
      certificateClone.querySelector(".cert-logo");

    if (clonedLogo && logoDataUrl) {
      clonedLogo.src = logoDataUrl;
    }

    // Put the clone temporarily into the document
    certificateClone.style.position = "absolute";
    certificateClone.style.left = "-99999px";
    certificateClone.style.top = "0";

    document.body.appendChild(certificateClone);

    // Give the browser time to render the cloned certificate
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(certificateClone, {
      scale: 2,
      backgroundColor: "#fdfcf8",
      useCORS: true,
      allowTaint: false
    });

    // Remove temporary certificate
    document.body.removeChild(certificateClone);

    // Download PNG
    canvas.toBlob((blob) => {

      if (!blob) {
        throw new Error("Unable to create certificate image.");
      }

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.download =
        `NYLP-Certificate-${studentName.replace(/\s+/g, "_")}.png`;

      link.href = url;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      downloadBtn.disabled = false;
      downloadBtn.textContent = "Download Certificate";

    }, "image/png");

  } catch (err) {

    console.error(
      "Certificate download failed:",
      err
    );

    alert(
      "Something went wrong generating the certificate image. Please try again."
    );

    downloadBtn.disabled = false;
    downloadBtn.textContent =
      "Download Certificate";

  }

});