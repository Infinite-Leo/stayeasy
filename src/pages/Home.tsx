import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { RoomCard } from '@/components/RoomCard';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import heroImage from '@/assets/hero-hotel.jpg';
import roomSingleImage from '@/assets/room-single.jpg';
import roomDoubleImage from '@/assets/room-double.jpg';
import roomDeluxeImage from '@/assets/room-deluxe.jpg';
import roomSuiteImage from '@/assets/room-suite.jpg';

const Home = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const roomImages: Record<string, string> = {
    single: roomSingleImage,
    double: roomDoubleImage,
    deluxe: roomDeluxeImage,
    suite: roomSuiteImage,
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('type', { ascending: true });

    if (!error && data) {
      setRooms(data);
      setFilteredRooms(data);
    }
    setLoading(false);
  };

  const handleSearch = (checkIn: string, checkOut: string, roomType: string) => {
    let filtered = rooms;

    if (roomType !== 'all') {
      filtered = filtered.filter((room) => room.type === roomType);
    }

    // Filter by availability
    filtered = filtered.filter((room) => room.is_available);

    setFilteredRooms(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={heroImage}
          alt="Luxury hotel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-primary-foreground">
              <h1 className="text-5xl font-bold mb-4">
                Welcome to LuxStay
              </h1>
              <p className="text-xl mb-8">
                Experience luxury and comfort in our premium rooms. Your perfect stay awaits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Rooms Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Available Rooms</h2>
          <p className="text-muted-foreground">
            Choose from our selection of beautifully designed rooms
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              No rooms available for your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                roomNumber={room.room_number}
                type={room.type}
                price={parseFloat(room.price)}
                description={room.description}
                imageUrl={roomImages[room.type] || roomSingleImage}
                isAvailable={room.is_available}
                maxOccupancy={room.max_occupancy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
