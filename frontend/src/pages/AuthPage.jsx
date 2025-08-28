import React, { useState } from 'react';
import SignIn from '../auth/SignIn';
import SignUp from '../auth/SignUp';

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-black via-purple-900 to-purple-400">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[400px]">
        <h2 className="text-3xl font-bold text-center mb-6">Login Form</h2>
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsSignIn(true)}
            className={`w-1/2 py-2 rounded-l-full font-semibold transition ${
              isSignIn
                ? 'bg-gradient-to-r from-blue-900 to-blue-500 text-white'
                : 'bg-gray-200 text-black'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsSignIn(false)}
            className={`w-1/2 py-2 rounded-r-full font-semibold transition ${
              !isSignIn
                ? 'bg-gradient-to-r from-blue-900 to-blue-500 text-white'
                : 'bg-gray-200 text-black'
            }`}
          >
            Signup
          </button>
        </div>
        {isSignIn ? <SignIn /> : <SignUp />}
      </div>
    </div>
  );
};

export default AuthPage;
