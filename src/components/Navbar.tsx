import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Hotel, User, LogOut, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole(user?.id);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  return (
    <nav className="border-b bg-card shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
            <Hotel className="h-6 w-6" />
            <span>LuxStay</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin')}
                    className="hidden sm:flex"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} variant="default">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
