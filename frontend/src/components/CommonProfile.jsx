import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const colorOptions = ["#F97316", "#22C55E", "#3B82F6", "#A855F7", "#EC4899"];

const CommonProfile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const token = storedUser.token || "";
  const role = storedUser.role || "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    institution: "",
    specialization: "",
    profilePicture: "",
  });

  const [avatarColor, setAvatarColor] = useState(colorOptions[0]);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || {};
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        institution: data.institution || "",
        specialization: data.specialization || "",
        profilePicture: data.profilePicture || "",
      });

      if (data.profilePicture) {
        setPreview(`http://localhost:5000/profileuploads/${data.profilePicture}`);
      }
      setAvatarColor(data.avatarColor || colorOptions[0]);
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value || "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, profilePicture: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    data.append("avatarColor", avatarColor);

    try {
      await axiosInstance.put("/users/profile", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      localStorage.setItem(
  "user",
  JSON.stringify({
    ...storedUser,
    hasProfile: true,
    firstName: formData.firstName,
    lastName: formData.lastName,
    profilePicture: 
      typeof formData.profilePicture === "string"
        ? formData.profilePicture
        : formData.profilePicture?.name || "",
    avatarColor,
  })
);

      setMessage("Profile saved!");

      setTimeout(() => {
        navigate(`/${role}-dashboard`);
      }, 1200);
    } catch (err) {
      console.error(err);
      setMessage("Error saving profile");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture or Avatar */}
          <div className="flex items-center gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: avatarColor }}
              >
                {formData.firstName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* Color Picker */}
          {!preview && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Choose Avatar Color:</span>
              {colorOptions.map((color) => (
                <div
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-6 h-6 rounded-full cursor-pointer border ${
                    avatarColor === color ? "border-black" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="border px-3 py-2 rounded col-span-2 bg-gray-100"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
            <input
              type="text"
              name="institution"
              placeholder="Institution"
              value={formData.institution}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
            {role === "tutor" && (
              <input
                type="text"
                name="specialization"
                placeholder="Specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="border px-3 py-2 rounded"
              />
            )}
          </div>

          <button className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommonProfile;
