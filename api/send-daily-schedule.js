export default async function handler(req, res) {
  try {
    // Dynamic imports for serverless compatibility
    const nodemailer = await import('nodemailer').then(m => m.default);
    const { createClient } = await import('@supabase/supabase-js');

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_KEY
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const RECIPIENTS = [
      'kawamura.shingo@gmail.com',
      'sarahkawamura71@gmail.com',
      'keziaraej@gmail.com',
    ];

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('dinners')
      .select('*')
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    let subject = `Kawamura Kitchen - ${today}`;
    let emailBody = '';

    if (data) {
      emailBody = `Hi Kawamura family!\n\nToday's meal:\n\nMeal: ${data.meal}\nChef: ${data.chef}\nTime: ${data.time}${data.notes ? '\nNotes: ' + data.notes : ''}\n\nSee you at dinner!`;
    } else {
      emailBody = `Hi Kawamura family!\n\nNo meal scheduled for today (${today}).\n\nPlease add a meal to the schedule if needed!`;
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: RECIPIENTS.join(', '),
      subject,
      text: emailBody,
    });

    res.status(200).json({
      success: true,
      message: `Daily schedule email sent for ${today}`,
      hasMeal: !!data,
    });
  } catch (error) {
    console.error('Error sending daily schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
