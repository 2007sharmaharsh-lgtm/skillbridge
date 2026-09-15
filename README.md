# SIH26044: Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement

A full-stack web application designed for Smart India Hackathon problem statement **SIH26044**.

This centralized platform connects **Students**, **Academic Institutions**, and **Industry/Recruiters** to solve:
- Student skill profiling & competency mapping
- Automated skill gap identification before job/internship applications
- Candidate matching algorithm for recruiters
- Employability tracking and curriculum demand analysis for colleges

---

## 🌟 Key Features

1. **Dual Authentication System**:
   - **Google Sign-In**: Integrated with Firebase Authentication.
   - **Autonomous Guest / Anonymous Mode**: Immediate evaluation as **Student**, **Recruiter**, or **Institution Admin** with pre-populated real-world test data.
   - **Role-Based Access Control (RBAC)**: Enforced via `ProtectedRoute` and `RoleProtectedRoute`.

2. **Core Reusable Skill Matching Engine** (`src/utils/skillMatching.js`):
   - Computes mathematical match score: `(Matched Required Skills / Total Required Skills) × 100`.
   - Case-insensitive normalization with alias resolution (e.g., `js` → `javascript`, `ml` → `machine learning`).
   - Identifies missing skills and generates targeted upskilling recommendations.

3. **Student Module**:
   - Academic profile, degree, branch, graduation year, resume link, bio.
   - Skill manager with 3 proficiency tiers (`Beginner`, `Intermediate`, `Advanced`).
   - Live Skill Mapping Simulator.
   - Opportunity explorer with skill gap breakdown modal before applying.
   - Real-time application status tracker (`applied` → `under_review` → `shortlisted` → `interview` → `selected` / `rejected`).
   - Bookmark & saved postings.

4. **Recruiter / Industry Module**:
   - Company branding, industry sector, website, office location.
   - Opportunity management: Create, edit, delete internships and full-time jobs with mandatory skill criteria.
   - Candidate Matching & Ranking Engine: Ranks applicants or the entire student talent pool by compatibility score.
   - Application status management (shortlist, interview, select, reject).

5. **Institution / Academia Module**:
   - Student competency directory with filters by department, cohort, and acquired skills.
   - Skill Gap Analytics: Cross-tabulation of student skill supply against market recruiter demand.
   - Placement Tracking: Conversion funnel tracking from registration to final offer letters.

---

## 🚀 Getting Started Locally

### Step 1: Open the Project in VS Code
Open the root directory in Visual Studio Code:
```bash
code .
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create a Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g. `sih26044-portal`).
3. Click **Continue** to create the project.

### Step 4: Enable Authentication Providers
1. In the Firebase console, go to **Build > Authentication > Sign-in method**.
2. Enable **Google** provider.
3. Enable **Anonymous** provider (to support autonomous guest logins).

### Step 5: Create Firestore Database
1. Go to **Build > Firestore Database** and click **Create database**.
2. Select your closest region and start in **Production mode** (or Test mode).
3. Under the **Rules** tab, paste the contents of `firestore.rules` included in this repository.

### Step 6: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the credentials from Firebase Console (Project Settings > General > Your Apps > Web App):
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=sih26044-portal.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sih26044-portal
VITE_FIREBASE_STORAGE_BUCKET=sih26044-portal.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...
```

> **Note on Autonomous Evaluation:** If `.env` is omitted or contains placeholder values, the application automatically runs in **Autonomous Demo Fallback Mode** with complete mock persistence. You can immediately test all workflows without waiting for cloud setup!

### Step 7: Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Firestore Database Architecture

| Collection | Description | Schema / Document Fields |
| :--- | :--- | :--- |
| `users` | Authenticated users & role mapping | `uid`, `name`, `email`, `photoURL`, `role`, `createdAt` |
| `students` | Student academic profile & competencies | `uid`, `collegeName`, `university`, `degree`, `branch`, `graduationYear`, `location`, `skills: [{ name, level }]`, `resumeURL`, `about` |
| `recruiters` | Company details & recruiter profiles | `uid`, `companyName`, `industry`, `description`, `website`, `location`, `logoURL` |
| `institutions` | Academic institutions & colleges | `uid`, `institutionName`, `university`, `location`, `website` |
| `opportunities` | Internships and Job postings | `id`, `recruiterId`, `companyName`, `title`, `type`, `description`, `requiredSkills`, `preferredSkills`, `location`, `duration`, `compensation`, `deadline`, `openings`, `createdAt`, `status` |
| `applications` | Student applications to opportunities | `id`, `studentId`, `opportunityId`, `recruiterId`, `status`, `appliedAt`, `updatedAt` |
| `savedOpportunities` | Bookmarked opportunities | `studentId`, `opportunityId`, `savedAt` |

---

## 📁 Directory Structure

```
sih26044-portal/
├── firestore.rules          # Production Firebase Security Rules
├── .env.example             # Firebase environment template
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx             # React entry
│   ├── App.jsx              # Router & AuthProvider wrapper
│   ├── index.css            # Responsive design system
│   ├── constants/           # Roles, statuses, common skills, branches
│   ├── contexts/            # AuthContext (Google + Autonomous Guest login)
│   ├── services/
│   │   ├── firebase.js      # Firebase App, Auth, Firestore initialization
│   │   ├── firebaseAuth.js  # Google popup, anonymous auth, guest persona switch
│   │   ├── firestoreService.js # Data access layer with fallback store
│   │   └── mockData.js      # Pre-populated seed dataset for hackathons
│   ├── utils/
│   │   └── skillMatching.js # Skill matching formula, normalization & gap analysis
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── RoleProtectedRoute.jsx
│   │   ├── SkillTag.jsx
│   │   ├── SkillSelector.jsx
│   │   ├── SkillMatchCard.jsx
│   │   ├── OpportunityCard.jsx
│   │   ├── OpportunityFilters.jsx
│   │   ├── ApplicationStatusBadge.jsx
│   │   ├── CandidateCard.jsx
│   │   ├── SearchBar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── EmptyState.jsx
│   │   └── Modal.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx  # Hero, 3 pillars & quick demo access
│   │   ├── LoginPage.jsx    # Google Auth, Guest Login & Role Selector
│   │   ├── student/         # Student Module (Profile, Skills, Opps, Apps, Saved)
│   │   ├── recruiter/       # Recruiter Module (Profile, Post, Manage, Match/Applicants)
│   │   └── institution/     # Academia Module (Roster, Skill Gap Matrix, Placements)
│   └── routes/
│       └── AppRoutes.jsx    # Complete application routing & RBAC
```
