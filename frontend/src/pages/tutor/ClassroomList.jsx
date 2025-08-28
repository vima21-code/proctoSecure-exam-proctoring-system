import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";

const ClassroomList = () => {
  const [classrooms, setClassrooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/classrooms")
      .then((res) => setClassrooms(res.data))
      .catch((err) => console.error("Failed to load classrooms"));
  }, []);

  const brightColors = [
    "from-pink-400 to-pink-600",
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600",
    "from-yellow-400 to-yellow-600",
    "from-red-400 to-red-600",
    "from-purple-400 to-purple-600",
    "from-orange-400 to-orange-600",
    "from-cyan-400 to-cyan-600",
    "from-lime-400 to-lime-600",
  ];


  const rows = [];
  for (let i = 0; i < classrooms.length; i += 3) {
    rows.push(classrooms.slice(i, i + 3));
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Classrooms</h2>

      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-start gap-6 mb-6">
          {row.map((cls, idx) => {
            const colorClass = brightColors[(rowIndex * 3 + idx) % brightColors.length];
            return (
              <div
                key={cls._id}
                className={`w-[200px] h-[200px] rounded-xl p-4 shadow-lg hover:shadow-2xl cursor-pointer transition bg-gradient-to-tr ${colorClass} flex flex-col justify-center`}
                onClick={() => navigate(`/tutor/classrooms/${cls._id}`)}
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  {cls.title}
                </h3>
                <p className="text-white  text-sm">Code: {cls.code}</p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ClassroomList;
