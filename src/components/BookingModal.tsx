import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import paymentQr from '../assets/payment_qr.png';
import './ModalStyles.css';
import { useBooking } from '../context/BookingContext';

const PACKAGES = [
    { id: 'solo', name: 'Solo Package', price: 299, duration: 15 },
    { id: 'basic', name: 'Basic Package', price: 399, duration: 25 },
    { id: 'transfer', name: 'Just Transfer', price: 549, duration: 30 },
    { id: 'standard', name: 'Standard Package', price: 699, duration: 45 },
    { id: 'family', name: 'Family Package', price: 1249, duration: 50 },
    { id: 'barkada', name: 'Barkada Package', price: 1949, duration: 50 },
    { id: 'birthday', name: 'Birthday Package', price: 599, duration: 45 }
];

const EXTENSION_RATES = {
    0: 0,
    15: 150,
    30: 300,
    45: 450,
    60: 600
};

interface BookedSlot {
    start: number;
    end: number;
}

const BookingModal = () => {
    const { isBookingOpen, closeBooking, selectedPackageId } = useBooking();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        package: '',
        date: '',
        time: '',
        notes: '',
        extensionDuration: 0
    });
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookedRanges, setBookedRanges] = useState<BookedSlot[]>([]);

    // QOL States
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
        message: '',
        type: 'info',
        visible: false
    });

    // Auto-Scroll to top on step change
    useEffect(() => {
        const content = document.querySelector('.booking-content');
        if (content) {
            content.scrollTop = 0;
        }
    }, [step]);

    // Auto-Save Progress
    useEffect(() => {
        if (isBookingOpen) {
            const savedData = sessionStorage.getItem('bookingProgress');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setFormData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Failed to load saved progress", e);
                }
            }
        }
    }, [isBookingOpen]);

    useEffect(() => {
        if (isBookingOpen) {
            sessionStorage.setItem('bookingProgress', JSON.stringify(formData));
        }
    }, [formData, isBookingOpen]);

    // Initialize with selected package
    useEffect(() => {
        if (isBookingOpen) {
            if (selectedPackageId) {
                setFormData(prev => ({ ...prev, package: selectedPackageId }));
            }
            setStep(1);
        }
    }, [isBookingOpen, selectedPackageId]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isBookingOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isBookingOpen]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard!`, 'success');
    };

    const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    useEffect(() => {
        const fetchBookings = async () => {
            if (!formData.date) return;

            const q = query(
                collection(db, 'bookings'),
                where('date', '==', formData.date)
            );

            try {
                const querySnapshot = await getDocs(q);
                const ranges: BookedSlot[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.time && data.durationTotal) {
                        const start = timeToMinutes(data.time);
                        const end = start + data.durationTotal;
                        ranges.push({ start, end });
                    }
                });
                setBookedRanges(ranges);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };

        fetchBookings();
    }, [formData.date]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const re = /^[0-9\b]+$/;
            if (value === '' || (re.test(value) && value.length <= 11)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'extensionDuration' ? parseInt(value) : value
            }));
        }
    };

    const handleTimeSelect = (time: string) => {
        setFormData(prev => ({ ...prev, time }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                showToast('File size exceeds 10MB limit', 'error');
                return;
            }
            setPaymentFile(file);

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeFile = () => {
        setPaymentFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const generateTimeSlots = (dateString: string) => {
        if (!dateString) return [];

        const date = new Date(dateString);
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6;

        const startHour = isWeekend ? 9 : 10;
        const endHour = isWeekend ? 20 : 19;

        const slots = [];
        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    };

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':');
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    const selectedPackage = PACKAGES.find(p => p.id === formData.package);
    const basePrice = selectedPackage ? selectedPackage.price : 0;
    const extensionPrice = EXTENSION_RATES[formData.extensionDuration as keyof typeof EXTENSION_RATES] || 0;
    const totalPrice = basePrice + extensionPrice;
    const downpayment = Math.ceil(totalPrice * 0.5);
    const durationTotal = (selectedPackage ? selectedPackage.duration : 0) + formData.extensionDuration;

    const isSlotAvailable = (timeStr: string) => {
        if (!selectedPackage) return true;

        const proposedStart = timeToMinutes(timeStr);
        const proposedEnd = proposedStart + durationTotal;

        for (const range of bookedRanges) {
            if (proposedStart < range.end && proposedEnd > range.start) {
                return false;
            }
        }
        return true;
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            // Validate Step 1: Service
            if (!formData.package) {
                showToast("Please select a package.", 'error');
                return;
            }
            if (!formData.date) {
                showToast("Please select a date.", 'error');
                return;
            }
            if (!formData.time) {
                showToast("Please select a time slot.", 'error');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            // Validate Step 2: Contact
            if (!formData.fullName || !formData.email || !formData.phone) {
                showToast("Please fill in all required contact details.", 'error');
                return;
            }
            if (!formData.phone.startsWith('09') || formData.phone.length !== 11) {
                showToast("Please enter a valid PH phone number (starts with 09, 11 digits).", 'error');
                return;
            }
            setStep(3);
        }
    };

    const handleBackStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentFile) {
            showToast("Please upload your payment proof.", 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            let paymentProofUrl = '';
            if (paymentFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('paymentProof', paymentFile);

                const response = await fetch('http://localhost:3001/upload', {
                    method: 'POST',
                    body: formDataUpload
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                paymentProofUrl = data.path;
                console.log(`File uploaded to: ${paymentProofUrl}`);
            }

            await addDoc(collection(db, 'bookings'), {
                ...formData,
                totalPrice,
                downpayment,
                durationTotal,
                paymentProofUrl,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // Send Email Notification
            try {
                await fetch('http://localhost:3001/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'received',
                        booking: {
                            name: formData.fullName,
                            email: formData.email,
                            package: selectedPackage?.name || formData.package,
                            total_amount: totalPrice,
                            downpayment: downpayment,
                            date: formData.date,
                            time_start: formData.time ? formatTime(formData.time) : ''
                        }
                    })
                });
            } catch (emailError) {
                console.error("Failed to send email notification", emailError);
            }

            setIsSubmitting(false);
            setStep(4); // Move to Step 4 (Done)

            // Clear saved progress
            sessionStorage.removeItem('bookingProgress');

            setFormData({
                fullName: '',
                email: '',
                phone: '',
                package: '',
                date: '',
                time: '',
                notes: '',
                extensionDuration: 0
            });
            setPaymentFile(null);
            setPreviewUrl(null);

        } catch (error) {
            console.error("Error adding booking: ", error);
            setIsSubmitting(false);
            showToast("Something went wrong. Please try again.", 'error');
        }
    };

    const today = new Date().toISOString().split('T')[0];

    if (!isBookingOpen) return null;

    return (
        <div className="modal-overlay" onClick={closeBooking}>
            {/* Toast Notification */}
            {toast.visible && (
                <div className="toast-container">
                    <div className={`toast ${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                </div>
            )}

            <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={closeBooking}>&times;</button>

                <div className="booking-modal-header">
                    <div className="header-text">
                        <h2 className="section-title">Book Session</h2>
                    </div>

                    <div className="booking-stepper">
                        <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="step-circle">1</div>
                            <span className="step-label">Service</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                            <div className="step-circle">2</div>
                            <span className="step-label">Details</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                            <div className="step-circle">3</div>
                            <span className="step-label">Payment</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
                            <div className="step-circle">4</div>
                            <span className="step-label">Done</span>
                        </div>
                    </div>
                </div>

                {step === 4 ? (
                    <div className="booking-success-container">
                        <div className="success-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h3>Booking Request Received!</h3>
                        <p>We've received your booking request and payment proof.</p>
                        <p>A confirmation email has been sent to your inbox.</p>
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={() => { setStep(1); closeBooking(); }}>Close</button>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>Book Another Session</button>
                        </div>
                    </div>
                ) : (
                    <div className="booking-content wizard-layout">
                        <form onSubmit={step === 3 ? handleSubmit : handleNextStep} className="wizard-form">

                            {/* STEP 1: SERVICE SELECTION */}
                            {step === 1 && (
                                <div className="wizard-step fade-in">
                                    <div className="step-header">
                                        <h3 className="step-title">Select Your Experience</h3>
                                        <p className="step-subtitle">Choose a package that suits your needs</p>
                                    </div>

                                    <div className="packages-grid">
                                        {PACKAGES.map(pkg => (
                                            <div
                                                key={pkg.id}
                                                className={`package-card ${formData.package === pkg.id ? 'selected' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, package: pkg.id }))}
                                            >
                                                <div className="package-info">
                                                    <span className="package-name">{pkg.name}</span>
                                                    <span className="package-duration">{pkg.duration} mins</span>
                                                </div>
                                                <div className="package-price">₱{pkg.price}</div>
                                                {formData.package === pkg.id && (
                                                    <div className="check-icon">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="form-section-divider"></div>

                                    <div className="date-time-container">
                                        <div className="form-group date-group">
                                            <label htmlFor="date">Select Date</label>
                                            <div className="date-input-wrapper">
                                                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required min={today} />
                                                <span className="calendar-icon">📅</span>
                                            </div>
                                        </div>

                                        <div className="form-group extension-group">
                                            <label htmlFor="extensionDuration">Add Extra Time?</label>
                                            <select id="extensionDuration" name="extensionDuration" value={formData.extensionDuration} onChange={handleChange} className="modern-select">
                                                <option value="0">No extension</option>
                                                <option value="15">+15 mins (₱150)</option>
                                                <option value="30">+30 mins (₱300)</option>
                                                <option value="45">+45 mins (₱450)</option>
                                                <option value="60">+60 mins (₱600)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group time-selection-container">
                                        <label>Select Time Slot</label>
                                        {!formData.date ? (
                                            <div className="empty-state-box">
                                                <span className="icon">📅</span>
                                                <p>Please select a date above to see available slots</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="time-slot-grid">
                                                    {generateTimeSlots(formData.date).map(time => {
                                                        const available = isSlotAvailable(time);
                                                        const selected = formData.time === time;
                                                        return (
                                                            <button
                                                                key={time}
                                                                type="button"
                                                                className={`time-slot-btn ${selected ? 'selected' : ''} ${!available ? 'disabled' : ''}`}
                                                                onClick={() => available && handleTimeSelect(time)}
                                                                disabled={!available}
                                                            >
                                                                {formatTime(time)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="time-legend">
                                                    <div className="legend-item"><span className="dot available"></span> Available</div>
                                                    <div className="legend-item"><span className="dot selected"></span> Selected</div>
                                                    <div className="legend-item"><span className="dot booked"></span> Booked</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: CONTACT DETAILS */}
                            {step === 2 && (
                                <div className="wizard-step fade-in">
                                    <div className="step-header">
                                        <h3 className="step-title">Your Details</h3>
                                        <p className="step-subtitle">Please provide your contact information</p>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name</label>
                                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Juan Dela Cruz" />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="juan@example.com" />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone</label>
                                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="0917 123 4567" />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="notes">Notes (Optional)</label>
                                        <textarea id="notes" name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder="Any special requests?"></textarea>
                                    </div>

                                    <div className="booking-summary-mini">
                                        <div className="mini-row">
                                            <span>Selected:</span>
                                            <strong>{selectedPackage?.name} ({durationTotal} mins)</strong>
                                        </div>
                                        <div className="mini-row">
                                            <span>Date:</span>
                                            <strong>{formData.date} @ {formData.time ? formatTime(formData.time) : ''}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: PAYMENT */}
                            {step === 3 && (
                                <div className="wizard-step fade-in payment-step">
                                    <div className="step-header">
                                        <h3 className="step-title">Secure Payment</h3>
                                        <p className="step-subtitle">Complete your booking with a downpayment</p>
                                    </div>
                                    <div className="checkout-grid">
                                        {/* Left Column: Payment Method */}
                                        <div className="checkout-section payment-method">
                                            <div className="section-label">Payment Method</div>
                                            <div className="payment-card-hero">
                                                <div className="gcash-brand">
                                                    <span className="brand-name">GCash</span>
                                                    <span className="brand-tag">Official Merchant</span>
                                                </div>

                                                <div className="qr-hero">
                                                    <img src={paymentQr} alt="Scan to Pay" />
                                                </div>

                                                <div className="payment-details-hero">
                                                    <div className="detail-group">
                                                        <span className="label">Send to</span>
                                                        <div className="value-row">
                                                            <span className="value number">0917 123 4567</span>
                                                            <button type="button" className="copy-btn" onClick={() => copyToClipboard('09171234567', 'Number')}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="detail-group">
                                                        <span className="label">Amount Due</span>
                                                        <div className="value-row">
                                                            <span className="value amount">₱{downpayment}</span>
                                                            <button type="button" className="copy-btn" onClick={() => copyToClipboard(downpayment.toString(), 'Amount')}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Summary & Upload */}
                                        <div className="checkout-section summary-upload">
                                            <div className="booking-summary-box">
                                                <div className="section-label">Booking Summary</div>
                                                <div className="summary-list">
                                                    <div className="summary-row">
                                                        <span>Package</span>
                                                        <strong>{selectedPackage?.name}</strong>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span>Date & Time</span>
                                                        <strong>{formData.date} @ {formData.time ? formatTime(formData.time) : '-'}</strong>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span>Duration</span>
                                                        <strong>{durationTotal} mins</strong>
                                                    </div>
                                                    <div className="summary-divider"></div>
                                                    <div className="summary-row total">
                                                        <span>Total Price</span>
                                                        <strong>₱{totalPrice}</strong>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="upload-proof-box">
                                                <div className="section-label">Confirm Payment</div>

                                                {previewUrl ? (
                                                    <div className="preview-container">
                                                        <img src={previewUrl} alt="Payment Proof" className="preview-image" />
                                                        <button type="button" className="remove-preview-btn" onClick={removeFile}>
                                                            &times;
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="upload-dropzone">
                                                        <input type="file" id="paymentProof" name="paymentProof" accept="image/*" onChange={handleFileChange} required />
                                                        <div className="dropzone-content">
                                                            <div className="upload-prompt">
                                                                <div className="icon-upload">
                                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                                </div>
                                                                <span>Upload Screenshot</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="wizard-actions">
                                {step > 1 && (
                                    <button type="button" className="btn btn-secondary btn-lg" onClick={handleBackStep}>
                                        Back
                                    </button>
                                )}
                                <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processing...' : step === 3 ? 'Complete Booking' : 'Next Step'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
