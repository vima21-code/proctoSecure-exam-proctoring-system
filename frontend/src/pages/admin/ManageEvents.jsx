// src/pages/admin/ManageEvents.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const initialFormState = {
  title: "",
  description: "",
  date: "",
  imageUrl: "", // New field for the event image URL
  eventUrl: "", // New field for the external event URL
  targetAudience: "both",
};

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get("/admin/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axiosInstance.put(`/events/${editingId}`, form);
      } else {
        await axiosInstance.post("/events", form);
      }
      setForm(initialFormState);
      setEditingId(null);
      fetchEvents();
    } catch (err) {
      console.error("Failed to save event", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description || "",
      date: event.date ? event.date.substring(0, 10) : "",
      imageUrl: event.imageUrl || "",
      eventUrl: event.eventUrl || "",
      targetAudience: event.targetAudience,
    });
    setEditingId(event._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axiosInstance.delete(`/events/${id}`);
        fetchEvents();
      } catch (err) {
        console.error("Failed to delete event", err);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-white">Manage Events</h1>

        {/* Admin Form and List Section */}
        <div className="bg-gray-800 text-gray-100 rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">{editingId ? "Edit Event" : "Create New Event"}</h2>

          {/* Event Form */}
          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div>
              <label className="block font-medium mb-1" htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:border-purple-500"
                placeholder="Event title"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full bg-gray-700 border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:border-purple-500"
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="imageUrl">Image URL</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full bg-gray-700 border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:border-purple-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="eventUrl">Event URL</label>
              <input
                id="eventUrl"
                name="eventUrl"
                type="url"
                value={form.eventUrl}
                onChange={handleChange}
                className="w-full bg-gray-700 border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:border-purple-500"
                placeholder="https://example.com/register"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="targetAudience">Target Audience</label>
              <select
                id="targetAudience"
                name="targetAudience"
                value={form.targetAudience}
                onChange={handleChange}
                className="w-full bg-gray-700 border-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:border-purple-500"
                required
              >
                <option value="tutors">Tutors only</option>
                <option value="students">Students only</option>
                <option value="both">Both tutors and students</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {editingId ? (loading ? "Updating..." : "Update Event") : (loading ? "Creating..." : "Create Event")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialFormState);
                }}
                className="ml-4 px-4 py-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </form>

          <h2 className="text-xl font-semibold mb-4 mt-8 border-t border-gray-700 pt-4">Admin Event List</h2>
          {events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event) => (
                <li
                  key={event._id}
                  className="bg-gray-700 rounded-md p-4 flex justify-between items-center shadow-sm"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(event.date).toLocaleDateString()} |{" "}
                      <span className="capitalize">{event.targetAudience}</span>
                    </p>
                    {event.description && <p className="mt-1 text-gray-300">{event.description}</p>}
                    <p className="text-xs text-gray-500 mt-1">Image: {event.imageUrl}</p>
                    <p className="text-xs text-gray-500">URL: {event.eventUrl}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Edit Event"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-red-400 hover:text-red-300 ml-3"
                      title="Delete Event"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;