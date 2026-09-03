# PANNA.AI deployment setup

The application code is ready. Complete these dashboard-only steps after deployment.

## 1. Keep the existing database and storage values

In the Vercel `frontend` project, keep `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` configured.

## 2. Enable real AI editing

1. Open Google AI Studio and create an API key.
2. Add `GEMINI_API_KEY` in Vercel Environment Variables.
3. Add `GEMINI_MODEL=gemini-2.5-flash`.
4. Redeploy. Without this key, PANNA uses its local editing fallback.

## 3. Enable Google sign-in

1. Create a Google Cloud OAuth **Web application** client.
2. Add the production PANNA domain under Authorized JavaScript origins.
3. Add the same client ID as both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` in Vercel.
4. Redeploy because `VITE_GOOGLE_CLIENT_ID` is embedded during the frontend build.

## 4. Enable Gmail notifications

1. Turn on 2-Step Verification for the sender Google account.
2. Create a Google App Password.
3. Add `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `ADMIN_EMAIL` in Vercel.
4. Never add the normal Gmail password or commit any secret to GitHub.

## 5. Set the public URL

Add `PUBLIC_APP_URL=https://your-real-panna-domain` so password-reset and collaboration emails open the correct site.

## Final verification

Test account creation, Google sign-in, password reset, support form, PDF/DOCX/EPUB export, PDF/DOCX import, and one Gemini editing request. The Competition Suite page provides the judge-facing demo flow.
