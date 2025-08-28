import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const CertificatePreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { certificateData } = location.state || {};

  useEffect(() => {
    console.log("CertificatePreview loaded:", { id, certificateData });
  }, [id, certificateData]);

  if (!id) {
    return <div className="text-center p-8 text-red-500">❌ No certificate ID found in URL.</div>;
  }

  if (!certificateData) {
    return (
      <div className="text-center p-8">
        Certificate data not found. Please go back to the approval list.
      </div>
    );
  }

  const handleFinalApproval = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      if (!token) {
        alert('Authentication failed. Please log in again.');
        navigate('/auth');
        return;
      }

      console.log("Sending approval request to:", `/certificates/approve/${id}`);

      const res = await axiosInstance.put(
        `/certificates/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data?.message || '✅ Certificate approved successfully!');
      navigate('/admin-dashboard');
    } catch (err) {
      console.error('Error approving certificate:', err);
      const backendMessage =
        err.response?.data?.message || 'Failed to approve certificate.';
      alert(`❌ ${backendMessage}`);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg p-12">
        <div className="absolute inset-0 border-8 border-yellow-400 rounded-lg pointer-events-none"></div>
        <div className="absolute top-4 left-4">
          <img src="/logo.png" alt="Company Logo" className="h-12" />
        </div>
        <div className="text-center relative">
          <h1 className="text-5xl font-serif font-bold text-gray-800">Certificate of Achievement</h1>
          <h2 className="text-3xl mt-4 mb-8 text-blue-500 font-serif">Online Teaching Certification</h2>
          <p className="text-lg mt-12">Presented to</p>
          <h3 className="text-4xl font-semibold my-4 font-serif text-gray-700">{certificateData.name}</h3>
          <p className="text-lg">Upon completion of the Online Teaching Certification in</p>
          <p className="text-xl font-bold my-4 text-gray-800">{certificateData.specialization}</p>
          <p className="text-lg mt-8">Awarded On: {new Date().toLocaleDateString()}</p>
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
        onClick={handleFinalApproval}
        className="mt-8 bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
      >
        Approve & Finalize Certificate
      </button>
    </div>
  );
};

export default CertificatePreview;
