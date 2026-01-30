import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Topical Map
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost">Mes Projets</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
