// src/pages/student/StudentEventsPage.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { motion } from "framer-motion";

// Reusable component for rendering an individual event card
const EventCard = ({ event, onCardClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex-1 min-w-[280px] max-w-[320px] transition-transform duration-300 transform hover:scale-105 cursor-pointer" 
      onClick={() => onCardClick(event)}
    >
      <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-xl font-bold">{event.title}</h3>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(event.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })} | 121 Bar
        </p>
        <a 
          href={event.eventUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          onClick={(e) => e.stopPropagation()} // Prevent card expansion when clicking the link
        >
          Register Now
        </a>
      </div>
    </motion.div>
  );
};

const StudentEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // State for the expanded event
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = user?.token;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get("/admin/events/audience?audience=students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events", err);
        setEvents([]);
      }
    };
    if (token) {
      fetchEvents();
    }
  }, [token]);

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-white">Upcoming Events</h1>
        
        <div className="flex justify-center items-center flex-wrap gap-8 mb-16">
          {events.length === 0 ? (
            <p className="text-center text-gray-500">No upcoming events.</p>
          ) : (
            events.map((event) => (
              <EventCard key={event._id} event={event} onCardClick={setSelectedEvent} />
            ))
          )}
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
            <div className="bg-white text-gray-900 rounded-lg p-8 max-w-2xl w-full relative" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl" onClick={() => setSelectedEvent(null)}>&times;</button>
              <h2 className="text-3xl font-bold mb-4">{selectedEvent.title}</h2>
              <p className="text-lg text-gray-600 mb-2">
                Date: {new Date(selectedEvent.date).toLocaleDateString()}
              </p>
              <p className="text-md mb-4">{selectedEvent.description}</p>
              <a href={selectedEvent.eventUrl} target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors inline-block">
                Register for this Event
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEventsPage;