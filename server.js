import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json()); // Enable JSON body parsing

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public', 'POP');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Keep original name but prepend timestamp to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize filename to remove spaces/special chars
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can configure this based on the user's provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email Templates
const getConfirmedEmail = (booking) => `
<div style='font-family: "Quicksand", Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff4e6; padding: 20px; border-radius: 10px;'>
    <h2 style='font-family: "League Spartan", Arial, sans-serif; color: #3b2c28; text-align: center; margin-bottom: 20px;'>Good day, ${booking.name}!</h2>
    <p style='color: #3b2c28; text-align: center; font-size: 18px;'>Your booking with it's ouR studio has been confirmed!</p>
    
    <div style='background-color: #fff; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #bf6a39; text-align: center;'>
        <h3 style='font-family: "League Spartan", Arial, sans-serif; color: #bf6a39; margin: 5px 0;'>Appointment Details</h3>
        <p style='color: #3b2c28; margin: 5px 0;'><strong>Date:</strong> ${booking.date}</p>
        <p style='color: #3b2c28; margin: 5px 0;'><strong>Time:</strong> ${booking.time_start}</p>
    </div>
    
    <div style='background-color: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #bf6a39;'>
        <h3 style='font-family: "League Spartan", Arial, sans-serif; color: #bf6a39; margin: 5px 0;'>Package Details</h3>
        <p style='color: #3b2c28; margin: 5px 0;'><strong>Package:</strong> ${booking.package}</p>
        ${booking.extensionText ? `<p style='color: #3b2c28; margin: 5px 0;'><strong>Extension:</strong> ${booking.extensionText}</p>` : ''}
        <h3 style='font-family: "League Spartan", Arial, sans-serif; color: #bf6a39; margin: 15px 0 5px 0;'>Location</h3>
        <p style='color: #3b2c28; margin: 5px 0;'><strong>Address:</strong> FJ Center 15 Tongco Maysan, Valenzuela City</p>
        <p style='color: #3b2c28; margin: 5px 0;'><strong>Landmark:</strong> PLV, Cebuana, Mr. DIY, and Ever</p>
    </div>
    
    <div style='background-color: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #8b5e3b;'>
        <h3 style='font-family: "League Spartan", Arial, sans-serif; color: #8b5e3b; margin: 5px 0;'>Important Reminders</h3>
        <ul style='color: #3b2c28; padding-left: 20px;'>
            <li style='margin: 8px 0;'>To maximize your time, please arrive at least 15 minutes before your appointment.</li>
            <li style='margin: 8px 0;'>Your time will begin on time and cannot be adjusted as there will be another client after you.</li>
            <li style='margin: 8px 0;'>If you are late, your time will be deducted based on how many minutes you are late.</li>
            <li style='margin: 8px 0;'>If you miss your appointment and do not arrive on time, it will be considered cancelled and non-refundable.</li>
            <li style='margin: 8px 0;'>Rescheduling is allowed 5 days before your appointment. ❌</li>
            <li style='margin: 8px 0;'>Cancelling and rebooking is not allowed 1-2 days prior to your appointment.</li>
            <li style='margin: 8px 0;'>If you are bringing your furbabies, make sure they are wearing a diaper and be responsible for your own pet. 🐱🐶</li>
            <li style='margin: 8px 0;'>Ages over one will be counted as one pax.</li>
            <li style='margin: 8px 0;'>Any damages that occur within the studio will be covered by the previous client. Please use the equipment with caution.</li>
            <li style='margin: 8px 0;'>You are welcome to bring your own props! Hazardous substances, explosives, and other items that might damage the studio won't be permitted.</li>
        </ul>
    </div>
    
    <p style='color: #3b2c28; text-align: center; margin-top: 20px;'>If you have any questions or concerns, please don't hesitate to inform us!</p>
    <p style='color: #3b2c28; text-align: center; font-weight: bold;'>Thank you for choosing it's ouR Studio!</p>
    <p style='color: #8b5e3b; text-align: center; font-size: 14px;'>We look forward to capturing your special moments.</p>
    <p style='color: #bf6a39; text-align: center; font-size: 16px; font-weight: bold;'>See you soon! 😊🥰</p>
</div>`;

const getReceivedEmail = (booking) => `
<div style='font-family: "Quicksand", Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff4e6; padding: 20px; border-radius: 10px;'>
    <h2 style='font-family: "League Spartan", Arial, sans-serif; color: #3b2c28; text-align: center; margin-bottom: 20px;'>Thank you for choosing it's ouR Studio!</h2>
    
    <p style='color: #3b2c28; line-height: 1.6;'>To confirm your booking, a 50% down payment is required. After your studio session, the remaining amount must be paid.</p>
    
    <div style='background-color: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #bf6a39;'>
        <p style='color: #3b2c28; margin: 5px 0;'><strong style='color: #bf6a39;'>${booking.package}</strong>: ₱${booking.total_amount}</p>
        <p style='color: #3b2c28; margin: 5px 0;'><strong style='color: #bf6a39;'>Down payment</strong>: ₱${booking.downpayment}</p>
    </div>
    
    <p style='color: #3b2c28; line-height: 1.6;'>If you haven't made your down payment yet, please send your payment to the following account:</p>
    
    <div style='background-color: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; text-align: center; border-left: 4px solid #bf6a39;'>
        <p style='color: #3b2c28; margin: 5px 0;'><strong style='color: #bf6a39;'>GCASH</strong><br>
        Reggie L. - ${process.env.GCASH_NUMBER || '0917 123 4567'}</p>
        
        <div style='margin: 15px auto; max-width: 200px;'>
            <img src='cid:gcash-qr' alt='GCash QR Code' style='width: 100%; height: auto; border-radius: 5px;'>
        </div>
    </div>
    
    <p style='color: #3b2c28; line-height: 1.6;'>Once done, kindly reply to this email with your proof of payment for validation.</p>
    
    <div style='background-color: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #8b5e3b;'>
        <p style='color: #3b2c28; margin: 5px 0;'><strong style='color: #8b5e3b;'>Please Note!</strong></p>
        <ul style='color: #3b2c28; padding-left: 20px;'>
            <li style='margin: 5px 0;'>To confirm your booking, kindly send the down payment until 11:59 pm TONIGHT.</li>
            <li style='margin: 5px 0;'>Send the proof of payment to validate.</li>
            <li style='margin: 5px 0;'>If you cancel or reschedule 1-2 days prior, it will be non-refundable.</li>
        </ul>
    </div>
    
    <p style='color: #3b2c28; text-align: center; margin-top: 20px;'>Thank you for choosing it's ouR Studio!</p>
    <p style='color: #8b5e3b; text-align: center; font-size: 12px;'>We can't wait to capture your special moments.</p>
</div>`;

const getRejectedEmail = (booking) => `
<div style='font-family: "Quicksand", Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff4e6; padding: 20px; border-radius: 10px;'>
    <h2 style='font-family: "League Spartan", Arial, sans-serif; color: #3b2c28; text-align: center; margin-bottom: 20px;'>Booking Update</h2>
    
    <p style='color: #3b2c28; line-height: 1.6;'>Dear ${booking.name},</p>
    
    <p style='color: #3b2c28; line-height: 1.6;'>We regret to inform you that your booking has been rejected.</p>
    
    <div style='background-color: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #bf6a39;'>
        <p style='color: #3b2c28; margin: 5px 0;'><strong style='color: #bf6a39;'>Reason:</strong> ${booking.reason}</p>
        
        <h3 style='font-family: "League Spartan", Arial, sans-serif; color: #bf6a39; margin: 15px 0 5px 0;'>Booking Details</h3>
        <ul style='color: #3b2c28; padding-left: 20px;'>
            <li style='margin: 5px 0;'><strong>Package:</strong> ${booking.package}</li>
            <li style='margin: 5px 0;'><strong>Date:</strong> ${booking.date}</li>
            <li style='margin: 5px 0;'><strong>Time:</strong> ${booking.time_start}</li>
        </ul>
    </div>
    
    <p style='color: #3b2c28; line-height: 1.6;'>If you have any questions, please contact us at ${process.env.BUSINESS_EMAIL || 'contact@itsourstudio.com'}</p>
    
    <p style='color: #3b2c28; text-align: center; margin-top: 20px;'>We hope to serve you in the future.</p>
    <p style='color: #8b5e3b; text-align: center; font-size: 12px;'>Thank you for considering it's ouR Studio.</p>
</div>`;

// Upload Endpoint
app.post('/upload', upload.single('paymentProof'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const publicPath = `/POP/${req.file.filename}`;

    res.json({
        message: 'File uploaded successfully',
        path: publicPath
    });
});

// Gallery Upload Configuration
const galleryDir = path.join(__dirname, 'public', 'gallery-uploads');
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

const galleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, galleryDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

const galleryUpload = multer({
    storage: galleryStorage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit for higher quality
});

// Gallery Upload Endpoint
app.post('/upload/gallery', galleryUpload.single('galleryImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the path relative to the public directory
    // Note: Frontend should serve 'public' as root or alias /gallery-uploads
    const publicPath = `/gallery-uploads/${req.file.filename}`;

    res.json({
        message: 'Gallery image uploaded successfully',
        path: publicPath
    });
});

// Email Endpoint
app.post('/send-email', async (req, res) => {
    const { type, booking } = req.body;

    if (!type || !booking || !booking.email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let subject = '';
    let html = '';
    let attachments = [];

    switch (type) {
        case 'confirmed':
            subject = "Booking Confirmed - It's ouR Studio";
            html = getConfirmedEmail(booking);
            break;
        case 'received':
            subject = "Booking Received - It's ouR Studio";
            html = getReceivedEmail(booking);
            // Attach QR Code
            attachments.push({
                filename: 'payment_qr.png',
                path: path.join(__dirname, 'src', 'assets', 'payment_qr.png'),
                cid: 'gcash-qr'
            });
            break;
        case 'rejected':
            subject = "Booking Update - It's ouR Studio";
            html = getRejectedEmail(booking);
            break;
        default:
            return res.status(400).json({ error: 'Invalid email type' });
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: booking.email,
            subject: subject,
            html: html,
            attachments: attachments
        });
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
