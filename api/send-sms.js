import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Prefer server-style env var names on Vercel; fall back to legacy VITE_* names.
const SUPABASE_URL =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;

const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Auth Check
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const { to, body } = req.body;

    if (!to || !body) {
        return res.status(400).json({ error: 'Missing required fields: to, body' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        console.error('Twilio credentials not configured');
        return res.status(500).json({ error: 'SMS service not configured' });
    }

    try {
        const client = twilio(accountSid, authToken);

        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to
        });

        console.log('SMS sent successfully:', message.sid);
        return res.status(200).json({ success: true, sid: message.sid });

    } catch (error) {
        console.error('Error sending SMS:', error);
        return res.status(500).json({ error: 'Failed to send SMS: ' + error.message });
    }
}
