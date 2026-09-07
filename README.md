# Personal Gemini Journal

A production-grade, privacy-first web application that transforms raw, unstructured stream-of-consciousness thought dumps into beautifully composed artisan memory flash cards. Built with a two-stage zero-cost architecture: semantic synthesis using Gemini free-tier text models and deterministic client-side template rendering using HTML5 Canvas & SVG, backed by Google Federated Identity and owner-isolated Cloud Firestore storage.

---

## Architecture & Visual Design System

### 1. Two-Stage Deterministic Pipeline (Zero-Cost Marginal Rendering)
- **Stage 1 (Semantic Analysis)**: The backend API endpoint (`/api/gemini/design-spec`) receives raw thoughts and calls a Gemini free-tier text model (`gemini-2.5-flash-lite` primary, `gemini-2.5-flash` secondary, with resilient fallback ladder) using strict structured JSON schema enforcement (`responseSchema`).
- **Stage 2 (Local Canvas & SVG Compositor)**: The client application deterministically draws typography, feelings, quotes, and gratitude bullet lists directly into slot coordinates over offline vector background assets from `/assets/templates/`. 
- **Hard Cost Boundary**: Zero billed image-generation models (e.g., Imagen, DALL-E) are called. Marginal rendering cost per page is strictly zero.

### 2. Fixed Template Library & Mood-to-Vibe Taxonomy
Templates are organized across 5 distinctive vibes with horizontal (short dumps, <350 chars) and vertical (longer dumps) orientations:
- **Sunlit Botanical** (`sunlit-botanical-horizontal`, `sunlit-botanical-vertical`): Warm, grateful, summery, content moods.
- **Sage Affirmation** (`sage-affirmation-horizontal`, `sage-affirmation-vertical`): Calm, gentle, encouraging, hopeful moods.
- **Dusty Rose Diary** (`dusty-rose-diary-horizontal`, `dusty-rose-diary-vertical`): Tender, cozy, romantic, sentimental moods.
- **Dark Academia** (`dark-academia-horizontal`, `dark-academia-vertical`): Moody, introspective, literary, melancholy moods.
- **Kraft Vintage** (`kraft-vintage-horizontal`, `kraft-vintage-vertical`): Nostalgic, wistful, reflective journey moods.

### 3. Dual-Sided Tactile Experience
- **Front Side**: Curated Memory Flash Card with mood badge, formatted feeling block, gratitude bullets, and quote.
- **Reverse Side (Thought Codex)**: Tactile lined paper codex displaying raw, authentic thought fragments, timestamp, and metadata.
- **Interactive Browsing**: Stacked Deck mode with interactive swipe gestures and Gallery Grid mode with instant search and filtering.

### 4. Responsive & Accessible Design
- **Two-Tone Theme Engine**: Seamlessly toggles between **Soft Dark Espresso** (`#24201c`) and **Warm Ivory Light** (`#f3ede3`), maintaining WCAG AA contrast on all text, badges, and card surfaces.
- **Viewport Adaptive Navigation**: Dynamic header scaling for desktop, tablet, and mobile with auto-truncated branding, responsive action controls, and viewport-aware profile representations.
- **Mobile-First Modal Controls**: Corner-anchored `40px` minimum touch target dismiss buttons that remain accessible and never overflow on small screens.

---

## 1. Prerequisites & Environment Setup

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher) and `npm`
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

### Enable Google Cloud APIs
Run the following to enable the required Google Cloud APIs for your project:

```bash
export PROJECT_ID="YOUR_PROJECT_ID"
gcloud config set project $PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 2. Cloud Firestore Database & Security Rules

### Security Rules (`firestore.rules`)
Cloud Firestore stores all user-authored interactions under owner-isolated subcollections (`/users/{userId}/interactions/{interactionId}`). Deploy the following security rules to prevent cross-user data leakage:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Deploy Rules via Firebase CLI
```bash
firebase use $PROJECT_ID
firebase deploy --only firestore:rules
```

---

## 3. Google Cloud Secret Manager Configuration

Store your Gemini API key securely in Secret Manager and grant the Cloud Run runtime compute service account permissions to access it at startup:

```bash
# Retrieve your Google Cloud Project Number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# 1. Create the Secret in Google Cloud Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your Gemini API key payload to the secret version
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run default service account Secret Accessor permissions
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Google Cloud Run Deployment Flow

Deploy the application container directly to Cloud Run with Secret Manager secret injection and automatic port binding:

```bash
# Build and deploy service to Cloud Run
gcloud run deploy personal-gemini-journal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 5. Required Campaign Labeling Verification

Apply the required challenge label to register the deployed Cloud Run service for automated verification:

```bash
gcloud run services update personal-gemini-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 6. Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Set local development environment variable
cp .env.example .env
# Edit .env and supply GEMINI_API_KEY for local testing

# 3. Start unified dev server (Express backend + Vite HMR on port 3000)
npm run dev

# 4. Run TypeScript linter
npm run lint

# 5. Compile production build
npm run build

# 6. Start production build
npm start
```

---

## 7. Functional Stability & Walkthrough Test Matrix

Every core user process and interaction can be validated using the following test cases:

### Test Case 1: Stream-of-Consciousness Semantic Extraction
1. Navigate to the **Spatial Canvas** view.
2. Enter a free-form thought dump into the canvas text area (e.g., *"Walked through the misty cedar forest this morning, quiet air, feeling grounded and grateful for quiet moments"*).
3. Select an orientation (**Horizontal Card** or **Vertical Card**) or allow auto-selection based on text length.
4. Click **"Transform into Memory Card"**.
5. **Expected Result**: Backend calls Gemini API fallback ladder, extracts a validated `JournalDesignSpec` matching the chosen template schema, and transitions to the Review view with zero layout errors.

### Test Case 2: Zero-Cost Deterministic Canvas Rendering
1. On the **Rendered Page Review** view, inspect the generated card.
2. **Expected Result**: The card renders the chosen theme background asset (e.g., `sunlit-botanical-horizontal.svg`), draws text within exact slot bounds without clipping, displays the mood chip, and provides an instant client-side PNG/SVG download option. No external image generation API is called.

### Test Case 3: Dual-Sided Flip & Tactile Inspection
1. Click the **"Flip Card"** or **"Thought Codex"** button.
2. **Expected Result**: The card smoothly rotates 180 degrees using CSS 3D perspective to reveal the cream-lined paper codex displaying raw thoughts, word count, and timestamp.
3. Click **"Save Memory"** to persist the card and raw inputs into Cloud Firestore under `/users/{userId}/interactions/{interactionId}`.

### Test Case 4: Memory Library Browsing (Deck & Grid)
1. Switch to the **Memory Library** view via the navigation bar.
2. Toggle between **Stacked Deck** and **Gallery Grid** modes.
3. In **Stacked Deck**: Drag cards horizontally or click navigation arrows to browse through historical memory cards.
4. In **Gallery Grid**: Use the search bar to filter cards by title, mood, or keyword.

### Test Case 5: Inspection Modal on Mobile Viewports
1. Resize the browser window to mobile width (375px) and click **"Inspect"** on any memory card.
2. **Expected Result**: The inspection modal opens with full backdrop blur. The corner-anchored circular close button (`X`) is clearly visible at `top-2.5 right-2.5`, easily tappable with a `40px` touch target, and does not overlap with headers or action buttons.
3. Tap the `X` button to dismiss the modal cleanly.

### Test Case 6: Viewport Navigation Fit Across Breakpoints
1. Test navigation at `375px` (Mobile), `768px` (Tablet), and `1280px` (Desktop).
2. **Expected Result**: Header elements fit comfortably on a single horizontal row without wrapping or horizontal overflow. User display name is cleanly suppressed on compact viewports to preserve space for navigation tabs and theme controls.

---

## 8. Security Alerts & Key Management Hygiene Guide

### Verification of Google API Key Alert (`firebase-applet-config.json#L4`)

Automated scanners (such as GitHub Secret Scanning, Google Cloud Security Command Center, or Git Push Protection) flag any string matching pattern `AIzaSy...` as a potential credential leak.

#### 1. Why Was It Flagged?
* **Google's Unified Key Format**: Google Cloud uses the `AIzaSy` prefix for both **privileged server API keys** (e.g. Gemini, Maps with billing enabled) and **public Firebase web client configuration identifiers**.
* Scanners cannot determine intent purely from regex, so they raise an alert for developer review.

#### 2. Technical Risk & Architecture Boundary
* **Server-Side Gemini API Key**: The application's Gemini API calls are strictly executed **server-side** inside `server.ts` using `process.env.GEMINI_API_KEY` (injected via Secret Manager in production). It is **never** bundled in frontend code or stored in `firebase-applet-config.json`.
* **Firebase Web Client Key**: The `apiKey` in `firebase-applet-config.json` is the Firebase Web app identifier used by browser clients to communicate with Firebase Authentication and Firestore. In Firebase Web architectures, security is enforced by:
  1. **Owner-Bound Firestore Rules** (`firestore.rules`): Unauthorized reads/writes are rejected even if someone has the web API key.
  2. **Google Cloud Console API & HTTP Referrer Restrictions**: Restricting where and how the key can be used.

#### 3. Recommended Remediation & Best Practices

1. **Apply Google Cloud Console Key Restrictions (Crucial)**:
   - Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
   - Select the API key used by Firebase (`AIzaSyDiq...`).
   - Under **Application restrictions**, select **Websites** (HTTP referrers) and add your allowed origins:
     - `https://ais-dev-*.run.app/*`
     - `https://your-custom-domain.com/*`
     - `http://localhost:3000/*` (for local development)
   - Under **API restrictions**, select **Restrict key** and limit it exclusively to:
     - **Identity Toolkit API** (Firebase Auth)
     - **Cloud Firestore API**
     - *(Make sure "Generative Language API" is **UNCHECKED** so this key cannot be used for Gemini API calls).*
   - Save changes.

2. **Resolving the Alert in GitHub Secret Scanning**:
   - Once API and website restrictions are verified in Google Cloud Console, open the alert on GitHub.
   - Click **Close as** -> **Used in tests / Client-side code** (or **False positive** after confirming restrictions).

3. **Using Environment Variables (Optional / Stricter Git Hygiene)**:
   - The app supports overriding Firebase config via environment variables:
     ```env
     VITE_FIREBASE_API_KEY="your-restricted-web-api-key"
     VITE_FIREBASE_PROJECT_ID="your-project-id"
     VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
     ```
   - If you prefer not to commit `firebase-applet-config.json` in public repositories, add `firebase-applet-config.json` to `.gitignore` and supply these `VITE_FIREBASE_*` variables in your CI/CD pipeline or `.env`.
