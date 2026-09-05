const SUPABASE_URL = "https://jmbcqvtexmqdfdnqolpp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_E_CoGQc0D_kfrVUzsoSWtA_pxLwXk8f";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// =========================================
// SIGN UP
// =========================================

async function signUpUser(fullName, email, password) {

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    throw error;
  }

  if (data.user && data.session) {

    const { error: profileError } = await supabaseClient
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          full_name: fullName
        },
        {
          onConflict: "id"
        }
      );

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    return {
      success: true,
      session: data.session
    };
  }

  return {
    success: true,
    session: null
  };
}


// =========================================
// LOGIN
// =========================================

async function loginUser(email, password) {

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    throw error;
  }

  return data;
}


// =========================================
// LOGOUT
// =========================================

async function logoutUser() {

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    throw error;
  }

  window.location.href = "index.html";
}


// =========================================
// GET CURRENT USER
// =========================================

async function getCurrentUser() {

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  return user;
}


// =========================================
// UPDATE NAVBAR AUTH STATE
// =========================================

async function updateNavbarAuth() {

  const desktopLogin =
    document.getElementById("desktop-login");

  const desktopSignup =
    document.getElementById("desktop-signup");

  const desktopUser =
    document.getElementById("desktop-user");

  const desktopUserName =
    document.getElementById("desktop-user-name");

  const desktopLogout =
    document.getElementById("desktop-logout");


  const mobileLogin =
    document.getElementById("mobile-login");

  const mobileSignup =
    document.getElementById("mobile-signup");

  const mobileUser =
    document.getElementById("mobile-user");

  const mobileUserName =
    document.getElementById("mobile-user-name");

  const mobileLogout =
    document.getElementById("mobile-logout");


  if (!desktopLogin && !mobileLogin) {
    return;
  }


  try {

    const user = await getCurrentUser();


    // =========================================
    // USER IS LOGGED IN
    // =========================================

    if (user) {

      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User";


      // Desktop

      if (desktopLogin) {
        desktopLogin.classList.add("hidden");
      }

      if (desktopSignup) {
        desktopSignup.classList.add("hidden");
      }

      if (desktopUser) {
        desktopUser.classList.remove("hidden");
        desktopUser.classList.add("inline-flex");
      }

      if (desktopUserName) {
        desktopUserName.textContent = fullName;
      }

      if (desktopLogout) {
        desktopLogout.classList.remove("hidden");
        desktopLogout.classList.add("inline-flex");
      }


      // Mobile

      if (mobileLogin) {
        mobileLogin.classList.add("hidden");
      }

      if (mobileSignup) {
        mobileSignup.classList.add("hidden");
      }

      if (mobileUser) {
        mobileUser.classList.remove("hidden");
        mobileUser.classList.add("flex");
      }

      if (mobileUserName) {
        mobileUserName.textContent = fullName;
      }

      if (mobileLogout) {
        mobileLogout.classList.remove("hidden");
        mobileLogout.classList.add("flex");
      }

    }


    // =========================================
    // USER IS NOT LOGGED IN
    // =========================================

    else {

      // Desktop

      if (desktopLogin) {
        desktopLogin.classList.remove("hidden");
      }

      if (desktopSignup) {
        desktopSignup.classList.remove("hidden");
      }

      if (desktopUser) {
        desktopUser.classList.add("hidden");
        desktopUser.classList.remove("inline-flex");
      }

      if (desktopLogout) {
        desktopLogout.classList.add("hidden");
        desktopLogout.classList.remove("inline-flex");
      }


      // Mobile

      if (mobileLogin) {
        mobileLogin.classList.remove("hidden");
      }

      if (mobileSignup) {
        mobileSignup.classList.remove("hidden");
      }

      if (mobileUser) {
        mobileUser.classList.add("hidden");
        mobileUser.classList.remove("flex");
      }

      if (mobileLogout) {
        mobileLogout.classList.add("hidden");
        mobileLogout.classList.remove("flex");
      }

    }

  } catch (error) {

    console.error(
      "Unable to check authentication:",
      error
    );

  }
}


// =========================================
// NAVBAR LOGOUT BUTTONS
// =========================================

function setupNavbarLogout() {

  const desktopLogout =
    document.getElementById("desktop-logout");

  const mobileLogout =
    document.getElementById("mobile-logout");


  if (desktopLogout) {

    desktopLogout.addEventListener(
      "click",
      async () => {

        desktopLogout.disabled = true;
        desktopLogout.textContent = "Logging out...";

        try {

          await logoutUser();

        } catch (error) {

          console.error(error);

          desktopLogout.disabled = false;
          desktopLogout.textContent = "Logout";

          alert(
            error.message ||
            "Unable to logout. Please try again."
          );

        }

      }
    );

  }


  if (mobileLogout) {

    mobileLogout.addEventListener(
      "click",
      async () => {

        mobileLogout.disabled = true;
        mobileLogout.textContent = "Logging out...";

        try {

          await logoutUser();

        } catch (error) {

          console.error(error);

          mobileLogout.disabled = false;
          mobileLogout.textContent = "Logout";

          alert(
            error.message ||
            "Unable to logout. Please try again."
          );

        }

      }
    );

  }

}


// =========================================
// QUIZ ACCESS
// =========================================

async function openQuiz() {

  try {

    const user = await getCurrentUser();

    if (user) {

      window.location.href = "quiz.html";

    } else {

      window.location.href = "login.html?redirect=quiz";

    }

  } catch (error) {

    console.error(
      "Unable to check login status:",
      error
    );

    window.location.href = "login.html?redirect=quiz";

  }

}


// =========================================
// PROTECT QUIZ PAGE
// =========================================

async function protectQuizPage() {

  try {

    const user = await getCurrentUser();

    if (!user) {

      window.location.href = "login.html?redirect=quiz";

    }

  } catch (error) {

    console.error(
      "Unable to verify authentication:",
      error
    );

    window.location.href = "login.html?redirect=quiz";

  }

}


// =========================================
// HANDLE QUIZ LINKS
// =========================================

function setupQuizLinks() {

  const quizLinks =
    document.querySelectorAll('a[href="quiz.html"]');


  quizLinks.forEach(link => {

    link.addEventListener("click", async (event) => {

      event.preventDefault();

      await openQuiz();

    });

  });

}


// =========================================
// INITIALIZE
// =========================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await updateNavbarAuth();

    setupNavbarLogout();

    setupQuizLinks();

  }
);