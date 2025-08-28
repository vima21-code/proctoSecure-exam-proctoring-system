import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const TutorStudents = () => {
  const [classes, setClasses] = useState([]);
  const [expandedClass, setExpandedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosInstance.get("/classrooms/classes-with-students");
        setClasses(res.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError("Failed to load classes.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) return <div className="text-center p-8">Loading classes...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Classes & Students</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() =>
              setExpandedClass(expandedClass === cls._id ? null : cls._id)
            }
          >
            <h2 className="text-xl font-semibold mb-2">{cls.title}</h2>
            <p className="text-gray-600 mb-4">
              {cls.students.length} student{cls.students.length !== 1 ? "s" : ""}
            </p>

            {expandedClass === cls._id && (
              <ul className="mt-4 border-t pt-4 max-h-64 overflow-auto">
                {cls.students.map((student, idx) => (
                  <li key={idx} className="py-1 border-b last:border-none">
                    {/* Adjust below depending on your user model */}
                    {student.firstName} {student.lastName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorStudents;
