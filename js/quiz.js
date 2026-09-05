const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwAXVHHgERH2Jf4zMAnR6bHLZRj-pe8GRT67oxyQh5RYaW-ky52kmZg-ofZDxZY6NH/exec";

let questions = [];
let currentQuestion = 0;
let score = 0;
let studentName = "";
let quizStarted = false;
let selectedOption = null;
let quizStartTime = null;

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
const certPosition = document.getElementById("certPosition");
const downloadBtn = document.getElementById("downloadBtn");


/* ================= START QUIZ ================= */

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

      alert(
        "No questions available right now. Please try again later."
      );

      startBtn.disabled = false;
      startBtn.textContent = "Start Quiz";

      return;
    }

    studentName = name;
    quizStarted = true;

    /*
     * Start timer only when the quiz actually begins.
     */

    quizStartTime = Date.now();

    nameStage.style.display = "none";
    quizStage.style.display = "block";

    loadQuestion();

    history.pushState(
      null,
      "",
      location.href
    );

  } catch (err) {

    console.error(err);

    alert(
      "Something went wrong connecting to the quiz server. Please check your internet and try again."
    );

    startBtn.disabled = false;
    startBtn.textContent = "Start Quiz";

  }

});


/* ================= LOAD QUESTION ================= */

function loadQuestion() {

  selectedOption = null;

  nextBtn.disabled = false;

  const q = questions[currentQuestion];

  questionText.textContent = q.question;

  progressText.textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  optionsContainer.innerHTML = "";

  const progressBar =
    document.getElementById("progressBar");

  if (progressBar) {

    const progress =
      ((currentQuestion + 1) / questions.length) * 100;

    progressBar.style.width =
      `${progress}%`;

  }


  q.options.forEach(opt => {

    const btn =
      document.createElement("button");

    btn.textContent = opt;

    btn.className =
      "option-btn";


    btn.addEventListener("click", () => {

      /*
       * Prevent changing answers after selecting.
       */

      if (selectedOption !== null) {
        return;
      }


      selectedOption = opt;


      /*
       * Disable all options after answering.
       */

      const allOptions =
        document.querySelectorAll(
          ".option-btn"
        );


      allOptions.forEach(button => {

        button.disabled = true;

      });


      /*
       * Correct answer = Green
       * Wrong answer = Red
       */

      if (opt === q.answer) {

        btn.classList.add(
          "correct-answer"
        );

      } else {

        btn.classList.add(
          "wrong-answer"
        );


        /*
         * Also highlight the correct answer.
         */

        allOptions.forEach(button => {

          if (
            button.textContent ===
            q.answer
          ) {

            button.classList.add(
              "correct-answer"
            );

          }

        });

      }

    });


    optionsContainer.appendChild(btn);

  });

}


/* ================= NEXT QUESTION ================= */

nextBtn.addEventListener("click", () => {

  if (!selectedOption) {

    alert(
      "Please select an answer."
    );

    return;
  }


  if (
    selectedOption ===
    questions[currentQuestion].answer
  ) {

    score++;

  }


  currentQuestion++;


  if (
    currentQuestion <
    questions.length
  ) {

    loadQuestion();

  } else {

    showResult();

  }

});


/* ================= SHOW RESULT ================= */

async function showResult() {

  quizStarted = false;


  /*
   * Calculate total time taken in seconds.
   */

  const quizEndTime =
    Date.now();


  const timeTaken =
    Math.max(
      1,
      Math.floor(
        (quizEndTime - quizStartTime) / 1000
      )
    );


  /*
   * Calculate percentage.
   */

  const percentage =
    questions.length > 0
      ? (score / questions.length) * 100
      : 0;


  quizStage.style.display = "none";


  /*
   * Send result to Google Apps Script.
   */

  let resultData = null;


  try {

    const response =
      await fetch(
        SCRIPT_URL,
        {

          method: "POST",

          body: JSON.stringify({
            name: studentName,
            score: score,
            total: questions.length,
            timeTaken: timeTaken
          })

        }
      );


    resultData =
      await response.json();


  } catch (err) {

    console.error(
      "Failed to record submission:",
      err
    );

  }


  /*
   * Below 40% = No Certificate
   */

  if (percentage < 40) {

    certStage.style.display = "block";

    document.querySelector(
      ".completion-heading"
    ).innerHTML = `

      <div class="completion-icon">
        !
      </div>

      <p class="quiz-eyebrow">
        QUIZ COMPLETED
      </p>

      <h1>
        Better Luck Next Time
      </h1>

      <p>
        You scored
        <strong>
          ${score} / ${questions.length}
        </strong>
        (${percentage.toFixed(2)}%).
      </p>

      <p>
        A minimum score of
        <strong>40%</strong>
        is required to receive a certificate.
      </p>

    `;


    document.getElementById(
      "certificate"
    ).style.display = "none";


    downloadBtn.style.display =
      "none";


    document.querySelector(
      ".certificate-note"
    ).style.display =
      "none";


    return;

  }


  /*
   * Show certificate for participants
   * who scored 40% or above.
   */

  certStage.style.display =
    "block";


  document.querySelector(
    ".completion-heading"
  ).innerHTML = `

    <div class="completion-icon">
      ✓
    </div>

    <p class="quiz-eyebrow">
      QUIZ COMPLETED
    </p>

    <h1>
      Congratulations!
    </h1>

    <p>
      You have successfully completed the
      <strong>
        NYLP National Defense Quiz 2026.
      </strong>
    </p>

  `;


  document.getElementById(
    "certificate"
  ).style.display =
    "block";


  downloadBtn.style.display =
    "";


  document.querySelector(
    ".certificate-note"
  ).style.display =
    "";


  certName.textContent =
    studentName;


  certScore.textContent =
    `Score: ${score} / ${questions.length} (${percentage.toFixed(2)}%)`;


  /*
   * Display position returned by backend.
   */

  if (
    resultData &&
    resultData.position
  ) {

    certPosition.textContent =
      `${getOrdinal(resultData.position)} Position`;

  } else {

    certPosition.textContent =
      "Participant";

  }


  document.getElementById(
    "certDate"
  ).textContent =
    new Date().toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

}


/* ================= POSITION FORMAT ================= */

function getOrdinal(number) {

  const lastTwoDigits =
    number % 100;


  if (
    lastTwoDigits >= 11 &&
    lastTwoDigits <= 13
  ) {

    return `${number}th`;

  }


  switch (number % 10) {

    case 1:
      return `${number}st`;

    case 2:
      return `${number}nd`;

    case 3:
      return `${number}rd`;

    default:
      return `${number}th`;

  }

}


/* ================= PREVENT BACK BUTTON ================= */

window.addEventListener(
  "popstate",
  () => {

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

  }
);


/* ================= PREVENT PAGE EXIT ================= */

window.addEventListener(
  "beforeunload",
  (e) => {

    if (quizStarted) {

      e.preventDefault();

      e.returnValue = "";

    }

  }
);


/* ================= DOWNLOAD CERTIFICATE ================= */

downloadBtn.addEventListener(
  "click",
  async () => {

    const certElement =
      document.querySelector(
        ".cert-border"
      );

    const logo =
      certElement.querySelector(
        ".cert-logo"
      );


    downloadBtn.disabled = true;

    downloadBtn.textContent =
      "Preparing...";


    try {

      let logoDataUrl =
        null;


      /*
       * Convert logo into canvas data.
       */

      if (logo) {

        const logoCanvas =
          document.createElement(
            "canvas"
          );

        const ctx =
          logoCanvas.getContext(
            "2d"
          );


        logoCanvas.width =
          logo.naturalWidth || 300;

        logoCanvas.height =
          logo.naturalHeight || 300;


        ctx.drawImage(
          logo,
          0,
          0,
          logoCanvas.width,
          logoCanvas.height
        );


        logoDataUrl =
          logoCanvas.toDataURL(
            "image/jpeg"
          );

      }


      /*
       * Clone certificate.
       */

      const certificateClone =
        certElement.cloneNode(
          true
        );


      const clonedLogo =
        certificateClone.querySelector(
          ".cert-logo"
        );


      if (
        clonedLogo &&
        logoDataUrl
      ) {

        clonedLogo.src =
          logoDataUrl;

      }


      /*
       * Add temporary clone.
       */

      certificateClone.style.position =
        "absolute";

      certificateClone.style.left =
        "-99999px";

      certificateClone.style.top =
        "0";


      document.body.appendChild(
        certificateClone
      );


      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            300
          )
      );


      const canvas =
        await html2canvas(
          certificateClone,
          {

            scale: 2,

            backgroundColor:
              "#fdfcf8",

            useCORS: true,

            allowTaint: false

          }
        );


      document.body.removeChild(
        certificateClone
      );


      canvas.toBlob(
        (blob) => {

          if (!blob) {

            throw new Error(
              "Unable to create certificate image."
            );

          }


          const url =
            URL.createObjectURL(
              blob
            );


          const link =
            document.createElement(
              "a"
            );


          link.download =
            `NYLP-Certificate-${studentName.replace(/\s+/g, "_")}.png`;


          link.href = url;


          document.body.appendChild(
            link
          );


          link.click();


          document.body.removeChild(
            link
          );


          URL.revokeObjectURL(
            url
          );


          downloadBtn.disabled =
            false;


          downloadBtn.textContent =
            "Download Certificate";

        },

        "image/png"
      );

    } catch (err) {

      console.error(
        "Certificate download failed:",
        err
      );


      alert(
        "Something went wrong generating the certificate image. Please try again."
      );


      downloadBtn.disabled =
        false;


      downloadBtn.textContent =
        "Download Certificate";

    }

  }
);