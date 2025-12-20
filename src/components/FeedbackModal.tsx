import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sanitizeName, sanitizeText, sanitizeNumber } from '../utils/sanitize';
import './ModalStyles.css'; // Reusing modal styles

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Sanitize all inputs before storing
        const sanitizedName = sanitizeName(name, 50);
        const sanitizedMessage = sanitizeText(message, 500);
        const sanitizedRating = sanitizeNumber(rating, 1, 5, 5);

        if (!sanitizedName || !sanitizedMessage) {
            alert('Please provide a valid name and message.');
            setSubmitting(false);
            return;
        }

        try {
            await addDoc(collection(db, 'feedbacks'), {
                name: sanitizedName,
                rating: sanitizedRating,
                message: sanitizedMessage,
                showInTestimonials: false, // Default to hidden until approved
                createdAt: serverTimestamp()
            });

            alert('Thank you for your feedback!');
            setName('');
            setMessage('');
            setRating(5);
            onClose();
        } catch (error) {
            console.error("Error submitting feedback: ", error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal active">
            <div className="modal-content" style={{ maxWidth: '400px', padding: '2rem' }}>
                <button className="close-modal-btn" onClick={onClose} style={{
                    position: 'absolute',
                    right: '15px',
                    top: '15px',
                    fontSize: '1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                }}>&times;</button>

                <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Leave a Review</h3>
                <p style={{ marginBottom: '1.5rem' }}>We'd love to hear about your experience!</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label>Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label>Rating</label>
                        <div className="star-rating" style={{ display: 'flex', gap: '5px', fontSize: '1.5rem', cursor: 'pointer' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{ color: star <= rating ? '#FFD700' : '#ddd' }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label>Message</label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Share your experience..."
                            rows={4}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
