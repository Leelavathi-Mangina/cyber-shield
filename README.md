
# 🛡️ Cyber Shield

### Intelligent Phishing, Scam and Cyber-Fraud Detection Platform

Cyber Shield is an explainable cybersecurity platform developed by **Team ThinkForge** to help ordinary users identify suspicious digital content and understand the risks associated with it.

The platform analyzes URLs, emails, SMS/social-media messages, and QR codes using a multi-layer risk analysis approach. Instead of simply marking content as safe or malicious, Cyber Shield provides a risk level, risk score, detected evidence, and recommended safety actions.

---

## 🌐 Live Demo

**Cyber Shield:**  
https://musical-hotteok-cb5254.netlify.app/

---

## 🎯 Problem Statement

Phishing links, fraudulent messages, fake websites, QR-code scams, and social-engineering attacks increasingly target ordinary users.

Cyber Shield aims to provide an intelligent and explainable platform that can:

- Analyze suspicious digital content
- Identify suspicious patterns
- Classify the associated risk
- Explain why the content may be dangerous
- Recommend safer next steps
- Allow users to report threats
- Improve cybersecurity awareness

---

## ✨ Features

### 🔍 Multi-Input Analysis

Cyber Shield supports analysis of:

- URLs
- Emails
- SMS messages
- Social-media messages
- QR codes

### 🧠 Explainable Risk Analysis

The system detects multiple risk indicators, including:

- Urgency patterns
- Credential and OTP requests
- Financial/payment requests
- Prize and reward scams
- Suspicious URL patterns
- Brand impersonation
- Contextual scam-pattern combinations

### 🌐 Dynamic URL Intelligence

Cyber Shield does not depend only on storing known malicious URLs.

For URL analysis, it combines:

- Local URL-pattern analysis
- Domain-registration intelligence using RDAP
- External threat-reputation evidence using VirusTotal

### 📊 Risk Classification

Analysis results are presented as:

- Low Risk
- Medium Risk
- High Risk

The risk score is an **explainable risk indicator and not a probability that the content is malicious**.

### 💡 Explainable Results

The platform provides:

- Risk score
- Risk level
- Detected suspicious signals
- Human-readable explanations
- Recommended safety actions

### 📱 QR Scam Detection

Users can upload a QR code. Cyber Shield extracts its content and analyzes the decoded information through the risk-analysis pipeline.

### 🚨 Threat Reporting

Users can report suspicious digital content. Reports are persisted in MongoDB for future verification and threat-management functionality.

### 📜 Analysis History

Previous analyses are stored in MongoDB Atlas and can be retrieved through the application.

### 🎓 Cyber Safety Awareness

The platform provides educational cybersecurity guidance to help users recognize and avoid common online scams.

---

## 🏗️ System Architecture

```text
                 User
                   │
                   ▼
          Next.js Frontend
              (Netlify)
                   │
                   ▼
        Node.js + Express API
               (Render)
                   │
        ┌──────────┼───────────┐
        ▼          ▼           ▼
   Risk Engine    RDAP     VirusTotal
        │
        ▼
   MongoDB Atlas
````

---

## ⚙️ How Risk Analysis Works

Cyber Shield uses a multi-layer approach.

```text
User Input
    │
    ▼
Local Risk Analysis
    │
    ├── Urgency Detection
    ├── Credential / OTP Detection
    ├── Financial Request Detection
    ├── Reward / Prize Scam Detection
    ├── URL Pattern Analysis
    └── Brand Impersonation Detection
    │
    ▼
Domain Intelligence (for applicable URLs)
    │
    ▼
External Threat Reputation
    │
    ▼
Weighted Risk Indicator
    │
    ▼
LOW / MEDIUM / HIGH
    │
    ▼
Evidence + Safety Recommendation
```

A major design principle is that **Cyber Shield does not need to store every malicious URL**. It dynamically evaluates multiple independent signals.

---

## 🧪 Prototype Validation

A small labelled prototype validation set was used to test the risk-analysis logic.

Initial validation:

* Total cases: 10
* Correct classifications: 9
* Accuracy: 90%
* Precision: 100%
* Recall: 80%
* False negatives: 1

The false negative exposed a missing contextual pattern involving a reward/prize combined with a payment request.

After improving the general contextual detection rule, the same prototype regression set produced:

* True Positives: 5
* True Negatives: 5
* False Positives: 0
* False Negatives: 0
* Accuracy: 100%
* Precision: 100%
* Recall: 100%

> **Important:** These results are from a small prototype validation set and must not be interpreted as 100% real-world or production accuracy. Larger independent datasets are required for production evaluation.

---

## 🛠️ Technologies Used

### Frontend

* Next.js
* React
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Threat Intelligence

* VirusTotal API
* RDAP

### Deployment

* Netlify — Frontend
* Render — Backend
* MongoDB Atlas — Database

### Development Tools

* Git
* GitHub
* VS Code
* npm

---

## 📁 Project Structure

```text
cyber-shield/
│
├── client/
│   ├── public/
│   ├── src/
│   │   └── app/
│   ├── package.json
│   └── next.config.mjs
│
├── server/
│   ├── models/
│   ├── scripts/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Leelavathi-Mangina/cyber-shield.git
cd cyber-shield
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `server` directory.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
VIRUSTOTAL_API_KEY=your_virustotal_api_key
PORT=5000
```

Never commit the actual `.env` file or API credentials to GitHub.

### 4. Start the backend

```bash
npm run dev
```

The backend runs locally on:

```text
http://localhost:5000
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔐 Security

Sensitive credentials such as:

* MongoDB connection strings
* VirusTotal API keys
* Environment variables

must never be committed to the repository.

Environment files are excluded using `.gitignore`.

---

## 🔮 Future Scope

* Larger labelled phishing and scam datasets
* Machine-learning/NLP-based semantic analysis
* Full webpage-content inspection
* Browser extension
* Real-time community threat intelligence
* Administrator verification of reported threats
* Integration with official cybercrime-reporting systems
* Improved risk-score calibration

---

## 👥 Team

**Team ThinkForge**

Developed for the Cyber Shield hackathon problem statement.

---

## ⚠️ Disclaimer

Cyber Shield is a prototype cybersecurity assistance platform. Risk classifications are based on the signals available to the system and should not be considered a guarantee that content is completely safe or malicious.

````
