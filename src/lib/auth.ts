import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const hasGoogleCreds =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  process.env.GOOGLE_CLIENT_ID !== "your_google_client_id.apps.googleusercontent.com";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: hasGoogleCreds
        ? process.env.GOOGLE_CLIENT_ID!
        : "demo-client-id.apps.googleusercontent.com",
      clientSecret: hasGoogleCreds
        ? process.env.GOOGLE_CLIENT_SECRET!
        : "demo-client-secret",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "4f8a9e2b1c7d6e5f0a3b8c7d9e2f1a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
};
