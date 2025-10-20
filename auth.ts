import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "demo",
      credentials: {},
      async authorize() {
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
});

// 导出 GET/POST 路由
export { handler as GET, handler as POST };

// 关键：导出 auth() 可调用函数占位，避免 layout 调用时报错
export async function auth() {
  return null;
}
