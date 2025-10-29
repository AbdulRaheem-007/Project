import { supabaseServer } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
  try {
    const supabase = supabaseServer();
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST') {
      const { title, description, status = 'New' } = req.body || {};
      const allowed = ['New','In Progress','Resolved','Closed'];
      if (!title || !description) return res.status(400).json({ error: 'title and description required' });
      if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid status' });
      const { data, error } = await supabase
        .from('tickets')
        .insert([{ title, description, status }])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
