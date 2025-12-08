import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import FeedbackModal from '../components/FeedbackModal';
import PromoSection from '../components/PromoSection';

interface Feedback {
    id: string;
    name: string;
    rating: number;
    message: string;
    showInTestimonials: boolean;
}

interface AboutContent {
    title: string;
    description1: string;
    description2: string;
    imageUrl: string;
}

const galleryItems = [
    { src: '/gallery/solo1.webp', category: 'Portrait', title: 'Solo Session' },
    { src: '/gallery/duo1.webp', category: 'Couple', title: 'Duo Shoot' },
    { src: '/gallery/group1.webp', category: 'Group', title: 'Barkada' },
    { src: '/gallery/solo2.webp', category: 'Portrait', title: 'Creative Solo' },
    { src: '/gallery/duo2.webp', category: 'Couple', title: 'Partner in Crime' },
    { src: '/gallery/group2.webp', category: 'Group', title: 'Squad Goals' },
    { src: '/gallery/solo3.webp', category: 'Portrait', title: 'Profile Update' },
    { src: '/gallery/duo3.webp', category: 'Couple', title: 'Anniversary' },
    { src: '/gallery/group3.webp', category: 'Group', title: 'Family Love' },
    { src: '/gallery/solo4.webp', category: 'Portrait', title: 'Self Love' },
    { src: '/gallery/duo4.webp', category: 'Couple', title: 'Besties' },
    { src: '/gallery/group4.webp', category: 'Group', title: 'Team Bonding' },
];

const Home = () => {
    const { openBooking } = useBooking();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [aboutContent, setAboutContent] = useState<AboutContent>({
        title: "About it's ouR Studio",
        description1: "Welcome to it's ouR Studio, where you're in complete control of your photography experience. Our state-of-the-art self-photography studio is designed to empower you to capture your authentic self in a comfortable, private environment.",
        description2: "Equipped with professional lighting, multiple backdrops, and an intuitive remote control system, our studio makes it easy for anyone to create stunning, professional-quality photos. Whether you need headshots for your career, content for social media, or simply want to celebrate yourself, we provide the perfect space and tools.",
        imageUrl: "/about-studio.jpg"
    });

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const docRef = doc(db, 'siteContent', 'about');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAboutContent(docSnap.data() as AboutContent);
                }
            } catch (err) {
                console.error("Error fetching about content:", err);
            }
        };
        fetchAbout();
    }, []);

    useEffect(() => {
        const q = query(
            collection(db, 'feedbacks'),
            where('showInTestimonials', '==', true),
            orderBy('createdAt', 'desc'),
            limit(3)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const feedbacksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Feedback[];
            setFeedbacks(feedbacksData);
        });

        return () => unsubscribe();
    }, []);

    // Hero Interaction Logic
    const heroRef = useRef<HTMLElement>(null);
    const handleHeroMouseMove = (e: React.MouseEvent) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        heroRef.current.style.setProperty('--mouse-x', `${x}%`);
        heroRef.current.style.setProperty('--mouse-y', `${y}%`);
    };

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentTranslate, setCurrentTranslate] = useState(0);
    const [prevTranslate, setPrevTranslate] = useState(0);

    // Animation state
    const trackRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const draggingRef = useRef(false); // To access fresh state in loop if needed, though strictly we use state for renders

    // Using a ref for currentTranslate to avoid closure staleness in the animation loop
    const translateRef = useRef(0);

    // Speed of auto-scroll (pixels per frame)
    const scrollSpeed = 0.5;

    const animationLoop = useCallback(() => {
        if (!draggingRef.current) {
            translateRef.current -= scrollSpeed;

            // Reset if we've scrolled past the first set of items
            // We need to know the width of the first set. 
            // Approximation: width of half the track.
            if (trackRef.current) {
                const trackWidth = trackRef.current.scrollWidth;
                const halfWidth = trackWidth / 2;

                if (Math.abs(translateRef.current) >= halfWidth) {
                    translateRef.current = 0;
                }
            }

            setCurrentTranslate(translateRef.current);
        }
        animationRef.current = requestAnimationFrame(animationLoop);
    }, []);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(animationLoop);
        return () => cancelAnimationFrame(animationRef.current);
    }, [animationLoop]);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        draggingRef.current = true;

        const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
        setStartX(pageX);

        // Only cancel animation loop if we want to purely manual drag. 
        // But for "pause and drag", we keep the loop running but conditionally update?
        // Actually, better to just pause the AUTOMATIC update.
        // We still need to update state during drag.
        cancelAnimationFrame(animationRef.current);

        setPrevTranslate(translateRef.current);
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;

        const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
        const currentPosition = pageX;
        const diff = currentPosition - startX;

        translateRef.current = prevTranslate + diff;
        setCurrentTranslate(translateRef.current);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        draggingRef.current = false;

        // Constrain bounds if needed, or simply let it flow back to loop?
        // To ensure infinite loop stability, we should probably check bounds here too.
        if (trackRef.current) {
            const trackWidth = trackRef.current.scrollWidth;
            const halfWidth = trackWidth / 2;
            // If dragged too far left
            if (Math.abs(translateRef.current) >= halfWidth) {
                translateRef.current = translateRef.current % halfWidth;
            }
            // If dragged too far right (positive)
            if (translateRef.current > 0) {
                translateRef.current = -halfWidth + translateRef.current;
            }
        }

        // Restart loop
        cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(animationLoop);
    };


    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);

        // Check for hash and scroll if needed
        if (window.location.hash) {
            const element = document.querySelector(window.location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section id="home" className="hero" ref={heroRef} onMouseMove={handleHeroMouseMove}>
                <div className="hero-background"></div>

                {/* Interactive Camera Interface */}
                <div className="camera-interface">
                    <div className="camera-grid"></div>
                    <div className="focus-rect">
                        <div className="focus-corner top-left"></div>
                        <div className="focus-corner top-right"></div>
                        <div className="focus-corner bottom-left"></div>
                        <div className="focus-corner bottom-right"></div>
                    </div>
                    <div className="camera-data top-left">ISO <span>800</span></div>
                    <div className="camera-data top-right">RAW</div>
                    <div className="camera-data bottom-left"><span>ƒ</span>/2.8</div>
                    <div className="camera-data bottom-right">1/250</div>
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-subtitle">Welcome to</span>
                        it's ouR Studio
                    </h1>
                    <p className="hero-description">Capture your authentic self in our premium self-photography studio</p>
                    <div className="hero-buttons">
                        <Link to="/gallery" className="btn btn-primary btn-large">View Gallery</Link>
                        <button className="btn btn-secondary btn-large" onClick={() => openBooking()}>Book Session</button>
                    </div>
                </div>
                <div className="scroll-indicator">
                    <span>Scroll to explore</span>
                    <div className="scroll-arrow"></div>
                </div>
            </section>

            {/* Gallery Preview Section */}
            <section id="gallery" className="gallery-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Moments</h2>
                        <p className="section-subtitle">A glimpse into our studio sessions</p>
                    </div>

                    <div
                        className="gallery-carousel-container"
                        onMouseDown={handleDragStart}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onMouseMove={handleDragMove}
                        onTouchStart={handleDragStart}
                        onTouchEnd={handleDragEnd}
                        onTouchMove={handleDragMove}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    >
                        <div
                            className="gallery-track"
                            ref={trackRef}
                            style={{
                                transform: `translateX(${currentTranslate}px)`,
                                animation: 'none', // Override CSS animation
                                width: 'max-content',
                                display: 'flex',
                                gap: 'var(--spacing-md)'
                            }}
                        >
                            {/* Render items twice for infinite scroll effect */}
                            {[...galleryItems, ...galleryItems].map((item, index) => (
                                <div className="gallery-card" key={index}>
                                    <div className="gallery-card-inner">
                                        <img src={item.src} alt={item.title} loading="lazy" draggable={false} />
                                        <div className="gallery-overlay">
                                            <div className="gallery-info">
                                                <div className="gallery-category">{item.category}</div>
                                                <div className="gallery-title">{item.title}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                        <Link to="/gallery" className="btn btn-primary btn-large">View Full Gallery</Link>
                    </div>
                </div>
            </section>

            <PromoSection />

            {/* Services Preview Section */}
            <section id="services" className="services-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Our Packages</h2>
                        <p className="section-subtitle">Simple pricing for everyone</p>
                    </div>

                    <div className="services-grid">
                        {/* Solo Package */}
                        <div className="service-card">
                            <div className="service-icon">👤</div>
                            <h3 className="service-title">Solo</h3>
                            <p className="service-duration">15 Minutes</p>
                            <div className="service-price">₱299</div>
                            <p className="service-description">Perfect for a quick profile update or self-portrait session.</p>
                            <ul className="service-features">
                                <li>1 Person</li>
                                <li>10 min shoot + 5 min selection</li>
                                <li>1 Background selection</li>
                                <li>10 Raw soft copies</li>
                                <li>1 4R print</li>
                            </ul>
                            <button className="btn btn-outline" onClick={() => openBooking('solo')}>Book Now</button>
                        </div>

                        {/* Basic Package (Best Selling) */}
                        <div className="service-card featured">
                            <div className="featured-badge">Best Selling</div>
                            <div className="service-icon">✨</div>
                            <h3 className="service-title">Basic</h3>
                            <p className="service-duration">25 Minutes</p>
                            <div className="service-price">₱399</div>
                            <p className="service-description">Our most popular choice for couples and duos.</p>
                            <ul className="service-features">
                                <li>1-2 People</li>
                                <li>15 min shoot + 10 min selection</li>
                                <li>1 Background selection</li>
                                <li>15 Raw soft copies</li>
                                <li>2 strips print</li>
                                <li>Free use of props & wardrobe</li>
                            </ul>
                            <button className="btn btn-secondary" onClick={() => openBooking('basic')}>Book Now</button>
                        </div>

                        {/* Barkada Package */}
                        <div className="service-card">
                            <div className="service-icon">🎉</div>
                            <h3 className="service-title">Barkada</h3>
                            <p className="service-duration">50 Minutes</p>
                            <div className="service-price">₱1,949</div>
                            <p className="service-description">The ultimate group experience for friends and family.</p>
                            <ul className="service-features">
                                <li>Up to 8 People</li>
                                <li>30 min shoot + 20 min selection</li>
                                <li>1 Background selection</li>
                                <li>Soft copies of all raw photos</li>
                                <li>8 strips print</li>
                                <li>2 A5 prints & 2 4R prints</li>
                            </ul>
                            <button className="btn btn-outline" onClick={() => openBooking('barkada')}>Book Now</button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                        <Link to="/services" className="btn btn-primary btn-large">See All Services</Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Happy Faces</h2>
                        <p className="section-subtitle">Stories from our studio</p>
                    </div>

                    <div className="testimonials-grid">
                        {feedbacks.length > 0 ? (
                            feedbacks.map((feedback) => (
                                <div className="testimonial-card" key={feedback.id}>
                                    <div className="stars">{'★'.repeat(feedback.rating)}</div>
                                    <p className="testimonial-quote">{feedback.message}</p>
                                    <div className="testimonial-author">
                                        <div className="author-avatar">{feedback.name.charAt(0)}</div>
                                        <div className="author-info">
                                            <h4>{feedback.name}</h4>
                                            <span className="author-role">Verified Customer</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="testimonial-card" style={{ gridColumn: '1 / -1', textAlign: 'center', display: 'block' }}>
                                <p className="testimonial-quote" style={{ fontStyle: 'normal' }}>Be the first to share your experience!</p>
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                        <button className="btn btn-primary" onClick={() => setIsFeedbackOpen(true)}>Leave a Review</button>
                    </div>
                </div>
            </section>

            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="container">
                    <div className="about-content">
                        <div className="about-image">
                            <div className="about-image-wrapper">
                                <img src={aboutContent.imageUrl} alt="it's ouR Studio Photography Studio" id="aboutImage" />
                            </div>
                        </div>
                        <div className="about-text">
                            <h2 className="section-title">{aboutContent.title}</h2>
                            <p className="about-description">
                                {aboutContent.description1}
                            </p>
                            <p className="about-description">
                                {aboutContent.description2}
                            </p>
                            <div className="about-features">
                                <div className="about-feature">
                                    <div className="feature-icon">📷</div>
                                    <div className="feature-text">
                                        <h4>Professional Equipment</h4>
                                        <p>High-end cameras and lighting setup</p>
                                    </div>
                                </div>
                                <div className="about-feature">
                                    <div className="feature-icon">🎨</div>
                                    <div className="feature-text">
                                        <h4>Creative Freedom</h4>
                                        <p>Multiple backdrops and props available</p>
                                    </div>
                                </div>
                                <div className="about-feature">
                                    <div className="feature-icon">🔒</div>
                                    <div className="feature-text">
                                        <h4>Private Sessions</h4>
                                        <p>Completely private studio time</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
