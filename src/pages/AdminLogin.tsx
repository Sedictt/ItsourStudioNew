import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Admin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Check Hardcoded Super Admin (Backdoor/Legacy)
            if ((password === 'admin123' || password === 'studio2024') && (!email || email === 'admin')) {
                sessionStorage.setItem('isAdmin', 'true');
                sessionStorage.setItem('userRole', 'admin');
                navigate('/admin');
                return;
            }

            // 2. Check Firestore Users
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('User not found');
                setIsLoading(false);
                return;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // Simple password check (In production, use hashing or Firebase Auth)
            if (userData.password === password) {
                if (userData.status !== 'active') {
                    setError('Account is inactive');
                    setIsLoading(false);
                    return;
                }

                sessionStorage.setItem('isAdmin', 'true');
                sessionStorage.setItem('userRole', userData.role);
                sessionStorage.setItem('userId', userDoc.id);
                navigate('/admin');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-login-card">
                <h2 className="admin-title" style={{ fontSize: '2rem' }}>Studio Access</h2>
                <p className="admin-subtitle" style={{ marginBottom: '1.5rem' }}>Login to manage operations</p>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Email / Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email or 'admin'"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    {error && <div style={{ color: '#c62828', fontSize: '0.9rem', textAlign: 'left', padding: '0.5rem', background: '#ffebee', borderRadius: '4px' }}>{error}</div>}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Login to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
