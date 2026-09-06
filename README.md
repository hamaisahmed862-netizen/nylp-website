# NYLP - National Youth Leadership Programme Website

A modern and responsive web platform developed for the **National Youth Leadership Programme (NYLP)**.

The platform provides information about NYLP, its mission, activities, and includes an interactive National Defense Quiz with authentication, real-time question handling, ranking, scoring, and certificate generation.

## 🌐 Live Website

🔗 https://nylp-website.vercel.app/

## 🚀 Features

* Responsive and modern user interface
* User Signup and Login authentication using Supabase
* Protected quiz access for authenticated users
* National Defense Quiz 2026
* Dynamic questions fetched from Google Sheets
* One attempt per participant
* Real-time quiz progress tracking
* Correct and incorrect answer feedback
* Score and percentage calculation
* Participant ranking based on quiz performance and submission time
* Minimum passing criteria for certificate eligibility
* Automatic certificate generation
* Downloadable certificate as PNG
* NYLP branding and logo integration
* Animated Three.js background
* Responsive design for different screen sizes

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Authentication & Database

* Supabase

### Quiz Backend

* Google Apps Script
* Google Sheets

### Libraries & Tools

* Three.js
* html2canvas
* Google Fonts

### Deployment

* Vercel

## 📂 Project Structure

```text
NYLP-website/
│
├── assets/              # Images and NYLP logo
├── css/
│   └── style.css         # Main stylesheet
│
├── js/
│   ├── quiz.js           # Quiz logic
│   └── space-bg.js       # Animated background
│
├── index.html            # Homepage
├── login.html            # User login
├── signup.html           # User registration
├── quiz.html             # National Defense Quiz
└── README.md
```

## 🧠 Quiz System

The quiz system is connected with Google Sheets through Google Apps Script.

The system handles:

* Fetching quiz questions dynamically
* Preventing duplicate attempts
* Calculating participant scores
* Calculating percentage
* Recording submission time
* Ranking participants based on performance
* Certificate eligibility based on minimum passing criteria

## 🏆 Certificate System

Participants who meet the required passing criteria can receive a personalized NYLP certificate.

The certificate includes:

* Participant Name
* Quiz Score
* Percentage
* Participant Position/Rank
* Date of Issue
* NYLP Logo and Branding
* Founder & Chairman Signature Section

Certificates can be downloaded as high-quality PNG images.

## 💻 Local Installation

Clone the repository:

```bash
git clone https://github.com/hamaisahmed862-netizen/nylp-website.git
```

Navigate to the project folder:

```bash
cd NYLP-website
```

Open the project using a local development server such as VS Code Live Server.

## 🌍 Deployment

The project is deployed using Vercel.

Live Website:

https://nylp-website.vercel.app/

## 📸 About NYLP

The National Youth Leadership Programme (NYLP) is focused on empowering young individuals through leadership development, training, mentorship, career growth, and social impact.

## 👨‍💻 Developer

Developed and maintained by **Hamais Ahmed**.

## 📄 License

This project was developed for the National Youth Leadership Programme (NYLP).
© 2026 National Youth Leadership Programme. All Rights Reserved.
