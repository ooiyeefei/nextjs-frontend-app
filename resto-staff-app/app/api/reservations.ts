import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieStore = cookies()
  const supabase = await createServerSupabaseClient(Promise.resolve(cookieStore))
  const { method } = req;

  switch (method) {
    case 'GET':
      return getReservations(req, res, supabase)
    case 'POST':
      return createReservation(req, res, supabase)
    case 'PUT':
      return updateReservation(req, res, supabase)
    case 'DELETE':
      return deleteReservation(req, res, supabase)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function getReservations(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      reservation_id,
      reservation_time,
      customer_email,
      status,
      special_requests,
      dietary_restrictions,
      party_size
    `)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}

async function createReservation(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  const { 
    customer_email,
    reservation_time,
    status,
    special_requests,
    dietary_restrictions,
    party_size 
  } = req.body

  const { data, error } = await supabase
    .from('reservations')
    .insert([{ 
      customer_email,
      reservation_time,
      status,
      special_requests,
      dietary_restrictions,
      party_size
    }])
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

async function updateReservation(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  const { reservation_id, status } = req.body
  const { data, error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('reservation_id', reservation_id)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}

async function deleteReservation(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  const { reservation_id } = req.body
  const { data, error } = await supabase
    .from('reservations')
    .delete()
    .eq('reservation_id', reservation_id)
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}