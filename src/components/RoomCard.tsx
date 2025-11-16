import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  id: string;
  roomNumber: string;
  type: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  maxOccupancy: number;
}

export const RoomCard = ({
  id,
  roomNumber,
  type,
  price,
  description,
  imageUrl,
  isAvailable,
  maxOccupancy,
}: RoomCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 group">
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={`${type} room`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
            <Badge variant="destructive">Not Available</Badge>
          </div>
        )}
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      </div>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">Room {roomNumber}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Up to {maxOccupancy} guests</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${price}</div>
            <div className="text-xs text-muted-foreground">per night</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => navigate(`/room/${id}`)}
          disabled={!isAvailable}
        >
          {isAvailable ? 'Book Now' : 'Unavailable'}
        </Button>
      </CardFooter>
    </Card>
  );
};
