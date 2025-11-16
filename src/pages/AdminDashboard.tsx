import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import roomSingleImage from '@/assets/room-single.jpg';
import roomDoubleImage from '@/assets/room-double.jpg';
import roomDeluxeImage from '@/assets/room-deluxe.jpg';
import roomSuiteImage from '@/assets/room-suite.jpg';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole(user?.id);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    type: 'single' as 'single' | 'double' | 'deluxe' | 'suite',
    price: '',
    description: '',
    is_available: true,
    max_occupancy: 2,
  });

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
    if (!roleLoading && !isAdmin) {
      toast.error('Access denied');
      navigate('/');
      return;
    }
    if (isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, roleLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRooms(), fetchBookings()]);
    setLoading(false);
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true });

    if (!error && data) {
      setRooms(data);
    }
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (room_number, type),
        profiles (name, email)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
  };

  const handleSaveRoom = async () => {
    if (!roomForm.room_number || !roomForm.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const roomData = {
      ...roomForm,
      price: parseFloat(roomForm.price),
      image_url: roomImages[roomForm.type],
    };

    if (editingRoom) {
      const { error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', editingRoom.id);

      if (error) {
        toast.error('Failed to update room');
      } else {
        toast.success('Room updated successfully');
        setDialogOpen(false);
        setEditingRoom(null);
        fetchRooms();
      }
    } else {
      const { error } = await supabase.from('rooms').insert(roomData);

      if (error) {
        toast.error('Failed to create room');
      } else {
        toast.success('Room created successfully');
        setDialogOpen(false);
        fetchRooms();
      }
    }

    resetForm();
  };

  const handleDeleteRoom = async (id: string) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete room');
    } else {
      toast.success('Room deleted successfully');
      fetchRooms();
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update booking');
    } else {
      toast.success('Booking updated successfully');
      fetchBookings();
    }
  };

  const openEditDialog = (room: any) => {
    setEditingRoom(room);
    setRoomForm({
      room_number: room.room_number,
      type: room.type,
      price: room.price.toString(),
      description: room.description || '',
      is_available: room.is_available,
      max_occupancy: room.max_occupancy,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setRoomForm({
      room_number: '',
      type: 'single',
      price: '',
      description: '',
      is_available: true,
      max_occupancy: 2,
    });
    setEditingRoom(null);
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage rooms and bookings
          </p>
        </div>

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Room Management</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingRoom ? 'Edit Room' : 'Add New Room'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="room_number">Room Number</Label>
                        <Input
                          id="room_number"
                          value={roomForm.room_number}
                          onChange={(e) =>
                            setRoomForm({ ...roomForm, room_number: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Room Type</Label>
                        <Select
                          value={roomForm.type}
                          onValueChange={(value: any) =>
                            setRoomForm({ ...roomForm, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="double">Double</SelectItem>
                            <SelectItem value="deluxe">Deluxe</SelectItem>
                            <SelectItem value="suite">Suite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price per Night</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={roomForm.price}
                          onChange={(e) =>
                            setRoomForm({ ...roomForm, price: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_occupancy">Max Occupancy</Label>
                        <Input
                          id="max_occupancy"
                          type="number"
                          value={roomForm.max_occupancy}
                          onChange={(e) =>
                            setRoomForm({
                              ...roomForm,
                              max_occupancy: parseInt(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={roomForm.description}
                          onChange={(e) =>
                            setRoomForm({ ...roomForm, description: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_available"
                          checked={roomForm.is_available}
                          onChange={(e) =>
                            setRoomForm({ ...roomForm, is_available: e.target.checked })
                          }
                        />
                        <Label htmlFor="is_available">Available</Label>
                      </div>
                      <Button onClick={handleSaveRoom} className="w-full">
                        {editingRoom ? 'Update Room' : 'Create Room'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.room_number}</TableCell>
                        <TableCell className="capitalize">{room.type}</TableCell>
                        <TableCell>${room.price}</TableCell>
                        <TableCell>
                          <Badge variant={room.is_available ? 'default' : 'secondary'}>
                            {room.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(room)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRoom(room.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.profiles.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.profiles.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          Room {booking.rooms.room_number}
                          <span className="text-sm text-muted-foreground block capitalize">
                            {booking.rooms.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(booking.start_date), 'MMM dd')} -{' '}
                            {format(new Date(booking.end_date), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>${parseFloat(booking.total_price).toFixed(2)}</TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) =>
                              handleUpdateBookingStatus(booking.id, value as 'pending' | 'confirmed' | 'cancelled')
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
