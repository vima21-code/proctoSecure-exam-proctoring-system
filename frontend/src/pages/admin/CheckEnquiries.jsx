import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { FaReply } from 'react-icons/fa';

const CheckEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [replyForm, setReplyForm] = useState({ id: null, message: '' });

  const fetchEnquiries = async () => {
    try {
      const res = await axiosInstance.get('/enquiries');
      setEnquiries(res.data);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    }
  };

  const handleReplyChange = (e) => {
    setReplyForm({ ...replyForm, message: e.target.value });
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/enquiries/${replyForm.id}/reply`, {
        replyMessage: replyForm.message,
      });
      fetchEnquiries();
      setReplyForm({ id: null, message: '' });
      alert('Reply sent successfully!');
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply.');
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  return (
    <div className="p-6 bg-white shadow rounded-lg min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Check Enquiries</h1>
      {enquiries.length > 0 ? (
        <div className="space-y-6">
          {enquiries.map((enquiry) => (
            <div key={enquiry._id} className="bg-gray-100 p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xl font-semibold text-gray-800">{enquiry.name}</p>
                  <p className="text-sm text-gray-600">{enquiry.email} | {enquiry.phone}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${enquiry.status === 'replied' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {enquiry.status}
                  </span>
                  {enquiry.status === 'pending' && (
                    <button
                      onClick={() => setReplyForm({ id: enquiry._id, message: '' })}
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="Reply to this enquiry"
                    >
                      <FaReply size={20} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{enquiry.message}</p>

              {replyForm.id === enquiry._id && (
                <form onSubmit={handleReplySubmit} className="mt-4 p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold text-gray-800 mb-2">Reply to {enquiry.name}</h3>
                  <textarea
                    value={replyForm.message}
                    onChange={handleReplyChange}
                    rows="4"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your reply here..."
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Send Reply
                  </button>
                </form>
              )}

              {enquiry.status === 'replied' && enquiry.replyMessage && (
                <div className="mt-4 p-4 border rounded-lg bg-green-50">
                  <h3 className="font-semibold text-green-800">Your Reply:</h3>
                  <p className="text-sm text-green-700 mt-1">{enquiry.replyMessage}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No enquiries found.</p>
      )}
    </div>
  );
};

export default CheckEnquiries;
