import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface BookingCardProps {
  id: string;
  roomNumber: string;
  roomType: string;
  roomImage: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

export const BookingCard = ({
  id,
  roomNumber,
  roomType,
  roomImage,
  startDate,
  endDate,
  totalPrice,
  status,
  onCancel,
  showActions = true,
}: BookingCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-amber-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-medium transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-48 h-48 md:h-auto">
          <img
            src={roomImage}
            alt={`Room ${roomNumber}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Room {roomNumber}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{roomType}</p>
              </div>
              <Badge className={getStatusColor(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Total: ${totalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
          {showActions && status !== 'cancelled' && (
            <CardFooter>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel?.(id)}
              >
                Cancel Booking
              </Button>
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  );
};
