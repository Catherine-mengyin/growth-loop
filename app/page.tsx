import { AuthProvider } from "@/lib/auth-context";
import { GrowthLoopApp } from "@/components/growth-loop-app";

export default function Home() {
  return (
    <AuthProvider>
      <GrowthLoopApp />
    </AuthProvider>
  );
}
