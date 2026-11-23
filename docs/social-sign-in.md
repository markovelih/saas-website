# Koryx social sign-in activation

The application supports Google through Supabase Auth using PKCE and the existing client profiles. Provider buttons are rendered only when Supabase's public Auth settings report the provider enabled. Availability refreshes within 60 seconds; there are no provider secrets in the repository.

Production Supabase project: aroutopmhmeaqqnrhcaf (dashboard name pump-ai-scanner).
Application callback: https://koryx.ca/auth/callback
Provider callback: https://aroutopmhmeaqqnrhcaf.supabase.co/auth/v1/callback

Before enabling Google, add the exact application callback URL to Supabase Authentication → URL Configuration → Redirect URLs. Keep existing entries. Site URL should use https://koryx.ca.

## Google

In the business owner's Google Cloud project, configure Google Auth Platform for Koryx with the public homepage, /privacy and /terms URLs, verified koryx.ca domain, and only openid, email and profile access. Create a Web application OAuth client with the exact provider callback above. Store its client ID and secret in Supabase's Google provider settings. Publish the Google consent app for external customers rather than leaving it restricted to test users. Never commit the secret or send it through chat.

The owner approved Google Cloud terms acceptance for the configuration. No billing, free trial or advertising account is needed for this setup.

## Verification after activation

1. New Google users reach their own dashboard; the profile trigger creates an ordinary user profile.
2. Existing verified-email accounts retain their existing projects (Supabase's automatic verified identity linking); never grant admin access from email or provider metadata.
3. Confirm project/order/payment return destinations, cancellation, an expired/reused code, and email login/registration.
4. Founder authorization remains tied to the existing immutable user ID.
5. Check session cookies on the actual production origin and sign out before testing another identity.

Local checks: node tests/social-auth.cjs; node tests/auth-email.cjs; TypeScript and scoped ESLint.
