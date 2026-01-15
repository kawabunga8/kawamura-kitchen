// Serverless function to send emails via Gmail SMTP
// Deployed on Vercel at /api/send-email

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY
);



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


  const { to, subject, html } = req.body;

  // Validate inputs
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, and html' });
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
