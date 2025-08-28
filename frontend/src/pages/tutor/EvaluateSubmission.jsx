import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { FaArrowLeft } from "react-icons/fa";

const EvaluateSubmission = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState({
        score: "",
        totalScore: "",
        grade: "",
        assessmentReport: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("submission");

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const { data } = await axiosInstance.get(`/submissions/${submissionId}`);
                setSubmission(data);

                if (data.score !== undefined || data.assessmentReport !== undefined) {
                    setEvaluation({
                        score: data.score || "",
                        totalScore: data.totalScore || "",
                        grade: data.grade || "",
                        assessmentReport: data.assessmentReport || "",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch submission:", err);
                setError("Failed to load submission details.");
            } finally {
                setLoading(false);
            }
        };
        fetchSubmission();
    }, [submissionId]);

    const handleEvaluationSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axiosInstance.put(`/submissions/evaluate/${submissionId}`, evaluation);
            alert("Evaluation saved successfully!");
            setIsEvaluating(false);
            const { data } = await axiosInstance.get(`/submissions/${submissionId}`);
            setSubmission(data);
        } catch (err) {
            console.error("Failed to save evaluation:", err);
            alert("Failed to save evaluation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p className="text-center mt-10">Loading submission details...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
    if (!submission || !submission.exam || !submission.student)
        return <p className="text-center mt-10">Submission data is incomplete.</p>;

    const exam = submission.exam;
    const student = submission.student;
    const examType = exam.type?.toLowerCase();

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
                <FaArrowLeft className="mr-2" /> Back to Submissions
            </button>

            <h2 className="text-3xl font-bold mb-4">{exam.title}</h2>
            <p className="text-lg text-gray-700 mb-2">
                Student: <span className="font-semibold">{student.name}</span>
            </p>
            <p className="text-lg text-gray-700 mb-4">
                Submitted on: {new Date(submission.submittedAt).toLocaleString()}
            </p>

            {submission.suspicious && (
                <div className="bg-red-100 p-4 border-l-4 border-red-500 text-red-700 mb-4">
                    <p className="font-bold">Suspicious Activity Detected! 🚨</p>
                    <ul className="list-disc list-inside">
                        {submission.cheatEvents.map((event, index) => (
                            <li key={index}>
                                {event.message} ({new Date(event.time).toLocaleString()})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-semibold focus:outline-none ${
                        activeTab === "submission"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("submission")}
                >
                    Submission Details
                </button>
                <button
                    className={`py-2 px-4 font-semibold focus:outline-none ${
                        activeTab === "evaluation"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("evaluation")}
                >
                    Evaluation
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "submission" && (
                <div>
                    {/* MCQ Exam Display */}
                    {examType === "mcq" && exam.mcqs && submission.answers && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold mb-2">MCQ Questions</h3>
                            {exam.mcqs.map((question, index) => {
                                const studentAnswer = submission.answers[index];
                                const isCorrect = String(studentAnswer) === String(question.correctAnswer);
                                return (
                                    <div key={index} className="p-4 border rounded-lg shadow-sm">
                                        <p className="font-semibold text-lg mb-2">
                                            Q{index + 1}: {question.questionText}
                                        </p>
                                        <p className="mb-1">
                                            Student's Answer:{" "}
                                            <span
                                                className={
                                                    isCorrect
                                                        ? "text-green-600 font-bold"
                                                        : "text-red-600 font-bold"
                                                }
                                            >
                                                {studentAnswer}
                                            </span>
                                            {isCorrect ? " ✅" : " ❌"}
                                        </p>
                                        {!isCorrect && (
                                            <p className="text-green-600">
                                                Correct Answer:{" "}
                                                <span className="font-bold">{question.correctAnswer}</span>
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Upload Exam Display */}
                    {examType === "upload" && (
                        <div>
                            {submission.textAnswer && (
                                <div className="p-4 bg-gray-100 rounded-md mb-4">
                                    <p className="font-semibold mb-2">Student's Typed Answer:</p>
                                    <p className="whitespace-pre-wrap">{submission.textAnswer}</p>
                                </div>
                            )}

                            {submission.uploadedFileUrl && (
                                <div className="mt-4">
                                    <p className="font-semibold mb-2">Student's Uploaded File:</p>
                                    <a
                                        href={`http://localhost:5000${submission.uploadedFileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Uploaded File
                                    </a>
                                </div>
                            )}

                            {!submission.textAnswer && !submission.uploadedFileUrl && (
                                <p className="text-gray-500">No answer submitted for this exam.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "evaluation" && (
                <div>
                    <h3 className="text-2xl font-bold mt-6 mb-2">Evaluation Results</h3>

                    {/* Display Score for MCQ or Upload */}
                    {examType === "mcq" ? (
                        <p className="text-xl font-bold mb-2">
                            Score: {submission.score} / {exam.mcqs.length}
                        </p>
                    ) : (
                        submission.score !== undefined &&
                        submission.totalScore !== undefined && (
                            <p className="text-xl font-bold mb-2">
                                Score: {submission.score} / {submission.totalScore}
                            </p>
                        )
                    )}

                    {submission.grade && (
                        <p className="text-xl font-bold mb-2">Grade: {submission.grade}</p>
                    )}

                    {submission.assessmentReport && (
                        <div className="p-4 bg-gray-100 rounded-md mt-4">
                            <p className="font-semibold mb-2">Tutor's Assessment:</p>
                            <p className="whitespace-pre-wrap">{submission.assessmentReport}</p>
                        </div>
                    )}

                    {/* Evaluation Form for both MCQ and Upload */}
                    <div>
                        {!isEvaluating && (
                            <button
                                onClick={() => setIsEvaluating(true)}
                                className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            >
                                {submission.score ? "Edit Evaluation" : "Add Evaluation"}
                            </button>
                        )}

                        {isEvaluating && (
                            <div className="mt-6 border-t pt-4">
                                <h4 className="text-xl font-bold mb-4">Evaluation Form</h4>
                                <form onSubmit={handleEvaluationSubmit}>
                                    {/* MCQ Score read-only */}
                                    {examType === "mcq" ? (
                                        <p className="mb-4">
                                            Auto-calculated Score:{" "}
                                            <span className="font-bold">{submission.score}</span> /{" "}
                                            {exam.mcqs.length}
                                        </p>
                                    ) : (
                                        <div className="flex space-x-4 mb-4">
                                            <div className="w-1/3">
                                                <label className="block text-gray-700 font-bold mb-2">Score</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2 border rounded-md"
                                                    value={evaluation.score}
                                                    onChange={(e) =>
                                                        setEvaluation({ ...evaluation, score: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <label className="block text-gray-700 font-bold mb-2">Out of</label>
                                                <input
                                                    type="number"
                                                    className="w-full p-2 border rounded-md"
                                                    value={evaluation.totalScore}
                                                    onChange={(e) =>
                                                        setEvaluation({ ...evaluation, totalScore: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-bold mb-2">Grade</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            value={evaluation.grade}
                                            onChange={(e) =>
                                                setEvaluation({ ...evaluation, grade: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-bold mb-2">Assessment Report</label>
                                        <textarea
                                            className="w-full p-2 border rounded-md"
                                            rows="4"
                                            value={evaluation.assessmentReport}
                                            onChange={(e) =>
                                                setEvaluation({ ...evaluation, assessmentReport: e.target.value })
                                            }
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Saving..." : "Save Evaluation"}
                                    </button>
                                    <button
                                        type="button"
                                        className="ml-4 text-gray-600 hover:text-gray-800"
                                        onClick={() => setIsEvaluating(false)}
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluateSubmission;
