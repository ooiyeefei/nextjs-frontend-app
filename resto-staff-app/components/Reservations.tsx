import { useEffect, useState } from 'react';
import { Reservation } from '@/types';

function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    async function fetchReservations() {
      const response = await fetch('/api/reservations');
      const data = await response.json();
      setReservations(data);
    }
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Reservations</h2>
      <ul>
        {reservations.map((reservation) => (
          <li key={reservation.reservation_id} className={`reservation-${reservation.status}`}>
            {reservation.customers?.name} - {new Date(reservation.reservation_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reservations;
