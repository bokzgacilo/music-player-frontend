import { AdminGate } from "@/components/auth/admin-gate";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
