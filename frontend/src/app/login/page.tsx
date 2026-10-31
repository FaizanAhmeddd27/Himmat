import { AuthForm } from "@/components/auth/AuthForm";

// Client-side auth starts here; opt out of instant-navigation validation
// (Next 16 Cache Components) so redirects after login never get dropped.
export const instant = false;

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
