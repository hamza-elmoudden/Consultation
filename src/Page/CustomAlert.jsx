import { useState, useEffect } from 'react'


function CustomAlert({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-linear-to-br from-pink-500 via-red-500 to-blue-300 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Welcome!
          </h2>
          <div className="text-left space-y-3 mb-6">
            <p className="text-gray-700 font-semibold">Request Limit Information:</p>
            <div className="space-y-2">
              <p className="text-gray-600 flex items-center">
                <span className="mr-2">🔄</span>
                You have <strong className="mx-1">40 requests</strong> available
              </p>
              <p className="text-gray-600 flex items-center">
                <span className="mr-2">⏰</span>
                Requests reset every <strong className="mx-1">2 hours</strong>
              </p>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded space-y-1">
              <p className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2 mt-0.5">⚠️</span>
                <span><strong>Note:</strong> During high traffic periods, limits may be applied more strictly to ensure service quality for all users.</span>
              </p>
              <p className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2 mt-0.5">⚠️</span>
                <span><strong>Note:</strong> This system is still under development.</span>
              </p>
              <p className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2 mt-0.5">⚠️</span>
                <span><strong>Note:</strong>The number of products in the database is limited.</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomAlert