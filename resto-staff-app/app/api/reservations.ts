import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getReservations(req, res);
    case 'POST':
      return createReservation(req, res);
    case 'PUT':
      return updateReservation(req, res);
    case 'DELETE':
      return deleteReservation(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function getReservations(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase.from('reservations').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}

async function createReservation(req: NextApiRequest, res: NextApiResponse) {
  const { customer_name, reservation_time, status, special_requests } = req.body;
  const { data, error } = await supabase.from('reservations').insert([
    { customer_name, reservation_time, status, special_requests },
  ]);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
}

async function updateReservation(req: NextApiRequest, res: NextApiResponse) {
  const { id, status } = req.body;
  const { data, error } = await supabase.from('reservations').update({ status }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}

async function deleteReservation(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;
  const { data, error } = await supabase.from('reservations').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}
