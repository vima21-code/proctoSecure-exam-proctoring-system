import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axiosInstance.get("/admin/users/students");
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, []);

  const toggleExpand = (id) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Students</h1>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul className="space-y-4">
          {students.map((student) => (
            <li key={student._id} className="border rounded p-4 bg-white shadow">
              <div
                onClick={() => toggleExpand(student._id)}
                className="cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold">{student.name}</h2>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <button className="text-green-600 font-semibold">
                  {expandedStudentId === student._id ? "Hide Classrooms" : "Show Classrooms"}
                </button>
              </div>

              {expandedStudentId === student._id && (
                <ul className="mt-4 ml-6 list-disc text-gray-700">
                  {student.classrooms.length > 0 ? (
                    student.classrooms.map((c) => (
                      <li key={c._id}>
                        {c.title} <span className="text-xs text-gray-500">({c.code})</span>
                      </li>
                    ))
                  ) : (
                    <li>No joined classrooms.</li>
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

export default ManageStudents;
