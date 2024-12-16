import Link from 'next/link';
import Reservations from '../../components/Reservations'; 

export default function Dashboard() {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <nav className="mb-6">
          <ul className="flex gap-4">
            <li><Link href="/reservations" className="text-blue-500 hover:underline">Reservations</Link></li>
            <li><Link href="/customers" className="text-blue-500 hover:underline">Customer List</Link></li>
          </ul>
        </nav>
        <h1 className="text-xl font-bold">Welcome to the Dashboard</h1>
        <section>
          <h2 className="mt-4 text-lg font-semibold">Reservations</h2>
          {/* Add reservation content here */}
        </section>
      </main>
    );
  }