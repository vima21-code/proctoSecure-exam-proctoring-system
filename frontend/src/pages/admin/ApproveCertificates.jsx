import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance'; 

const ApproveCertificates = () => {
    const navigate = useNavigate();
    const [pendingCertificates, setPendingCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingCertificates = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if (!token) {
                navigate('/auth');
                return;
            }

            const res = await axiosInstance.get(
                '/certificates/certificate-requests',
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            
            // Only pending requests
            const pending = res.data.filter(cert => cert.status === 'pending');
            setPendingCertificates(pending);
        } catch (err) {
            console.error('Error fetching pending certificates:', err);
            setError('Failed to load certificate requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingCertificates();
    }, []);

    const handleViewAndApprove = (certificate) => {
        navigate(`/certificates/approve/${certificate._id}`, { 
            state: { certificateData: certificate } 
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-gray-700">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-3xl font-bold mb-6 text-indigo-800">
                    Certificate Approval Requests
                </h1>

                {pendingCertificates.length === 0 ? (
                    <p className="text-gray-600 text-lg">
                        No pending certificate requests at this time.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {pendingCertificates.map((cert) => (
                            <li 
                                key={cert._id} 
                                className="bg-indigo-50 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
                            >
                                <div>
                                    <p className="font-semibold text-lg text-indigo-700">
                                        {cert.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Specialization: {cert.specialization}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Requested on: {new Date(cert.createdAt).toLocaleDateString()}
                                    </p>
                                    {cert.tutor?.isCertified && (
                                        <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded">
                                            Certified
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <button
                                        onClick={() => handleViewAndApprove(cert)}
                                        className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition"
                                    >
                                        View & Approve
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ApproveCertificates;
