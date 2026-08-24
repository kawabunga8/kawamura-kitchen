// Serverless function to send emails via Gmail SMTP
// Deployed on Vercel at /api/send-email

import nodemailer from 'nodemailer';
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

  const { to, subject, html } = req.body;

  // Validate inputs
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, and html' });
  }

  // The app is open to anyone with the URL, so this endpoint is too. Rather than
  // let it relay mail to arbitrary addresses, only deliver to people who are
  // already listed in family_members.
  const { data: recipient, error: recipientError } = await supabase
    .from('family_members')
    .select('id')
    .ilike('email', to)
    .maybeSingle();

  if (recipientError) {
    console.error('Recipient lookup failed:', recipientError);
    return res.status(500).json({ error: 'Could not verify recipient' });
  }

  if (!recipient) {
    return res.status(403).json({ error: 'Recipient is not a family member' });
  }

  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('Gmail credentials not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD
    }
  });

  try {
    // Send email
    const info = await transporter.sendMail({
      from: `Kawamura Kitchen <${GMAIL_USER}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    });

    console.log('Email sent successfully:', info.messageId);
    return res.status(200).json({ success: true, id: info.messageId });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
