import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingCard } from '@/components/BookingCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import roomSingleImage from '@/assets/room-single.jpg';
import roomDoubleImage from '@/assets/room-double.jpg';
import roomDeluxeImage from '@/assets/room-deluxe.jpg';
import roomSuiteImage from '@/assets/room-suite.jpg';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const roomImages: Record<string, string> = {
    single: roomSingleImage,
    double: roomDoubleImage,
    deluxe: roomDeluxeImage,
    suite: roomSuiteImage,
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          room_number,
          type,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to cancel booking');
    } else {
      toast.success('Booking cancelled successfully');
      fetchBookings();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your hotel reservations
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              You don't have any bookings yet
            </p>
            <Button onClick={() => navigate('/')}>
              Browse Rooms
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                id={booking.id}
                roomNumber={booking.rooms.room_number}
                roomType={booking.rooms.type}
                roomImage={roomImages[booking.rooms.type] || roomSingleImage}
                startDate={booking.start_date}
                endDate={booking.end_date}
                totalPrice={parseFloat(booking.total_price)}
                status={booking.status}
                onCancel={handleCancelBooking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
