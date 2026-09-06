# Scrapbook Journal

A user-authenticated web application that transforms raw, unstructured thought fragments into artisan scrapbook journal pages using Gemini free-tier semantic extraction and a deterministic client-side template compositor, with secure user data isolation on Cloud Firestore.

## Architecture Overview & Section 8 Visual Design System

1. **User Authentication**: Google Federated Authentication powered by Firebase Auth.
2. **Spatial Canvas**: Free-form text area where users pour unstructured, unpolished thought fragments.
3. **Stage 1 (Semantic Analysis)**: Server-side API endpoint (`/api/gemini/design-spec`) converts raw fragments into a strictly typed `JournalDesignSpec` JSON conforming to the selected template's slot bounds. Uses Gemini free-tier text models (`gemini-2.5-flash-lite` primary, `gemini-2.5-flash` secondary, `gemini-flash-latest` fallback) with strict `responseSchema`.
4. **Stage 2 (Deterministic Page Compositor - Zero-Cost)**: Client-side HTML5 Canvas/SVG compositor builds the page from the Fixed Template Library (launch template `sunlit-botanical-01`) at zero marginal cost per page — no image-generation APIs are called.
5. **Memory Library**: User-isolated persistent storage on Cloud Firestore under `/users/{userId}/interactions/{interactionId}`.

---

## 1. Cloud Firestore Security Rules

Deploy the following security rules to ensure user data isolation:

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

Deploy using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 2. Google Cloud Secret Manager Setup

Securely store your Gemini API key in Secret Manager and grant access to the Cloud Run runtime service account:

```bash
# Set your project ID
export PROJECT_ID="YOUR_PROJECT_ID"
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Enable Secret Manager and Cloud Run APIs
gcloud services enable secretmanager.googleapis.com run.googleapis.com

# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Google Cloud Run Deployment

Build and deploy the application container to Cloud Run:

```bash
# Build and deploy with Secret Manager environment variable binding
gcloud run deploy scrapbook-journal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 4. Required Campaign Labeling Verification

Apply the mandatory verification label to register your Cloud Run service:

```bash
gcloud run services update scrapbook-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 5. Local Development

```bash
# Install dependencies
npm install

# Run the full-stack dev server (port 3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```
