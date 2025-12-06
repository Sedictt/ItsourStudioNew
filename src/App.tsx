import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import EmailTest from './pages/EmailTest';

import { BookingProvider } from './context/BookingContext';
import BookingModal from './components/BookingModal';

function App() {
    return (
        <BookingProvider>
            <Router>
                <div className="app-container">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/email-test" element={<EmailTest />} />
                    </Routes>
                    <Footer />
                    <BookingModal />
                </div>
            </Router>
        </BookingProvider>
    );
}

export default App;
