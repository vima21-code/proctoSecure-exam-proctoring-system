import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TutorDownloadCertificate = () => {
    const { id } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const componentRef = useRef();

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await axiosInstance.get(`/certificates/certificate-request/my`);
                if (res.data._id === id && res.data.status === "approved") {
                    setCertificate(res.data);
                } else {
                    setError("Certificate not found or not approved.");
                }
            } catch (err) {
                console.error('Error fetching certificate:', err);
                setError("Failed to fetch certificate data.");
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [id]);

    const handleDownload = async () => {
        if (!componentRef.current) return;

        const canvas = await html2canvas(componentRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('landscape', 'pt', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save('certificate.pdf');
    };

    if (loading) {
        return <div className="text-center p-8">Loading certificate...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (!certificate) {
        return <div className="text-center p-8">Certificate not found.</div>;
    }

    return (
        <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
            <div
                ref={componentRef}
                className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg p-12 print:p-0"
            >
                <div className="absolute inset-0 border-8 border-yellow-400 rounded-lg pointer-events-none"></div>
                <div className="absolute top-4 left-4">
                    <img src="/logo.png" alt="Company Logo" className="h-12" />
                </div>
                <div className="text-center relative">
                    <h1 className="text-5xl font-serif font-bold text-gray-800">Certificate of Achievement</h1>
                    <h2 className="text-3xl mt-4 mb-8 text-blue-500 font-serif">Online Teaching Certification</h2>
                    <p className="text-lg mt-12">Presented to</p>
                    <h3 className="text-4xl font-semibold my-4 font-serif text-gray-700">{certificate.name}</h3>
                    <p className="text-lg">Upon completion of the Online Teaching Certification in</p>
                    <p className="text-xl font-bold my-4 text-gray-800">{certificate.specialization}</p>
                    <p className="text-lg mt-8">
                        Awarded On: {new Date(certificate.updatedAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex justify-between mt-16 relative">
                    <div className="flex flex-col items-center">
                        <p className="border-b-2 border-gray-400 w-48 text-center py-2">Carol Green</p>
                        <p className="text-sm mt-2 text-gray-600">Head of Certifications</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="border-b-2 border-gray-400 w-48 text-center py-2">John Hart</p>
                        <p className="text-sm mt-2 text-gray-600">Company CEO</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleDownload}
                className="mt-8 bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
                Download Certificate
            </button>
        </div>
    );
};

export default TutorDownloadCertificate;
