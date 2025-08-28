// controllers/eventController.js
const Event = require("../models/Event");

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  // Destructure the new fields from the request body
  const { title, description, date, targetAudience, imageUrl, eventUrl } = req.body;
  try {
    const newEvent = new Event({
      title,
      description,
      date,
      targetAudience,
      imageUrl, // Include imageUrl
      eventUrl, // Include eventUrl
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  // Destructure the new fields from the request body
  const { title, description, date, targetAudience, imageUrl, eventUrl } = req.body;
  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    event.title = title;
    event.description = description;
    event.date = date;
    event.targetAudience = targetAudience;
    event.imageUrl = imageUrl; // Update imageUrl
    event.eventUrl = eventUrl; // Update eventUrl
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json({ msg: "Event deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


exports.getEventsByAudience = async (req, res) => {
  try {
    const { audience } = req.query; // expects 'students' or 'tutors'
    if (!audience || !["students", "tutors"].includes(audience)) {
      return res.status(400).json({ msg: "Invalid audience" });
    }

    // Get events targeted at audience or both
    const events = await Event.find({
      targetAudience: { $in: [audience, "both"] },
    }).sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};