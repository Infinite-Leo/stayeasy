import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Users, BedDouble, Wifi, Coffee, Tv, Wind } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import roomSingleImage from '@/assets/room-single.jpg';
import roomDoubleImage from '@/assets/room-double.jpg';
import roomDeluxeImage from '@/assets/room-deluxe.jpg';
import roomSuiteImage from '@/assets/room-suite.jpg';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const roomImages: Record<string, string> = {
    single: roomSingleImage,
    double: roomDoubleImage,
    deluxe: roomDeluxeImage,
    suite: roomSuiteImage,
  };

  useEffect(() => {
    if (id) {
      fetchRoom();
    }
  }, [id]);

  const fetchRoom = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setRoom(data);
    } else {
      toast.error('Room not found');
      navigate('/');
    }
    setLoading(false);
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !room) return 0;
    const days = differenceInDays(new Date(checkOut), new Date(checkIn));
    return days > 0 ? days * parseFloat(room.price) : 0;
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book a room');
      navigate('/auth');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setBooking(true);

    const totalPrice = calculateTotal();

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      room_id: room.id,
      start_date: checkIn,
      end_date: checkOut,
      total_price: totalPrice,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to create booking');
    } else {
      toast.success('Booking created successfully!');
      navigate('/my-bookings');
    }
    setBooking(false);
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src={roomImages[room.type] || roomSingleImage}
                alt={`${room.type} room`}
                className="w-full h-full object-cover"
              />
              {!room.is_available && (
                <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-6 py-2">
                    Not Available
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Room {room.room_number}</h1>
                  <Badge className="bg-primary text-primary-foreground">
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">₹{room.price}</div>
                  <div className="text-sm text-muted-foreground">per night</div>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{room.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Up to {room.max_occupancy} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-primary" />
                  <span>King Bed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  <span>Free WiFi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-primary" />
                  <span>Coffee Maker</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tv className="h-5 w-5 text-primary" />
                  <span>Smart TV</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-primary" />
                  <span>Air Conditioning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="check-in">Check-in</Label>
                  <Input
                    id="check-in"
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    disabled={!room.is_available}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check-out">Check-out</Label>
                  <Input
                    id="check-out"
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    disabled={!room.is_available}
                  />
                </div>
                
                {checkIn && checkOut && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span className="font-semibold">
                        {differenceInDays(new Date(checkOut), new Date(checkIn))}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleBooking}
                  disabled={!room.is_available || booking || !checkIn || !checkOut}
                >
                  {booking ? 'Booking...' : room.is_available ? 'Confirm Booking' : 'Unavailable'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
