// Goftino webhook handler (for Vercel or Netlify serverless functions)
// This endpoint receives POST requests from Goftino when a chat event occurs.
// Deploy this file under the `/api` directory of your Vercel project.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Parse JSON body (Vercel automatically parses JSON)
    const payload = req.body;

    console.log('🔔 Goftino webhook received:', JSON.stringify(payload, null, 2));

    // TODO: Add your custom processing here, e.g. store in a database,
    // send notifications, or trigger other workflows.

    // Respond to Goftino to acknowledge receipt
    return res.status(200).json({ status: 'ok' });
}
