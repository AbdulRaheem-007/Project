import { supabaseServer } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
  try {
    const supabase = supabaseServer();
    const { id } = req.query;

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single();
      if (error) return res.status(404).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const { title, description, status } = req.body || {};
      const allowed = ['New','In Progress','Resolved','Closed'];
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (status !== undefined) {
        if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid status' });
        updates.status = status;
      }

      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
