import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaLinkedin, FaTwitter, FaFacebook, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

const StepCard = ({ img, title, desc }) => {
    return (
        <motion.a
            className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm md:flex-row md:max-w-xl hover:bg-gray-100 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ scale: 1.02 }}
        >
            <motion.img
                whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.6), 0px 0px 40px rgba(59, 130, 246, 0.3)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="object-cover w-full rounded-t-lg h-48 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                src={img}
                alt={title}
            />
            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {title}
                </h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {desc}
                </p>
            </div>
        </motion.a>
    );
};

const ContactPage = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/enquiries', formData);
            alert('Thank you for your enquiry! We will get back to you shortly.');
            onClose();
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            alert('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <FaTimes size={24} />
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Contact Us</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-gray-700 font-semibold mb-1">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300"
                    >
                        Send Enquiry
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isContactFormOpen, setIsContactFormOpen] = useState(false);

    const handleScrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
        setIsServicesOpen(false);
    };

    const handleContactClick = () => {
        setIsContactFormOpen(true);
        setIsMenuOpen(false);
    };

    const handleAuthClick = () => {
        navigate('/auth');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleServices = () => {
        setIsServicesOpen(!isServicesOpen);
    };

    const closeContactForm = () => {
        setIsContactFormOpen(false);
    };
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation Bar */}
            <nav className="bg-blue-800 text-white p-4 sticky top-0 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Logo*/}
                    <div className="flex items-center space-x-2">
                        <img src="/logo.png" alt="ProctoSecure Logo" className="h-8" />
                        {/* <span className="text-xl font-bold">ProctoSecure</span> */}
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6 relative">
                        <button onClick={handleContactClick} className="hover:text-gray-300">Contact Us</button>
                        <div className="relative">
                            <button onClick={toggleServices} className="hover:text-gray-300 flex items-center space-x-1">
                                <span>Services</span>
                                <FaChevronDown className={`transform transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                            {isServicesOpen && (
                                <div className="absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-2 z-20">
                                    <button onClick={() => handleScrollToSection('tutor-section')} className="block w-full text-left px-4 py-2 hover:bg-gray-200">Tutor Center</button>
                                    <button onClick={() => handleScrollToSection('student-section')} className="block w-full text-left px-4 py-2 hover:bg-gray-200">Student Center</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Hamburger Menu */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-white focus:outline-none">
                            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu (visible on small screens) */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 text-center">
                        <button onClick={handleContactClick} className="block w-full py-2 hover:bg-blue-700">Contact Us</button>
                        <div className="relative">
                            <button onClick={toggleServices} className="block w-full py-2 hover:bg-blue-700 flex items-center justify-center space-x-1">
                                <span>Services</span>
                                <FaChevronDown className={`transform transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                            {isServicesOpen && (
                                <div className="w-full bg-blue-700 text-white py-2 z-20">
                                    <button onClick={() => handleScrollToSection('tutor-section')} className="block w-full px-4 py-2 hover:bg-blue-600">Tutor Center</button>
                                    <button onClick={() => handleScrollToSection('student-section')} className="block w-full px-4 py-2 hover:bg-blue-600">Student Center</button>
                                </div>
                            )}
                        </div>
                        {/* New Sign In Button for Mobile Menu */}
                        <button onClick={handleAuthClick} className="block w-full py-2 hover:bg-blue-700 font-extrabold ">
                            Sign In
                        </button>
                    </div>
                )}
            </nav>

            {/* Header/Hero Section */}
            <header className="bg-blue-800 text-white py-24 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-4 md:text-6xl">
                        ProctoSecure: Secure & Seamless Online Exams
                    </h1>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Ensure academic integrity and test security with our advanced, AI-powered proctoring solution.
                    </p>
                    <button
                        onClick={() => navigate('/auth')}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition duration-300"
                    >
                        Get more from your experience - Register
                    </button>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-12 text-gray-800">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature Card 1 */}
                        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                            <h3 className="text-2xl font-semibold mb-2 text-blue-700">Candidate Monitoring</h3>
                            <p className="text-gray-600">Tutors can monitor student's behavior, receive notifications on suspicious behaviour.</p>
                        </div>
                        {/* Feature Card 2 */}
                        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                            <h3 className="text-2xl font-semibold mb-2 text-blue-700">Cheating Detection</h3>
                            <p className="text-gray-600">Provides real-time supervision for exams and detects cheating methods like tab switching, copy-paste and absence of Candidate.</p>
                        </div>
                        {/* Feature Card 3 */}
                        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                            <h3 className="text-2xl font-semibold mb-2 text-blue-700">Secure Browser</h3>
                            <p className="text-gray-600">Lockdown browser technology prevents access to unauthorized applications and websites.</p>
                        </div>
                        {/* Feature Card 4 */}
                        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                            <h3 className="text-2xl font-semibold mb-2 text-blue-700">Evaluation & Analysis Reports</h3>
                            <p className="text-gray-600">Easily add and check the evaluation and assessment reports.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* New "How It Works" Section */}
            <section className="bg-white py-20 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-12 text-gray-800">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        {/* For Tutors */}
                        <div id="tutor-section" className="p-8 rounded-lg">
                            <h3 className="text-3xl font-bold mb-6 text-blue-800">For Tutors</h3>
                            <div className="space-y-8">
                                <StepCard
                                    img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmy6jOm1BLz3i7IVigXIJDL1_Amdz3GqJakQ&s"
                                    title="Step 1: Create Profile & Classroom"
                                    desc="Register and create a classroom, then share the unique class code with your students."
                                />
                                <StepCard
                                    img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbXVtnOAE6-D0XSdgHphs08qwboC3R9KH2ow&s"
                                    title="Step 2: Schedule Exams"
                                    desc="Create exams specific to your classroom and set the time and date for the assessment."
                                />
                                <StepCard
                                    img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS5jD5DQa8BgDsMY-vRiguYR7H97Nu3mK6fQ&s"
                                    title="Step 3: Live Proctoring"
                                    desc="Use the platform to monitor students in real-time during the exam."
                                />
                                <StepCard
                                    img="https://media.istockphoto.com/id/1260329688/vector/tiny-characters-with-magnifying-glass-and-red-pencil-editing-mistakes-in-paper-test-teacher.jpg?s=612x612&w=0&k=20&c=hD627fBQS69q7boTDDA7mivHitizPUZhhZFxUUuJhiA="
                                    title="Step 4: Evaluate & Report"
                                    desc="Check submissions, review suspicious activities, and add final evaluation reports."
                                />
                            </div>
                        </div>
                        
                        {/* For Students */}
                        <div id="student-section" className="p-8 rounded-lg">
                            <h3 className="text-3xl font-bold mb-6 text-blue-800">For Students</h3>
                            <div className="space-y-8">
                                <StepCard
                                    img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSSce6lLOLbXh2Esl_4af2Uvculs7rXtQ9kw&s"
                                    title="Step 1: Create Profile & Join"
                                    desc="Create your profile and join your tutor's classroom using the provided class code."
                                />
                                <StepCard
                                    img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQ2ZOlVjTaNyTx0V_X5V04INug82sBU2zrVw&s"
                                    title="Step 2: Attend Exams"
                                    desc="Enter the unique code or scan a QR code to join your classroom."
                                />
                                <StepCard
                                    img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjhZFcEM8cVf0zrDW1PDNMAhVxzSVdCUyoijvANPI-3-7Vzc7e3WAzk092NRTbjz1QlSw&usqp=CAU"
                                    title="Step 3: Get Proctored"
                                    desc="Participate in scheduled exams with live proctoring enabled."
                                />
                                <StepCard
                                    img="https://thumbs.dreamstime.com/z/assessment-concept-word-stamped-grunge-white-floor-little-men-looking-down-detail-44848250.jpg"
                                    title="Step 4: View Results"
                                    desc="Check your scores and feedback after evaluation."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Call-to-Action Section */}
            <section id="contact-us-section" className="bg-gray-100 py-20 px-4">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">Have Queries? Drop us a mail..</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of educational institutions that trust ProctoSecure to protect their exams.
                    </p>
                    <button
                        onClick={handleContactClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300"
                    >
                        Contact Us
                    </button>
                </div>
            </section>

            {/* Social Profiles Footer */}
            <footer className="bg-blue-800 text-white py-8">
                <div className="container mx-auto text-center">
                    <div className="flex justify-center space-x-6">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                            <FaLinkedin size={30} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                            <FaTwitter size={30} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                            <FaFacebook size={30} />
                        </a>
                    </div>
                    <p className="mt-4 text-sm">&copy; {new Date().getFullYear()} ProctoSecure. All rights reserved.</p>
                </div>
            </footer>

            {/* Contact Form Modal */}
            {isContactFormOpen && <ContactPage onClose={closeContactForm} />}
        </div>
    );
};

export default HomePage;