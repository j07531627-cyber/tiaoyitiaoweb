import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
export const authOptions: NextAuthOptions = {
  providers: [Credentials({ name:"demo", credentials:{}, async authorize(){ return null; }})],
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
