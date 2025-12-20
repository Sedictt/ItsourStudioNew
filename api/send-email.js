import nodemailer from 'nodemailer';

// ============================================
// PREMIUM EMAIL TEMPLATES FOR IT'S OUR STUDIO
// ============================================

const getConfirmedEmail = (booking) => {
    const ref = booking.referenceNumber || '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="width: 100%; padding: 40px 20px; box-sizing: border-box;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 24px; overflow: hidden; border: 1px solid #333;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #bf6a39 0%, #d4854f 50%, #bf6a39 100%); padding: 50px 30px; text-align: center;">
                <div style="font-size: 50px; margin-bottom: 15px;">✨</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">YOU'RE ALL SET!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 15px;">Your session is officially confirmed</p>
            </div>

            <!-- Reference Number Banner -->
            ${ref ? `
            <div style="background: #111; padding: 20px; text-align: center; border-bottom: 1px solid #333;">
                <p style="margin: 0 0 8px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px;">Booking Reference</p>
                <div style="font-size: 26px; font-weight: 800; color: #bf6a39; font-family: 'Courier New', monospace; letter-spacing: 3px;">${ref}</div>
            </div>
            ` : ''}

            <!-- Greeting -->
            <div style="padding: 35px 30px 20px;">
                <p style="color: #e0e0e0; font-size: 16px; line-height: 1.7; margin: 0; text-align: center;">
                    Hey <strong style="color: #fff;">${booking.name}</strong>! 👋<br>
                    We're thrilled to have you! Here are your session details:
                </p>
            </div>

            <!-- Session Details Card -->
            <div style="padding: 0 30px 30px;">
                <div style="background: linear-gradient(145deg, #222 0%, #1a1a1a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #333;">
                    <div style="display: flex;">
                        <div style="flex: 1; padding: 25px; border-right: 1px solid #333; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">📅 Date</p>
                            <p style="margin: 0; font-size: 18px; color: #fff; font-weight: 600;">${booking.date}</p>
                        </div>
                        <div style="flex: 1; padding: 25px; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">⏰ Time</p>
                            <p style="margin: 0; font-size: 18px; color: #fff; font-weight: 600;">${booking.time_start}</p>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #333; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">📸 Package</p>
                        <p style="margin: 0; font-size: 20px; color: #bf6a39; font-weight: 700;">${booking.package}</p>
                    </div>
                </div>
            </div>

            <!-- Location -->
            <div style="padding: 0 30px 30px;">
                <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; border: 1px solid #333;">
                    <div style="display: flex; align-items: flex-start; gap: 15px;">
                        <div style="font-size: 24px;">📍</div>
                        <div>
                            <p style="margin: 0 0 5px; color: #fff; font-weight: 600; font-size: 14px;">Studio Location</p>
                            <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.5;">
                                FJ Center 15 Tongco Maysan, Valenzuela City<br>
                                <span style="color: #666; font-size: 12px;">Near PLV, Cebuana, Mr. DIY, Ever</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reminders -->
            <div style="padding: 0 30px 30px;">
                <div style="background: linear-gradient(135deg, #2d2418 0%, #1a1a1a 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #bf6a39;">
                    <p style="margin: 0 0 12px; color: #bf6a39; font-weight: 700; font-size: 13px; text-transform: uppercase;">📝 Quick Reminders</p>
                    <ul style="margin: 0; padding-left: 18px; color: #ccc; font-size: 13px; line-height: 1.8;">
                        <li>Arrive <strong>15 minutes early</strong></li>
                        <li>Late = less shooting time</li>
                        <li>Pets welcome (diapers required 🐾)</li>
                        <li>Bring props & outfit changes!</li>
                    </ul>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #222;">
                <p style="margin: 0 0 10px; color: #bf6a39; font-size: 18px; font-weight: 300;">See you soon! 📸</p>
                <p style="margin: 0; color: #555; font-size: 11px;">© It's ouR Studio • All rights reserved</p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

const getReceivedEmail = (booking) => {
    const ref = booking.referenceNumber || '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="width: 100%; padding: 40px 20px; box-sizing: border-box;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 24px; overflow: hidden; border: 1px solid #333;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #111 100%); padding: 50px 30px; text-align: center; border-bottom: 1px solid #333;">
                <div style="font-size: 50px; margin-bottom: 15px;">⏳</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">ALMOST THERE!</h1>
                <p style="color: #888; margin: 10px 0 0; font-size: 14px;">Complete your payment to secure your slot</p>
            </div>

            <!-- Reference Number - PROMINENT -->
            ${ref ? `
            <div style="background: linear-gradient(135deg, #bf6a39 0%, #a85a2f 100%); padding: 25px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 11px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">Your Booking Reference</p>
                <div style="font-size: 32px; font-weight: 800; color: #fff; font-family: 'Courier New', monospace; letter-spacing: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${ref}</div>
                <p style="margin: 12px 0 0; font-size: 12px; color: rgba(255,255,255,0.7);">📋 Include this in your GCash payment notes</p>
            </div>
            ` : ''}

            <!-- Payment Details -->
            <div style="padding: 30px;">
                <div style="background: linear-gradient(145deg, #222 0%, #1a1a1a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #333; text-align: center;">
                    <div style="padding: 30px 20px; border-bottom: 1px solid #333;">
                        <p style="margin: 0 0 5px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Downpayment Required</p>
                        <div style="font-size: 48px; font-weight: 800; color: #bf6a39;">₱${booking.downpayment}</div>
                    </div>
                    <div style="padding: 25px 20px; background: #1a1a1a;">
                        <p style="margin: 0 0 5px; font-size: 12px; color: #888;">Send via GCash to:</p>
                        <p style="margin: 0; font-size: 20px; color: #fff; font-weight: 700;">Reggie L.</p>
                        <p style="margin: 8px 0 0; font-size: 22px; color: #bf6a39; font-family: 'Courier New', monospace; font-weight: 700;">0905 336 7103</p>
                    </div>
                </div>
            </div>

            <!-- Deadline Warning -->
            <div style="padding: 0 30px 30px;">
                <div style="background: linear-gradient(135deg, #3d1515 0%, #1a1a1a 100%); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #5c2020;">
                    <p style="margin: 0; color: #ff6b6b; font-size: 14px; font-weight: 600;">
                        ⚠️ Payment Deadline: <strong>11:59 PM Tonight</strong>
                    </p>
                    <p style="margin: 8px 0 0; color: #999; font-size: 12px;">Unpaid reservations will be released</p>
                </div>
            </div>

            <!-- Instructions -->
            <div style="padding: 0 30px 30px;">
                <div style="background: #111; border-radius: 12px; padding: 20px; border: 1px solid #333;">
                    <p style="margin: 0 0 15px; color: #fff; font-weight: 600; font-size: 14px;">📱 How to Complete Payment:</p>
                    <ol style="margin: 0; padding-left: 20px; color: #aaa; font-size: 13px; line-height: 2;">
                        <li>Open your GCash app</li>
                        <li>Send ₱${booking.downpayment} to <strong style="color: #bf6a39;">0905 336 7103</strong></li>
                        <li>Add reference <strong style="color: #fff;">${ref || 'your name'}</strong> in notes</li>
                        <li>Screenshot the confirmation</li>
                        <li>Reply to this email with the screenshot</li>
                    </ol>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #0a0a0a; padding: 25px; text-align: center; border-top: 1px solid #222;">
                <p style="margin: 0 0 8px; color: #888; font-size: 12px;">Questions? Just reply to this email</p>
                <p style="margin: 0; color: #444; font-size: 11px;">© It's ouR Studio</p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

const getRejectedEmail = (booking) => {
    const ref = booking.referenceNumber || '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="width: 100%; padding: 40px 20px; box-sizing: border-box;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 24px; overflow: hidden; border: 1px solid #333;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2d1a1a 0%, #1a1010 100%); padding: 50px 30px; text-align: center; border-bottom: 1px solid #442222;">
                <div style="font-size: 50px; margin-bottom: 15px;">📋</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">BOOKING UPDATE</h1>
                <p style="color: #888; margin: 10px 0 0; font-size: 14px;">We have news about your reservation</p>
            </div>

            <!-- Reference -->
            ${ref ? `
            <div style="background: #111; padding: 15px; text-align: center; border-bottom: 1px solid #333;">
                <p style="margin: 0; font-size: 12px; color: #888;">Reference: <strong style="color: #fff; font-family: monospace;">${ref}</strong></p>
            </div>
            ` : ''}

            <!-- Message -->
            <div style="padding: 30px;">
                <div style="background: linear-gradient(135deg, #2d1515 0%, #1a1a1a 100%); border-radius: 12px; padding: 25px; border: 1px solid #442222;">
                    <p style="margin: 0 0 10px; color: #ff8080; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message from Admin</p>
                    <p style="margin: 0; color: #ddd; font-size: 15px; line-height: 1.6;">${booking.reason}</p>
                </div>
            </div>

            <!-- Booking Details -->
            <div style="padding: 0 30px 30px;">
                <div style="background: #111; border-radius: 12px; padding: 20px; border: 1px solid #333;">
                    <p style="margin: 0 0 5px; font-size: 11px; color: #666; text-transform: uppercase;">Regarding</p>
                    <p style="margin: 0; color: #fff; font-size: 15px;"><strong>${booking.package}</strong> on ${booking.date}</p>
                </div>
            </div>

            <!-- CTA -->
            <div style="padding: 0 30px 30px; text-align: center;">
                <p style="color: #888; font-size: 14px; margin: 0 0 15px;">Want to book a different slot?</p>
                <a href="https://itsour-studio.vercel.app" style="display: inline-block; background: linear-gradient(135deg, #bf6a39 0%, #a85a2f 100%); color: #fff; text-decoration: none; padding: 14px 35px; border-radius: 30px; font-weight: 600; font-size: 14px;">Browse Available Dates</a>
            </div>

            <!-- Footer -->
            <div style="background: #0a0a0a; padding: 25px; text-align: center; border-top: 1px solid #222;">
                <p style="margin: 0 0 8px; color: #888; font-size: 12px;">Need help? Email us at <a href="mailto:itsourstudio1@gmail.com" style="color: #bf6a39;">itsourstudio1@gmail.com</a></p>
                <p style="margin: 0; color: #444; font-size: 11px;">© It's ouR Studio</p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

const getContactEmail = (contact) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="width: 100%; padding: 40px 20px; box-sizing: border-box;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 24px; overflow: hidden; border: 1px solid #333;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #bf6a39 0%, #a85a2f 100%); padding: 40px 30px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 10px;">💬</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">NEW WEBSITE INQUIRY</h1>
            </div>

            <!-- Contact Details -->
            <div style="padding: 30px;">
                <div style="background: #111; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
                    <div style="padding: 20px; border-bottom: 1px solid #333;">
                        <p style="margin: 0 0 5px; font-size: 11px; color: #888; text-transform: uppercase;">From</p>
                        <p style="margin: 0; color: #fff; font-size: 16px; font-weight: 600;">${contact.name}</p>
                    </div>
                    <div style="padding: 20px; border-bottom: 1px solid #333;">
                        <p style="margin: 0 0 5px; font-size: 11px; color: #888; text-transform: uppercase;">Email</p>
                        <a href="mailto:${contact.email}" style="color: #bf6a39; font-size: 15px; text-decoration: none;">${contact.email}</a>
                    </div>
                    <div style="padding: 20px;">
                        <p style="margin: 0 0 10px; font-size: 11px; color: #888; text-transform: uppercase;">Message</p>
                        <div style="background: #0a0a0a; padding: 20px; border-radius: 8px; border-left: 3px solid #bf6a39;">
                            <p style="margin: 0; color: #ddd; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${contact.message}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Reply -->
            <div style="padding: 0 30px 30px; text-align: center;">
                <a href="mailto:${contact.email}" style="display: inline-block; background: linear-gradient(135deg, #bf6a39 0%, #a85a2f 100%); color: #fff; text-decoration: none; padding: 14px 35px; border-radius: 30px; font-weight: 600; font-size: 14px;">Reply to ${contact.name}</a>
            </div>

            <!-- Footer -->
            <div style="background: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #222;">
                <p style="margin: 0; color: #555; font-size: 11px;">Sent from It's ouR Studio website contact form</p>
            </div>
        </div>
    </div>
</body>
</html>`;

// ============================================
// API HANDLER
// ============================================

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, booking, contact } = req.body;

    // Validation
    if (type === 'contact') {
        if (!contact || !contact.name || !contact.email || !contact.message) {
            return res.status(400).json({ error: 'Missing required fields for contact form' });
        }
    } else if (!type || !booking || !booking.email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({
            error: 'Server configuration error',
            details: 'Missing EMAIL_USER or EMAIL_PASS'
        });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let subject = '';
    let html = '';
    let toEmail = booking?.email;

    switch (type) {
        case 'confirmed':
            subject = `✅ Booking Confirmed ${booking.referenceNumber ? `[${booking.referenceNumber}]` : ''} - It's ouR Studio`;
            html = getConfirmedEmail(booking);
            break;
        case 'received':
            subject = `📸 Booking Received ${booking.referenceNumber ? `[${booking.referenceNumber}]` : ''} - Action Required`;
            html = getReceivedEmail(booking);
            break;
        case 'rejected':
            subject = `📋 Booking Update ${booking.referenceNumber ? `[${booking.referenceNumber}]` : ''} - It's ouR Studio`;
            html = getRejectedEmail(booking);
            break;
        case 'contact':
            subject = `💬 New Inquiry from ${contact.name}`;
            html = getContactEmail(contact);
            toEmail = process.env.BUSINESS_EMAIL || process.env.EMAIL_USER;
            break;
        default:
            return res.status(400).json({ error: 'Invalid email type' });
    }

    try {
        await transporter.sendMail({
            from: `"It's ouR Studio" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            replyTo: type === 'contact' ? contact.email : undefined,
            subject: subject,
            html: html
        });

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({
            error: 'Failed to send email',
            message: error.message,
            code: error.code
        });
    }
}
