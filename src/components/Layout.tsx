import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import { apiClient } from "@/lib/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/", label: "סיכום שבועי" },
  { href: "/bonuses", label: "בונוסים לנציגים" },
  { href: "/statistics", label: "סטטיסטיקות" },
];

const NavLink = ({ href, children, onNavigate }: { href: string; children: React.ReactNode; onNavigate?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  return (
    <Link
      to={href}
      onClick={onNavigate}
      className={cn(
        "block w-full text-right px-3 py-2 rounded-md font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        onNavigate ? "text-base" : "text-sm"
      )}
    >
      {children}
    </Link>
  );
};

const Layout = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const user = apiClient.getUser();

  const handleLogout = () => {
    apiClient.logout();
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-bold">
              רהיטי הסיטי
            </Link>
            {user && (
              <span className="text-sm text-muted-foreground">
                שלום, {user.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">פתח תפריט</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] pt-10">
                  <div className="flex flex-col items-start gap-4">
                    {navItems.map((item) => (
                      <NavLink key={item.href} href={item.href} onNavigate={() => setIsSheetOpen(false)}>
                        {item.label}
                      </NavLink>
                    ))}
                    <Button variant="outline" onClick={handleLogout} className="w-full justify-start">
                      <LogOut className="ml-2 h-4 w-4" />
                      התנתק
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <>
                <div className="flex items-center gap-2 sm:gap-4">
                  {navItems.map((item) => (
                    <NavLink key={item.href} href={item.href}>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="ml-2 h-4 w-4" />
                      התנתק
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;