'use client';

import { useEffect, useState } from 'react';

interface Session {
    id: string;
    start_time: string;
    end_time: string;
    duration: number;
    milk_quantity: number;
}

const formatSeconds = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

export default function HistoryPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch(`${backendUrl}/sessions`);
                if (!response.ok) {
                    throw new Error('Unable to fetch session history');
                }

                const body: { data: Session[]; error?: { message?: string } } = await response.json();
                setSessions(body.data || []);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load history';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [backendUrl]);

    return (
        <main className="container">
            <div className="page-card">
                <div className="header-row">
                    <div className="hero-copy">
                        <span className="eyebrow">HISTORY</span>
                        <h1 className="hero-title">Milk Log</h1>
                        <p className="subtitle">Quick view.</p>
                    </div>
                    <a href="/" className="secondary-button">Home</a>
                </div>

                {sessions.length > 0 && (
                    <section className="history-summary">
                        <div className="summary-card">
                            <span className="summary-icon">DAY</span>
                            <span className="summary-value">{sessions.length}</span>
                            <span className="summary-label">Count</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-icon">MILK</span>
                            <span className="summary-value">{sessions.reduce((sum, session) => sum + session.milk_quantity, 0).toFixed(1)} L</span>
                            <span className="summary-label">Total</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-icon">TIME</span>
                            <span className="summary-value">{formatSeconds(Math.round(sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length))}</span>
                            <span className="summary-label">Avg</span>
                        </div>
                    </section>
                )}

                {loading && <p className="alert">Loading...</p>}
                {error && <p className="alert alert-error">{error}</p>}

                {!loading && sessions.length === 0 && !error && (
                    <p className="alert">No saved record.</p>
                )}

                {sessions.length > 0 && (
                    <div className="table-shell">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Duration</th>
                                    <th>Milk Collected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session.id}>
                                        <td data-label="Date">{formatDate(session.start_time)}</td>
                                        <td data-label="Start Time">{formatTime(session.start_time)}</td>
                                        <td data-label="End Time">{formatTime(session.end_time)}</td>
                                        <td data-label="Duration">{formatSeconds(session.duration)}</td>
                                        <td data-label="Milk Collected">{session.milk_quantity.toFixed(1)} L</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
