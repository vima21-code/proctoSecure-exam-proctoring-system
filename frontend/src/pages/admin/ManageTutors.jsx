import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const ManageTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [expandedTutorId, setExpandedTutorId] = useState(null);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const res = await axiosInstance.get("/admin/users/tutors");
        setTutors(res.data);
      } catch (err) {
        console.error("Error fetching tutors:", err);
      }
    };
    fetchTutors();
  }, []);

  const toggleExpand = (id) => {
    setExpandedTutorId(expandedTutorId === id ? null : id);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Tutors</h1>
      {tutors.length === 0 ? (
        <p>No tutors found.</p>
      ) : (
        <ul className="space-y-4">
          {tutors.map((tutor) => (
            <li key={tutor._id} className="border rounded p-4 bg-white shadow">
              <div
                onClick={() => toggleExpand(tutor._id)}
                className="cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold">{tutor.name}</h2>
                  <p className="text-sm text-gray-600">{tutor.email}</p>
                </div>
                <button className="text-blue-600 font-semibold">
                  {expandedTutorId === tutor._id ? "Hide Classrooms" : "Show Classrooms"}
                </button>
              </div>

              {expandedTutorId === tutor._id && (
                <ul className="mt-4 ml-6 list-disc text-gray-700">
                  {tutor.classrooms.length > 0 ? (
                    tutor.classrooms.map((c) => (
                      <li key={c._id}>
                        {c.title} <span className="text-xs text-gray-500">({c.code})</span>
                      </li>
                    ))
                  ) : (
                    <li>No classrooms created.</li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageTutors;
