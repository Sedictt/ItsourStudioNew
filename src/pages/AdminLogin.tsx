import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        // TODO: Replace with secure auth
        if (password === 'admin123' || password === 'studio2024') {
            sessionStorage.setItem('isAdmin', 'true');
            navigate('/admin');
        } else {
            setError('Invalid password');
        }
    };

    return (
        <div className="admin-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 0 }}>
            <div className="admin-login-card">
                <h2 className="admin-title" style={{ fontSize: '2rem' }}>Admin Access</h2>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                        />
                    </div>
                    {error && <div style={{ color: '#c62828', fontSize: '0.9rem', textAlign: 'left' }}>{error}</div>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        Login to Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
