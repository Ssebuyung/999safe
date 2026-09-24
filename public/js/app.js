const { useState, useEffect, useRef } = React;

// Import auth functions (will be available globally)
let authModule = {};
if (typeof window !== 'undefined') {
    // Auth functions will be loaded as module
}

// Main App Router Component
function App() {
    const [currentView, setCurrentView] = useState('landing'); // landing, auth, dashboard
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [user, setUser] = useState(null);
    const [groupSuggestion, setGroupSuggestion] = useState(null);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Always prioritize showing Terms first if not accepted yet
        const termsAccepted = localStorage.getItem('termsAccepted');
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme);

        if (termsAccepted === 'true') {
            setAcceptedTerms(true);
            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
                setCurrentView('dashboard');
            } else {
                setCurrentView('auth');
            }
        } else {
            setCurrentView('landing');
        }
    }, []);

    const handleAcceptTerms = () => {
        setAcceptedTerms(true);
        localStorage.setItem('termsAccepted', 'true');
        setCurrentView('auth');
    };

    const handleAuthSuccess = (userData, suggestion = null) => {
        setUser(userData);
        setGroupSuggestion(suggestion);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCurrentView('landing');
        setAcceptedTerms(false);
        localStorage.removeItem('termsAccepted');
    };

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem('theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    if (currentView === 'landing') {
        return <LandingPage onAcceptTerms={handleAcceptTerms} />;
    }

    if (currentView === 'auth') {
        return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    }

    if (currentView === 'dashboard') {
        // Ensure user is authenticated before showing dashboard
        if (!user || !user.id) {
            // Redirect to landing if not authenticated
            return <LandingPage onAcceptTerms={handleAcceptTerms} />;
        }
        return <SafeRouteApp user={user} onLogout={handleLogout} groupSuggestion={groupSuggestion} clearSuggestion={() => setGroupSuggestion(null)} theme={theme} onToggleTheme={toggleTheme} />;
    }

    return <LandingPage onAcceptTerms={handleAcceptTerms} />;
}

// Landing Page Component (WhatsApp style)
function LandingPage({ onAcceptTerms }) {
    const [showTerms, setShowTerms] = useState(true);
    const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
    const termsScrollRef = useRef(null);

    const handleTermsScroll = () => {
        const el = termsScrollRef.current;
        if (!el) return;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
        if (atBottom && !hasScrolledToEnd) {
            setHasScrolledToEnd(true);
        }
    };

    return (
        <div className="landing-page">
            <div className="landing-container">
                <div className="landing-logo-section">
                    <div className="landing-logo">
                        <div className="landing-logo-icon">
                            <span className="landing-logo-number">999</span>
                            <i className="fas fa-shield-alt"></i>
                        </div>
                    </div>
                    <h1 className="landing-title">SAFE999</h1>
                    <p className="landing-subtitle">Kira Municipality</p>
                    <p className="landing-tagline">Street-Level Crisis Coordination Platform</p>
                </div>

                <div className="terms-section">
                    <div className="terms-header">
                        <h2>Terms and Conditions</h2>
                        <button 
                            className="terms-toggle-btn"
                            onClick={() => setShowTerms(!showTerms)}
                        >
                            <i className={`fas fa-chevron-${showTerms ? 'up' : 'down'}`}></i>
                        </button>
                    </div>
                    
                    <div className={`terms-content ${showTerms ? 'expanded' : ''}`}>
                        <div 
                            className="terms-scroll"
                            ref={termsScrollRef}
                            onScroll={handleTermsScroll}
                        >
                            <TermsAndConditions />
                        </div>
                    </div>
                </div>

                <div className="landing-actions">
                    <button 
                        className="accept-btn"
                        onClick={onAcceptTerms}
                        disabled={!hasScrolledToEnd}
                    >
                        <i className="fas fa-check-circle"></i>
                        I Agree to Terms & Conditions
                    </button>
                    <p className="terms-note">
                        {hasScrolledToEnd ? 'Click agree to proceed' : 'Scroll to the bottom and accept to continue'}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Terms and Conditions Component
function TermsAndConditions() {
    return (
        <div className="terms-text">
            <h3>SAFE999 Kira - Terms and Conditions</h3>
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            
            <section>
                <h4>1. Acceptance of Terms</h4>
                <p>By accessing and using SAFE999 Kira, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use this platform.</p>
            </section>

            <section>
                <h4>2. Platform Purpose</h4>
                <p>SAFE999 Kira is a hyper-local crisis coordination platform designed for Kira Municipality, Wakiso District, Uganda. It enables residents and stakeholders to report, verify, and coordinate responses to emergency incidents.</p>
            </section>

            <section>
                <h4>3. User Accounts</h4>
                <p>Users must create an account to submit reports or verify incidents. You are responsible for maintaining the confidentiality of your account credentials.</p>
            </section>

            <section>
                <h4>4. User Responsibilities</h4>
                <ul>
                    <li>Provide accurate and truthful information when reporting incidents</li>
                    <li>Do not submit false or misleading reports</li>
                    <li>Respect the privacy and safety of others</li>
                    <li>Use the platform only for legitimate emergency coordination purposes</li>
                    <li>Do not abuse the verification system</li>
                </ul>
            </section>

            <section>
                <h4>5. Trust Score System</h4>
                <p>Your trust score is based on report accuracy, community verification, and responsible use of the platform. False reports may result in a reduced trust score or account suspension.</p>
            </section>

            <section>
                <h4>6. Incident Reporting</h4>
                <p>When reporting incidents, you must:</p>
                <ul>
                    <li>Provide accurate location information</li>
                    <li>Select the appropriate incident type and severity</li>
                    <li>Include relevant details without compromising safety</li>
                    <li>Only report incidents that are currently happening or just occurred</li>
                </ul>
            </section>

            <section>
                <h4>7. Verification System</h4>
                <p>Low-trust reports require verification from 3+ verified users before appearing publicly. High-trust users can validate incidents instantly. Do not verify incidents you have not personally confirmed.</p>
            </section>

            <section>
                <h4>8. Privacy and Data</h4>
                <p>We collect and store your account information, incident reports, and location data. This information is used to provide the service and may be shared with local authorities during emergencies. Your personal information is protected according to applicable data protection laws.</p>
            </section>

            <section>
                <h4>9. Limitation of Liability</h4>
                <p>SAFE999 Kira is provided "as is" without warranties. We are not liable for any damages resulting from use of the platform, including but not limited to incorrect information, system failures, or delays in emergency response.</p>
            </section>

            <section>
                <h4>10. Emergency Services</h4>
                <p>This platform is a coordination tool and does not replace official emergency services. In life-threatening situations, always call official emergency numbers (999) immediately.</p>
            </section>

            <section>
                <h4>11. Account Termination</h4>
                <p>We reserve the right to suspend or terminate accounts that violate these terms, submit false reports, or engage in abusive behavior.</p>
            </section>

            <section>
                <h4>12. Changes to Terms</h4>
                <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
                <h4>13. Contact</h4>
                <p>For questions about these terms, contact the SAFE999 Kira administration team.</p>
            </section>

            <section>
                <h4>14. Governing Law</h4>
                <p>These terms are governed by the laws of Uganda. Any disputes will be resolved in the courts of Uganda.</p>
            </section>
        </div>
    );
}

// Auth Page Component (Registration/Login)
function AuthPage({ onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        age: '',
        phone: '',
        userType: 'resident',
        neighborhood: 'Nakwero'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                });

                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    setError(`Login failed: ${response.statusText || 'Server error'}`);
                    setLoading(false);
                    return;
                }
                
                if (!response.ok) {
                    // Handle HTTP errors
                    setError(data.message || `Login failed: ${response.statusText}`);
                    setLoading(false);
                    return;
                }
                
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    onAuthSuccess(data.user, data.groupSuggestion || null);
                } else {
                    setError(data.message || 'Login failed');
                }
            } else {
                // Register
                if (formData.password !== formData.passwordConfirm) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }

                // Format phone number with +256 prefix
                const phoneNumber = formData.phone ? `+256${formData.phone}` : '';

                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        passwordConfirm: formData.passwordConfirm,
                        age: formData.age ? Number(formData.age) : undefined,
                        phone: phoneNumber,
                        userType: formData.userType,
                        neighborhood: formData.neighborhood,
                        acceptedTerms: true
                    })
                });

                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    setError(`Registration failed: ${response.statusText || 'Server error'}`);
                    setLoading(false);
                    return;
                }
                
                if (!response.ok) {
                    // Handle HTTP errors
                    setError(data.message || `Registration failed: ${response.statusText}`);
                    setLoading(false);
                    return;
                }
                
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    onAuthSuccess(data.user, data.groupSuggestion || null);
                } else {
                    setError(data.message || 'Registration failed');
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <span className="auth-logo-number">999</span>
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <h2>SAFE999 Kira</h2>
                </div>

                <div className="auth-tabs">
                    <button 
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button 
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Create Account
                    </button>
                </div>

                {error && (
                    <div className="auth-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.age}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        // allow empty or 0-150
                                        if (v === '' || (Number(v) >= 0 && Number(v) <= 150)) {
                                            setFormData({ ...formData, age: v });
                                        }
                                    }}
                                    min={0}
                                    max={150}
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">User Type *</label>
                                <select
                                    className="form-select"
                                    value={formData.userType}
                                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                                    required
                                >
                                    <option value="resident">Resident</option>
                                    <option value="stakeholder">Stakeholder (Authority/Organization)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Resident place of stay *</label>
                                <select
                                    className="form-select"
                                    value={formData.neighborhood}
                                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                    required
                                >
                                    <option value="Nakwero">Nakwero</option>
                                    <option value="Kira Town">Kira Town</option>
                                    <option value="Bweyogerere">Bweyogerere</option>
                                    <option value="Najjera">Najjera</option>
                                    <option value="Kisasi">Kisasi</option>
                                    <option value="Kiwatule">Kiwatule</option>
                                    <option value="Namugongo">Namugongo</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="phone-input-wrapper">
                                    <span className="phone-prefix">+256</span>
                                    <input
                                        type="tel"
                                        className="form-input phone-input"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            // Only allow numbers, max 9 digits
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                            setFormData({...formData, phone: value});
                                        }}
                                        placeholder="7XX XXX XXX"
                                        maxLength={9}
                                    />
                                </div>
                                <small className="form-hint">Enter your phone number without the country code</small>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            minLength={6}
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Confirm Password *</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.passwordConfirm}
                                onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Processing...
                            </>
                        ) : (
                            <>
                                {isLogin ? 'Login' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Main App Component (Dashboard - renamed from SafeRouteApp)
function SafeRouteApp({ user, onLogout, groupSuggestion, clearSuggestion, theme, onToggleTheme }) {
    const [incidents, setIncidents] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [currentUser, setCurrentUser] = useState(user || { name: 'User', trustScore: user?.trustScore || 50 });
    const [mapFilter, setMapFilter] = useState('all');
    const [alerts, setAlerts] = useState([]);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [groupActionLoading, setGroupActionLoading] = useState(false);
    const [groupActionError, setGroupActionError] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [hiddenIncidentIds, setHiddenIncidentIds] = useState(new Set());
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    const hiddenStorageKey = currentUser && currentUser.id ? `hiddenIncidents:${currentUser.id}` : null;
    const loadHidden = () => {
        try {
            if (!hiddenStorageKey) return;
            const raw = localStorage.getItem(hiddenStorageKey);
            if (raw) {
                const arr = JSON.parse(raw);
                setHiddenIncidentIds(new Set(arr));
            }
        } catch (_) {}
    };
    const persistHidden = (setObj) => {
        try {
            if (!hiddenStorageKey) return;
            localStorage.setItem(hiddenStorageKey, JSON.stringify(Array.from(setObj)));
        } catch (_) {}
    };
    const hideIncident = (id) => {
        setHiddenIncidentIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            persistHidden(next);
            return next;
        });
    };

    // Initialize map
    useEffect(() => {
        loadHidden();
        if (!mapInstanceRef.current) {
            // Default to Kira Municipality, Wakiso District, Uganda
            const defaultLat = 0.4170;  // Kira Municipality coordinates
            const defaultLng = 32.5344;
            
            mapInstanceRef.current = L.map('map').setView([defaultLat, defaultLng], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);

            // Add click handler for reporting
            mapInstanceRef.current.on('click', (e) => {
                if (showReportModal) {
                    // Update location in report form
                    const event = new CustomEvent('mapLocationSelected', {
                        detail: { lat: e.latlng.lat, lng: e.latlng.lng }
                    });
                    window.dispatchEvent(event);
                }
            });
        }

        // Load incidents from backend
        loadIncidents();
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    // Update map markers when incidents change
    useEffect(() => {
        if (mapInstanceRef.current && incidents.length > 0) {
            // Clear existing markers
            mapInstanceRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    mapInstanceRef.current.removeLayer(layer);
                }
            });

            // Add markers for verified incidents only
            incidents.forEach(incident => {
                if (incident.verified && !hiddenIncidentIds.has(incident.id) && (mapFilter === 'all' || incident.severity === mapFilter)) {
                    const marker = L.marker([incident.lat, incident.lng], {
                        icon: getMarkerIcon(incident.severity)
                    }).addTo(mapInstanceRef.current);

                    marker.bindPopup(createPopupContent(incident));
                }
            });
        }
    }, [incidents, mapFilter, hiddenIncidentIds]);

    const loadIncidents = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch('/api/incidents', {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) throw new Error(data.message || 'Failed to load incidents');
            const mapped = (data.incidents || []).map((saved, idx) => ({
                id: saved._id || (idx + 1),
                type: saved.type,
                severity: saved.severity,
                location: 'Reported location',
                lat: saved.lat,
                lng: saved.lng,
                time: new Date(saved.createdAt).toLocaleString(),
                verified: !!saved.verified,
                reports: saved.reports || 1,
                description: saved.description || '',
                reportedBy: saved.reportedBy
            }));
            setIncidents(mapped);
        } catch (_) {
            // keep existing incidents
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const resp = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) return;
            setNotifications(data.notifications || []);
        } catch (_) {}
    };

    useEffect(() => {
        fetchNotifications();
        const id = setInterval(fetchNotifications, 30000);
        return () => clearInterval(id);
    }, []);

    const toggleNotifications = async () => {
        const next = !notifOpen;
        setNotifOpen(next);
        if (next) {
            // mark unread as read
            try {
                const unread = (notifications || []).filter(n => !n.read).map(n => n._id);
                if (unread.length > 0) {
                    const token = localStorage.getItem('token');
                    await fetch('/api/notifications/read', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ ids: unread })
                    });
                    // refresh
                    fetchNotifications();
                }
            } catch (_) {}
        }
    };

    const handleVerifyFromNotification = async (incidentId) => {
        await window.verifyIncident(incidentId);
        await loadIncidents();
        await fetchNotifications();
    };

    const getMarkerIcon = (severity) => {
        const colors = {
            high: '#dc2626',
            medium: '#f59e0b',
            low: '#10b981'
        };
        
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 24px;
                height: 24px;
                background: ${colors[severity]};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [24, 24]
        });
    };

    const createPopupContent = (incident) => {
        return `
            <div class="incident-popup">
                <div class="popup-header">
                    <span class="popup-type">${incident.type}</span>
                    ${incident.verified ? '<i class="fas fa-check-circle" style="color: #10b981;"></i>' : ''}
                </div>
                <p style="margin: 0.5rem 0; font-size: 0.875rem;">${incident.location}</p>
                <p style="margin: 0.5rem 0; font-size: 0.75rem; color: #64748b;">${incident.description}</p>
                <div class="popup-actions">
                    ${incident.verified ? '' : `<button class="popup-btn" onclick="window.verifyIncident(${incident.id})">
                        <i class="fas fa-check"></i> Verify
                    </button>`}
                    <button class="popup-btn" onclick="window.viewDetails(${incident.id})">
                        <i class="fas fa-info"></i> Details
                    </button>
                </div>
            </div>
        `;
    };

    const handleReportIncident = async (reportData) => {
        // Check if user is authenticated
        if (!currentUser || !currentUser.id) {
            showAlert('You must be logged in to report incidents', 'warning');
            setShowReportModal(false);
            return;
        }

        // Try to persist to backend (so group members get notified)
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch('/api/incidents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    type: reportData.type,
                    severity: reportData.severity,
                    description: reportData.description,
                    lat: reportData.lat,
                    lng: reportData.lng,
                    imageData: reportData.imageData || null
                })
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || 'Failed to submit incident');
            }

            const saved = data.incident;
            const mappedIncident = {
                id: saved._id || (incidents.length + 1),
                type: saved.type,
                severity: saved.severity,
                location: reportData.location || 'Reported location',
                lat: saved.lat,
                lng: saved.lng,
                time: 'Just now',
                verified: saved.verified,
                reports: saved.reports || 1,
                description: saved.description || '',
                reportedBy: saved.reportedBy
            };
            setIncidents([...incidents, mappedIncident]);
            setShowReportModal(false);
            showAlert('Incident reported successfully! Group members were notified.', 'info');
        } catch (e) {
            // Fallback to client-only behavior if API fails
            const newIncident = {
                id: incidents.length + 1,
                ...reportData,
                time: 'Just now',
                verified: currentUser.trustScore >= 80,
                reports: 1,
                reportedBy: currentUser.id,
                reporterName: currentUser.name
            };
            setIncidents([...incidents, newIncident]);
            setShowReportModal(false);
            showAlert('Incident reported locally. (Server unavailable)', 'warning');
        }
    };

    const showAlert = (message, type = 'info') => {
        const alert = { id: Date.now(), message, type };
        setAlerts([...alerts, alert]);
        setTimeout(() => {
            setAlerts(alerts.filter(a => a.id !== alert.id));
        }, 5000);
    };

    const joinNeighborhoodGroup = async () => {
        if (!groupSuggestion || groupSuggestion.action !== 'join') return;
        setGroupActionError('');
        setGroupActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch('/api/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ neighborhood: groupSuggestion.neighborhood })
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || 'Failed to join group');
            }
            showAlert(`Joined ${data.group.name}`, 'info');
            clearSuggestion && clearSuggestion();
        } catch (e) {
            setGroupActionError(e.message);
        } finally {
            setGroupActionLoading(false);
        }
    };

    const createNeighborhoodGroup = async () => {
        if (!groupSuggestion || groupSuggestion.action !== 'create') return;
        setGroupActionError('');
        setGroupActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch('/api/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ neighborhood: groupSuggestion.neighborhood, name: groupSuggestion.name })
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || 'Failed to create group');
            }
            showAlert(`Created ${data.group.name}`, 'info');
            clearSuggestion && clearSuggestion();
        } catch (e) {
            setGroupActionError(e.message);
        } finally {
            setGroupActionLoading(false);
        }
    };

    // Make functions available globally for popup buttons
    window.verifyIncident = async (id) => {
        // Check if user is authenticated
        if (!currentUser || !currentUser.id) {
            showAlert('You must be logged in to verify incidents', 'warning');
            return;
        }

        const target = incidents.find(inc => inc.id === id);
        if (target && target.reportedBy && String(target.reportedBy) === String(currentUser.id)) {
            showAlert('You cannot verify your own report', 'warning');
            return;
        }

        const proceed = window.confirm('Are you sure this incident is really occurring? Only verify if you have confirmed it.');
        if (!proceed) return;

        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`/api/incidents/${id}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) {
                throw new Error(data.message || 'Failed to verify incident');
            }
            const updated = data.incident;
            setIncidents(incidents.map(inc => 
                inc.id === id ? { ...inc, verified: !!updated.verified } : inc
            ));
            // Hide for this user after verifying (client + server persist)
            hideIncident(id);
            try {
                const token3 = localStorage.getItem('token');
                await fetch(`/api/incidents/${id}/hide`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(token3 ? { 'Authorization': `Bearer ${token3}` } : {}) }
                });
            } catch (_) {}
            // Clear any notifications for this incident for this user
            try {
                const related = (notifications || []).filter(n => n.incident && (n.incident._id === id || n.incident === id)).map(n => n._id);
                if (related.length > 0) {
                    const token2 = localStorage.getItem('token');
                    await fetch('/api/notifications/read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...(token2 ? { 'Authorization': `Bearer ${token2}` } : {}) },
                        body: JSON.stringify({ ids: related })
                    });
                    setNotifications((prev) => prev.filter(n => !related.includes(n._id)));
                }
            } catch (_) {}
            showAlert(updated.verified ? 'Incident is now Active (verified threshold reached).' : 'Your verification was recorded.', 'info');
        } catch (e) {
            showAlert(e.message || 'Verification failed', 'danger');
        }
    };

    window.viewDetails = (id) => {
        const incident = incidents.find(inc => inc.id === id);
        setSelectedIncident(incident);
    };

    return (
        <div>
            <Header 
                user={currentUser} 
                onLogout={onLogout} 
                theme={theme} 
                onToggleTheme={onToggleTheme}
                notifications={notifications}
                onToggleNotifications={toggleNotifications}
                notifOpen={notifOpen}
                onShowTerms={() => setShowTermsModal(true)}
            />
            {isMobile ? (
                <div style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ minWidth: '100vw', scrollSnapAlign: 'start' }}>
                        <div className="map-container">
                            <div id="map" style={{ height: '60vh' }}></div>
                            <div className="map-controls">
                                <button className={`map-btn ${mapFilter === 'all' ? 'active' : ''}`} onClick={() => setMapFilter('all')} title="Show All"><i className="fas fa-layer-group"></i></button>
                                <button className={`map-btn ${mapFilter === 'high' ? 'active' : ''}`} onClick={() => setMapFilter('high')} title="High Priority"><i className="fas fa-exclamation-triangle"></i></button>
                                <button className={`map-btn ${mapFilter === 'medium' ? 'active' : ''}`} onClick={() => setMapFilter('medium')} title="Medium Priority"><i className="fas fa-exclamation-circle"></i></button>
                                <button className={`map-btn ${mapFilter === 'low' ? 'active' : ''}`} onClick={() => setMapFilter('low')} title="Low Priority"><i className="fas fa-info-circle"></i></button>
                            </div>
                        </div>
                    </div>
                    <div style={{ minWidth: '100vw', scrollSnapAlign: 'start', padding: '0 1rem' }}>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-map-marker-alt"></i>Active Incidents</h2>
                                <span className="report-count">{incidents.filter(i => i.verified).length}</span>
                            </div>
                            <IncidentList incidents={incidents.filter(i => i.verified && !hiddenIncidentIds.has(i.id))} onSelect={setSelectedIncident} />
                        </div>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-hourglass-half"></i>Pending Verification</h2>
                                <span className="report-count">{incidents.filter(i => !i.verified).length}</span>
                            </div>
                            <IncidentList incidents={incidents.filter(i => !i.verified && !hiddenIncidentIds.has(i.id))} onSelect={setSelectedIncident} />
                        </div>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-route"></i>Safe Routes</h2>
                            </div>
                            <SafeRoutePanel />
                        </div>
                    </div>
                    <div style={{ minWidth: '100vw', scrollSnapAlign: 'start', padding: '0 1rem' }}>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-map-marked-alt"></i>Neighborhood Coordination</h2>
                            </div>
                            <NeighborhoodPanel />
                        </div>
                    </div>
                    <div style={{ minWidth: '100vw', scrollSnapAlign: 'start', padding: '0 1rem 5rem' }}>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-users"></i>Community</h2>
                            </div>
                            <CommunityPanel user={currentUser} />
                        </div>
                        <button 
                            className="report-btn"
                            onClick={() => {
                                if (!currentUser || !currentUser.id) {
                                    showAlert('Please log in to report incidents', 'warning');
                                    return;
                                }
                                setShowReportModal(true);
                            }}
                        >
                            <i className="fas fa-plus-circle"></i>
                            Report Incident
                        </button>
                    </div>
                </div>
            ) : (
                <div className="main-container">
                    {groupSuggestion && (
                        <div style={{
                            background: '#eff6ff',
                            border: '1px solid #93c5fd',
                            color: '#1e3a8a',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            margin: '0.75rem 1rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <div>
                                    <strong>Safety Group Suggestion</strong><br />
                                    {groupSuggestion.action === 'join' ? (
                                        <span>
                                            A safety group exists for {groupSuggestion.neighborhood}. Join "{groupSuggestion.name}" to get alerts and help verify incidents.
                                        </span>
                                    ) : (
                                        <span>
                                            Be the first to create the {groupSuggestion.neighborhood} Safety Group to coordinate verifications and alerts.
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {groupSuggestion.action === 'join' ? (
                                        <button className="btn btn-primary" onClick={joinNeighborhoodGroup} disabled={groupActionLoading}>
                                            {groupActionLoading ? 'Joining...' : 'Join Group'}
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary" onClick={createNeighborhoodGroup} disabled={groupActionLoading}>
                                            {groupActionLoading ? 'Creating...' : 'Create Group'}
                                        </button>
                                    )}
                                    <button className="btn btn-secondary" onClick={clearSuggestion} disabled={groupActionLoading}>Dismiss</button>
                                </div>
                            </div>
                            {groupActionError && (
                                <div style={{ color: '#b91c1c', marginTop: '0.5rem' }}>
                                    <i className="fas fa-exclamation-triangle"></i> {groupActionError}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="map-container">
                        <div id="map"></div>
                        <div className="map-controls">
                            <button className={`map-btn ${mapFilter === 'all' ? 'active' : ''}`} onClick={() => setMapFilter('all')} title="Show All"><i className="fas fa-layer-group"></i></button>
                            <button className={`map-btn ${mapFilter === 'high' ? 'active' : ''}`} onClick={() => setMapFilter('high')} title="High Priority"><i className="fas fa-exclamation-triangle"></i></button>
                            <button className={`map-btn ${mapFilter === 'medium' ? 'active' : ''}`} onClick={() => setMapFilter('medium')} title="Medium Priority"><i className="fas fa-exclamation-circle"></i></button>
                            <button className={`map-btn ${mapFilter === 'low' ? 'active' : ''}`} onClick={() => setMapFilter('low')} title="Low Priority"><i className="fas fa-info-circle"></i></button>
                        </div>
                    </div>
                    
                    <div className="sidebar">
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-map-marker-alt"></i>Active Incidents</h2>
                                <span className="report-count">{incidents.filter(i => i.verified).length}</span>
                            </div>
                            <IncidentList incidents={incidents.filter(i => i.verified && !hiddenIncidentIds.has(i.id))} onSelect={setSelectedIncident} />
                        </div>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-hourglass-half"></i>Pending Verification</h2>
                                <span className="report-count">{incidents.filter(i => !i.verified).length}</span>
                            </div>
                            <IncidentList incidents={incidents.filter(i => !i.verified && !hiddenIncidentIds.has(i.id))} onSelect={setSelectedIncident} />
                        </div>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-route"></i>Safe Routes</h2>
                            </div>
                            <SafeRoutePanel />
                        </div>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-map-marked-alt"></i>Neighborhood Coordination</h2>
                            </div>
                            <NeighborhoodPanel />
                        </div>
                        <div className="sidebar-section">
                            <div className="section-header">
                                <h2 className="section-title"><i className="fas fa-users"></i>Community</h2>
                            </div>
                            <CommunityPanel user={currentUser} />
                        </div>
                        <button 
                            className="report-btn"
                            onClick={() => {
                                if (!currentUser || !currentUser.id) {
                                    showAlert('Please log in to report incidents', 'warning');
                                    return;
                                }
                                setShowReportModal(true);
                            }}
                        >
                            <i className="fas fa-plus-circle"></i>
                            Report Incident
                        </button>
                    </div>
                </div>
            )}

            {showReportModal && (
                <ReportModal
                    onClose={() => setShowReportModal(false)}
                    onSubmit={handleReportIncident}
                    user={currentUser}
                    mapInstance={mapInstanceRef.current}
                />
            )}

            {selectedIncident && (
                <IncidentDetailModal
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                    user={currentUser}
                />
            )}

            {notifOpen && (
                <NotificationsDropdown 
                    notifications={notifications}
                    onClose={() => setNotifOpen(false)}
                    onVerify={handleVerifyFromNotification}
                    onDismiss={async (nid, incidentId) => {
                        try {
                            const token = localStorage.getItem('token');
                            await fetch('/api/notifications/read', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                                body: JSON.stringify({ ids: [nid] })
                            });
                        } catch (_) {}
                        setNotifications((prev) => prev.filter(n => n._id !== nid));
                        if (incidentId) {
                            hideIncident(incidentId);
                            try {
                                const token4 = localStorage.getItem('token');
                                await fetch(`/api/incidents/${incidentId}/hide`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', ...(token4 ? { 'Authorization': `Bearer ${token4}` } : {}) }
                                });
                            } catch (_) {}
                        }
                    }}
                />
            )}

            <AlertContainer alerts={alerts} />
            {showTermsModal && (
                <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Terms and Conditions</h2>
                            <button className="close-btn" onClick={() => setShowTermsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <TermsAndConditions />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => setShowTermsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Header Component
function Header({ user, onLogout, theme, onToggleTheme, notifications = [], onToggleNotifications, notifOpen, onShowTerms }) {
    return (
        <header className="header">
            <div className="nav-container">
                <div className="logo">
                    <div className="logo-icon">
                        <span className="logo-number">999</span>
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <div className="logo-text">
                        <span className="logo-main">SAFE999</span>
                        <span className="logo-subtitle">Kira Municipality</span>
                    </div>
                </div>
                <div className="user-info">
                    <button className="btn-secondary" onClick={onToggleNotifications} title="Notifications" style={{ padding: '0.5rem 0.75rem', position: 'relative' }}>
                        <i className="fas fa-bell"></i>
                        {Array.isArray(notifications) && notifications.some(n => !n.read) && (
                            <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: 'white', borderRadius: '9999px', padding: '0 6px', fontSize: '10px' }}>
                                {notifications.filter(n => !n.read).length}
                            </span>
                        )}
                    </button>
                    <button className="btn-secondary" onClick={onShowTerms} title="Terms & Conditions" style={{ padding: '0.5rem 0.75rem' }}>
                        <i className="fas fa-file-contract"></i>
                    </button>
                    <button className="btn-secondary" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} style={{ padding: '0.5rem 0.75rem' }}>
                        <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                    <div className="trust-badge">
                        <i className="fas fa-star"></i>
                        <span>Trust Score:</span>
                        <span className="trust-score">{user.trustScore || 50}</span>
                    </div>
                    <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="logout-btn" onClick={onLogout} title="Logout">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </header>
    );
}

function NotificationsDropdown({ notifications = [], onClose, onVerify, onDismiss }) {
    return (
        <div style={{ position: 'fixed', top: '64px', right: '16px', width: '360px', maxWidth: '92vw', background: 'var(--card-bg, #fff)', color: 'var(--text, #111827)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.12)', zIndex: 1000 }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border, #e5e7eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Notifications</strong>
                <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {(!notifications || notifications.length === 0) && (
                    <div style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--muted, #6b7280)' }}>
                        No notifications
                    </div>
                )}
                {notifications && notifications.map(n => (
                    <div key={n._id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
                        <div style={{ fontSize: '0.9rem' }}>{n.message}</div>
                        {n.incident && n.incident._id && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                {!n.incident.verified && (
                                    <button className="btn btn-primary" onClick={() => onVerify(n.incident._id)}>
                                        <i className="fas fa-check"></i> Verify
                                    </button>
                                )}
                                <button className="btn" onClick={() => window.viewDetails(n.incident._id)}>Details</button>
                                <button className="btn btn-secondary" onClick={() => onDismiss && onDismiss(n._id, n.incident._id)}>Dismiss</button>
                            </div>
                        )}
                        {!n.incident && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <button className="btn btn-secondary" onClick={() => onDismiss && onDismiss(n._id, null)}>Dismiss</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Incident List Component
function IncidentList({ incidents, onSelect }) {
    const getSeverityClass = (severity) => {
        return severity === 'high' ? 'severe' : 
               severity === 'medium' ? 'moderate' : 'minor';
    };

    return (
        <div className="incident-list">
            {incidents.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-map"></i>
                    <p>No active incidents</p>
                </div>
            ) : (
                incidents.map(incident => (
                    <div 
                        key={incident.id}
                        className={`incident-card ${getSeverityClass(incident.severity)}`}
                        onClick={() => onSelect(incident)}
                    >
                        <div className="incident-header">
                            <span className="incident-type">
                                <i className={`fas fa-${getIncidentIcon(incident.type)}`}></i>
                                {' '}{incident.type}
                            </span>
                            <span className="incident-time">{incident.time}</span>
                        </div>
                        <div className="incident-location">
                            <i className="fas fa-location-dot"></i> {incident.location}
                        </div>
                        <div className="incident-footer">
                            {incident.verified ? (
                                <span className="verification-badge">
                                    <i className="fas fa-check-circle"></i>
                                    Verified
                                </span>
                            ) : (
                                <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                                    Pending Verification
                                </span>
                            )}
                            <span className="report-count">
                                {incident.reports} reports
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

function getIncidentIcon(type) {
    const icons = {
        'Armed Robbery': 'gun',
        'Mob Justice': 'users',
        'Domestic Violence': 'house',
        'Fire Outbreak': 'fire',
        'Road Accident': 'car',
        'Sexual Assault': 'exclamation-triangle',
        'Kidnapping': 'user-secret',
        'Suicide Attempt': 'heart',
        'Gas Leak': 'wind',
        'Flooding': 'water',
        'Structural Collapse': 'building'
    };
    return icons[type] || 'exclamation-triangle';
}

// Safe Route Panel Component
function SafeRoutePanel() {
    return (
        <div className="route-panel">
            <div className="route-header">
                <div className="route-status safe">
                    <i className="fas fa-check-circle"></i>
                    <span>Route Available</span>
                </div>
            </div>
            <div className="route-details">
                <p><strong>Recommended Path:</strong></p>
                <p>Kira Road → Bweyogerere Road → Ntinda Road</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    <i className="fas fa-clock"></i> Est. 15 min
                    <span style={{ marginLeft: '1rem' }}>
                        <i className="fas fa-shield-alt"></i> Safe
                    </span>
                </p>
            </div>
        </div>
    );
}

// Neighborhood Coordination Panel Component
function NeighborhoodPanel() {
    const [neighborhoods] = useState([
        { 
            id: 1, 
            name: 'Bweyogerere', 
            incidents: 2, 
            status: 'active',
            coordinators: 3,
            lastUpdate: '5 min ago'
        },
        { 
            id: 2, 
            name: 'Kira Town Council', 
            incidents: 1, 
            status: 'monitoring',
            coordinators: 5,
            lastUpdate: '12 min ago'
        },
        { 
            id: 3, 
            name: 'Ntinda-Kisaasi', 
            incidents: 0, 
            status: 'safe',
            coordinators: 2,
            lastUpdate: '1 hour ago'
        },
        { 
            id: 4, 
            name: 'Kyanja', 
            incidents: 1, 
            status: 'active',
            coordinators: 4,
            lastUpdate: '8 min ago'
        }
    ]);

    const getStatusColor = (status) => {
        const colors = {
            'active': '#dc2626',
            'monitoring': '#f59e0b',
            'safe': '#10b981'
        };
        return colors[status] || '#64748b';
    };

    return (
        <div className="neighborhood-list">
            {neighborhoods.map(neighborhood => (
                <div key={neighborhood.id} className="neighborhood-item">
                    <div className="neighborhood-header">
                        <div className="neighborhood-name">
                            <i className="fas fa-map-pin"></i>
                            {neighborhood.name}
                        </div>
                        <div 
                            className="neighborhood-status"
                            style={{ color: getStatusColor(neighborhood.status) }}
                        >
                            <span className="status-dot" style={{ background: getStatusColor(neighborhood.status) }}></span>
                            {neighborhood.status.charAt(0).toUpperCase() + neighborhood.status.slice(1)}
                        </div>
                    </div>
                    <div className="neighborhood-stats">
                        <div className="stat-item">
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{neighborhood.incidents} incident{neighborhood.incidents !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="stat-item">
                            <i className="fas fa-user-shield"></i>
                            <span>{neighborhood.coordinators} coordinators</span>
                        </div>
                        <div className="stat-item">
                            <i className="fas fa-clock"></i>
                            <span>{neighborhood.lastUpdate}</span>
                        </div>
                    </div>
                    <button className="neighborhood-btn">
                        <i className="fas fa-eye"></i> View Details
                    </button>
                </div>
            ))}
        </div>
    );
}

// Community Panel Component
function CommunityPanel({ user }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [incidentsOptions, setIncidentsOptions] = useState([]);
    const [form, setForm] = useState({ type: 'Medical Assistance', message: '', incident: '' });

    const fetchRequests = async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch('/api/community', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) throw new Error(data.message || 'Failed to load requests');
            setRequests(data.requests || []);
        } catch (e) {
            setError(e.message || 'Failed to load requests');
        }
    };

    const fetchIncidentsOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch('/api/incidents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) return;
            const opts = (data.incidents || []).slice(0, 50).map(i => ({ id: i._id, label: `${i.type} • ${i.verified ? 'Active' : 'Pending'}` }));
            setIncidentsOptions(opts);
        } catch (_) {}
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchRequests(), fetchIncidentsOptions()]).finally(() => setLoading(false));
        const id = setInterval(fetchRequests, 30000);
        return () => clearInterval(id);
    }, []);

    const createRequest = async (e) => {
        e.preventDefault();
        if (!form.type) return;
        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch('/api/community', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type: form.type, message: form.message, incident: form.incident || undefined })
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) throw new Error(data.message || 'Failed to create request');
            setForm({ type: 'Medical Assistance', message: '', incident: '' });
            fetchRequests();
        } catch (e) {
            setError(e.message || 'Failed to create request');
        } finally {
            setCreating(false);
        }
    };

    const respond = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`/api/community/${id}/respond`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) throw new Error();
            fetchRequests();
        } catch (_) {}
    };

    const resolve = async (id) => {
        const ok = window.confirm('Resolve this request?');
        if (!ok) return;
        try {
            const token = localStorage.getItem('token');
            const resp = await fetch(`/api/community/${id}/resolve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok || !data.success) throw new Error();
            fetchRequests();
        } catch (_) {}
    };

    return (
        <div className="community-list">
            <form onSubmit={createRequest} className="community-create">
                <div className="form-group">
                    <label className="form-label">Request Type</label>
                    <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option>Medical Assistance</option>
                        <option>Evacuation</option>
                        <option>Security Escort</option>
                        <option>Supplies</option>
                        <option>Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Message</label>
                    <input className="form-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe the need" />
                </div>
                <div className="form-group">
                    <label className="form-label">Link to Incident (optional)</label>
                    <select className="form-select" value={form.incident} onChange={(e) => setForm({ ...form, incident: e.target.value })}>
                        <option value="">None</option>
                        {incidentsOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary" type="submit" disabled={creating}>{creating ? 'Posting...' : 'Post Request'}</button>
            </form>

            {loading ? (
                <div className="empty-state"><i className="fas fa-spinner fa-spin"></i> Loading...</div>
            ) : error ? (
                <div className="empty-state" style={{ color: '#b91c1c' }}>{error}</div>
            ) : (
                requests.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-people-carry-box"></i>
                        <p>No open requests</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req._id} className="community-item">
                            <div className="community-item-info">
                                <div className="community-item-title">{req.type}</div>
                                <div className="community-item-desc">
                                    {req.incident ? (
                                        <span><i className="fas fa-bullhorn"></i> {req.incident.type} • {req.incident.verified ? 'Active' : 'Pending'}</span>
                                    ) : (
                                        <span><i className="fas fa-comment"></i> {req.message}</span>
                                    )}
                                    <span> • {new Date(req.createdAt).toLocaleString()}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted, #6b7280)', marginTop: '0.25rem' }}>
                                    <i className="fas fa-hands-helping"></i> Helpers: {Array.isArray(req.helpers) ? req.helpers.length : 0}
                                    {Array.isArray(req.helpers) && req.helpers.length > 0 && (
                                        <span> — {req.helpers.map(h => h.name || 'User').join(', ')}</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="action-btn" onClick={() => respond(req._id)}>Help</button>
                                {user && user.id && String(req.user) === String(user.id) && (
                                    <button className="btn btn-secondary" onClick={() => resolve(req._id)}>Resolve</button>
                                )}
                            </div>
                        </div>
                    ))
                )
            )}
        </div>
    );
}

// Report Modal Component
function ReportModal({ onClose, onSubmit, user, mapInstance }) {
    const [formData, setFormData] = useState({
        type: '',
        severity: '',
        location: '',
        description: '',
        lat: null,
        lng: null,
        imageData: null
    });
    const [locationSelected, setLocationSelected] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState('');
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Resize a dataURL image to a max dimension to keep payload small
    const resizeDataUrl = (dataUrl, maxDim = 1024, quality = 0.7) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            const scale = Math.min(1, maxDim / Math.max(width, height));
            const w = Math.round(width * scale);
            const h = Math.round(height * scale);
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            try {
                const out = c.toDataURL('image/jpeg', quality);
                resolve(out);
            } catch (_) {
                resolve(dataUrl);
            }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });

    useEffect(() => {
        const handleLocationSelect = (e) => {
            setFormData(prev => ({
                ...prev,
                lat: e.detail.lat,
                lng: e.detail.lng
            }));
            setLocationSelected(true);
            setGeoError('');
            try {
                if (mapInstance) {
                    mapInstance.setView([e.detail.lat, e.detail.lng], 15);
                }
            } catch (_) {}
        };

        window.addEventListener('mapLocationSelected', handleLocationSelect);
        return () => window.removeEventListener('mapLocationSelected', handleLocationSelect);
    }, []);

    const useCurrentLocation = () => {
        setGeoError('');
        if (!('geolocation' in navigator)) {
            setGeoError('Geolocation is not supported by your browser.');
            return;
        }
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            setGeoError('Location requires HTTPS on mobile. Please use HTTPS or tap on the map to set the location.');
            return;
        }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
                setLocationSelected(true);
                try {
                    if (mapInstance) {
                        mapInstance.setView([latitude, longitude], 15);
                    }
                } catch (_) {}
                setGeoLoading(false);
            },
            (err) => {
                setGeoLoading(false);
                if (err.code === 1) {
                    setGeoError('Location permission denied. You can still click on the map to choose a location.');
                } else if (err.code === 2) {
                    setGeoError('Location unavailable. Ensure GPS is on or try again.');
                } else if (err.code === 3) {
                    setGeoError('Location request timed out. Try again.');
                } else {
                    setGeoError('Failed to get current location.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.type || !formData.severity || !locationSelected) {
            alert('Please fill all required fields and select a location on the map');
            return;
        }
        onSubmit(formData);
    };

    const incidentTypes = [
        { value: 'Armed Robbery', icon: 'gun', label: 'Armed Robbery' },
        { value: 'Mob Justice', icon: 'users', label: 'Mob Justice' },
        { value: 'Domestic Violence', icon: 'house', label: 'Domestic Violence' },
        { value: 'Fire Outbreak', icon: 'fire', label: 'Fire Outbreak' },
        { value: 'Road Accident', icon: 'car', label: 'Road Accident' },
        { value: 'Sexual Assault', icon: 'exclamation-triangle', label: 'Sexual Assault' },
        { value: 'Kidnapping', icon: 'user-secret', label: 'Kidnapping' },
        { value: 'Suicide Attempt', icon: 'heart', label: 'Suicide Attempt' },
        { value: 'Gas Leak', icon: 'wind', label: 'Gas Leak' },
        { value: 'Flooding', icon: 'water', label: 'Flooding' },
        { value: 'Structural Collapse', icon: 'building', label: 'Structural Collapse' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Report Incident</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Incident Type *</label>
                            <div className="incident-type-grid">
                                {incidentTypes.map(type => (
                                    <div
                                        key={type.value}
                                        className={`type-option ${formData.type === type.value ? 'selected' : ''}`}
                                        onClick={() => setFormData({...formData, type: type.value})}
                                    >
                                        <i className={`fas fa-${type.icon}`}></i>
                                        <div>{type.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Severity *</label>
                            <div className="severity-selector">
                                <button
                                    type="button"
                                    className={`severity-btn low ${formData.severity === 'low' ? 'selected' : ''}`}
                                    onClick={() => setFormData({...formData, severity: 'low'})}
                                >
                                    Low
                                </button>
                                <button
                                    type="button"
                                    className={`severity-btn medium ${formData.severity === 'medium' ? 'selected' : ''}`}
                                    onClick={() => setFormData({...formData, severity: 'medium'})}
                                >
                                    Medium
                                </button>
                                <button
                                    type="button"
                                    className={`severity-btn high ${formData.severity === 'high' ? 'selected' : ''}`}
                                    onClick={() => setFormData({...formData, severity: 'high'})}
                                >
                                    High
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Photo (optional)</label>
                            {!cameraOpen && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={async () => {
                                        setCameraError('');
                                        try {
                                            if (!window.isSecureContext && window.location.hostname !== 'localhost') {
                                                setCameraError('Camera requires HTTPS on mobile. Use HTTPS or the upload option.');
                                                return;
                                            }
                                            const stream = await navigator.mediaDevices.getUserMedia({ 
                                                video: { facingMode: { ideal: 'environment' } }, 
                                                audio: false 
                                            });
                                            if (videoRef.current) {
                                                videoRef.current.srcObject = stream;
                                                await videoRef.current.play();
                                            }
                                            setCameraOpen(true);
                                        } catch (err) {
                                            setCameraError('Unable to access camera. You can still submit without a photo or upload from files.');
                                        }
                                    }}>
                                        <i className="fas fa-camera"></i> Open camera
                                    </button>
                                    <label className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <i className="fas fa-file-upload"></i> Upload photo
                                        <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files && e.target.files[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = async () => {
                                                    const resized = await resizeDataUrl(reader.result);
                                                    setFormData({ ...formData, imageData: resized });
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                    </label>
                                    {formData.imageData && (
                                        <button type="button" className="btn" onClick={() => setFormData({ ...formData, imageData: null })}>
                                            Remove photo
                                        </button>
                                    )}
                                </div>
                            )}
                            {cameraOpen && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <video ref={videoRef} style={{ width: '100%', borderRadius: '8px' }} playsInline muted></video>
                                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button type="button" className="btn btn-primary" onClick={async () => {
                                            const video = videoRef.current;
                                            const canvas = canvasRef.current;
                                            if (!video || !canvas) return;
                                            const vw = video.videoWidth || 640;
                                            const vh = video.videoHeight || 480;
                                            // Downscale to max 1024 on the longer edge
                                            const scale = Math.min(1, 1024 / Math.max(vw, vh));
                                            const w = Math.round(vw * scale);
                                            const h = Math.round(vh * scale);
                                            canvas.width = w;
                                            canvas.height = h;
                                            const ctx = canvas.getContext('2d');
                                            ctx.drawImage(video, 0, 0, w, h);
                                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                            const resized = await resizeDataUrl(dataUrl);
                                            setFormData({ ...formData, imageData: resized });
                                        }}>
                                            <i className="fas fa-camera"></i> Capture photo
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                            try {
                                                const video = videoRef.current;
                                                if (video && video.srcObject) {
                                                    const tracks = video.srcObject.getTracks();
                                                    tracks.forEach(t => t.stop());
                                                    video.srcObject = null;
                                                }
                                            } catch (_) {}
                                            setCameraOpen(false);
                                        }}>
                                            Close camera
                                        </button>
                                    </div>
                                </div>
                            )}
                            {formData.imageData && !cameraOpen && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <img src={formData.imageData} alt="Captured" style={{ width: '100%', borderRadius: '8px' }} />
                                </div>
                            )}
                            {cameraError && (
                                <div style={{ color: '#b91c1c', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    <i className="fas fa-exclamation-triangle"></i> {cameraError}
                                </div>
                            )}
                            <div className="form-hint">You can submit without a photo or description.</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location *</label>
                            <div 
                                className={`location-picker ${locationSelected ? 'active' : ''}`}
                            >
                                {locationSelected ? (
                                    <div>
                                        <i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '0.5rem' }}></i>
                                        Location selected: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                                    </div>
                                ) : (
                                    <div>
                                        <i className="fas fa-location-arrow"></i>
                                        Use the button below to set your current location
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={useCurrentLocation} disabled={geoLoading}>
                                    {geoLoading ? (<><i className="fas fa-spinner fa-spin"></i> Getting location...</>) : (<><i className="fas fa-location-arrow"></i> Use my current location</>)}
                                </button>
                            </div>
                            {geoError && (
                                <div style={{ color: '#b91c1c', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    <i className="fas fa-exclamation-triangle"></i> {geoError}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Provide additional details about the incident..."
                            />
                        </div>

                        {user.trustScore < 80 && (
                            <div style={{ 
                                padding: '1rem', 
                                background: '#fef3c7', 
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                color: '#92400e'
                            }}>
                                <i className="fas fa-info-circle"></i> Your report will require verification from 3+ users before appearing publicly.
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Incident Detail Modal
function IncidentDetailModal({ incident, onClose, user }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        <i className={`fas fa-${getIncidentIcon(incident.type)}`}></i>
                        {' '}{incident.type}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <strong>Location:</strong> {incident.location}
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <strong>Severity:</strong> 
                        <span style={{ 
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            background: incident.severity === 'high' ? '#fee2e2' : 
                                       incident.severity === 'medium' ? '#fef3c7' : '#d1fae5',
                            color: incident.severity === 'high' ? '#991b1b' : 
                                  incident.severity === 'medium' ? '#92400e' : '#065f46'
                        }}>
                            {incident.severity.toUpperCase()}
                        </span>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <strong>Status:</strong> 
                        {incident.verified ? (
                            <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>
                                <i className="fas fa-check-circle"></i> Verified
                            </span>
                        ) : (
                            <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>
                                <i className="fas fa-clock"></i> Pending Verification
                            </span>
                        )}
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <strong>Description:</strong>
                        <p style={{ marginTop: '0.5rem' }}>{incident.description}</p>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <strong>Reports:</strong> {incident.reports} users have reported this incident
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <strong>Time:</strong> {incident.time}
                    </div>
                </div>
                <div className="modal-footer">
                    {!incident.verified && user && user.id && user.trustScore >= 50 && (
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                if (!user || !user.id) {
                                    alert('You must be logged in to verify incidents');
                                    return;
                                }
                                window.verifyIncident(incident.id);
                                onClose();
                            }}
                        >
                            <i className="fas fa-check"></i> Verify This Incident
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Alert Container Component
function AlertContainer({ alerts }) {
    return (
        <div className="alert-container">
            {alerts.map(alert => (
                <div key={alert.id} className={`alert ${alert.type}`}>
                    <i className={`fas fa-${alert.type === 'danger' ? 'exclamation-triangle' : 
                                         alert.type === 'warning' ? 'exclamation-circle' : 'info-circle'}`}></i>
                    <span>{alert.message}</span>
                </div>
            ))}
        </div>
    );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
