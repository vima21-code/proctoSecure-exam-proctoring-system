import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const TutorRequestCertificate = () => {
  const [form, setForm] = useState({
    name: "",
    experience: "",
    specialization: "",
    university: "",
  });
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const navigate = useNavigate();

  // Fetch existing request if any
  useEffect(() => {
    const fetchCertificateRequest = async () => {
      try {
        const res = await axiosInstance.get("/certificates/certificate-request/my");
        setCertificate(res.data);
      } catch (err) {
        
        setCertificate(null);
      }
    };
    fetchCertificateRequest();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/certificates/certificate-request", form);
      alert("Certificate request submitted successfully!");
      // After submission, refetch the request to show the status
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  if (certificate) {
    // Show status if already submitted
    return (
      <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
        <h2 className="text-xl font-bold mb-4">Certificate Request Status</h2>
        <p><strong>Name:</strong> {certificate.name}</p>
        <p><strong>Status:</strong> {certificate.status}</p>
        
        {certificate.status === "pending" && (
          <p className="text-yellow-500 mt-2">Your request is under review.</p>
        )}
        
        {certificate.status === "approved" && (
          <>
            <p className="text-green-500 mt-2">Your request has been approved!</p>
            <button 
              onClick={() => navigate(`/tutor/download-certificate/${certificate._id}`)}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Download Certificate
            </button>
          </>
        )}
      </div>
    );
  }

  // Show the request form if no request has been submitted
  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Request Certificate</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields as before */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="experience"
          placeholder="Years of Experience"
          value={form.experience}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="specialization"
          placeholder="Specialization"
          value={form.specialization}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="university"
          placeholder="University / Institution"
          value={form.university}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default TutorRequestCertificate;