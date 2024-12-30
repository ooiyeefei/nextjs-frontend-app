import { useEffect, useState } from 'react';

interface Reservation {
    id: string;
    customer_name: string;
    reservation_time: string; // Use string for timestamp
    status: string; // Restrict values if needed (e.g., 'arriving-soon', 'late', etc.)
  }

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
          <li key={reservation.id} className={`reservation-${reservation.status}`}>
            {reservation.customer_name} - {new Date(reservation.reservation_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Reservations;
