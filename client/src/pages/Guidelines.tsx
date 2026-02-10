import React from 'react';
import { AlertCircle, FileText, Download, Clock, Calendar, Users } from 'lucide-react';

const Guidelines = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSCA Preparatory Test Guidelines</h1>
          <p className="text-gray-600">Please read all instructions carefully before proceeding.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Nature of Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Nature of Preparatory Test</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">This platform is NOT an official CSCA authority website.</h3>
                  <p className="text-gray-600">It is a private preparatory test platform designed to help applicants practice under realistic exam conditions.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">i</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Scores and results are for self-evaluation and preparation guidance only.</h3>
                  <p className="text-gray-600">Participation does not guarantee admission, ranking, or scholarship outcomes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">The design should feel: Serious, Trustworthy, Institutional.</h3>
                  <p className="text-gray-600">No animations, no gradients, no flashy elements.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration & Identity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Registration & Identity</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Candidates must provide accurate personal details during registration.</h3>
                  <p className="text-gray-600">A unique Preparatory Hall Ticket Number is generated for each candidate.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">This hall ticket is valid only on this platform and non-transferable.</h3>
                  <p className="text-gray-600">Incorrect or misleading information is candidate's responsibility.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Schedule & Slot Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-8 w-8 text-orange-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Exam Schedule & Slot Selection</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Exam dates and time slots are predefined and fixed.</h3>
                  <p className="text-gray-600">Candidates may only select from available examination dates.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Examination time is automatically assigned based on selected subject(s).</h3>
                  <p className="text-gray-600">Manual time selection is not permitted.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">5</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">This mirrors real examination authority scheduling rules.</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Access Validity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Payment & Access Validity</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">6</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment grants time-bound access to preparatory tests and documents.</h3>
                  <p className="text-gray-600">Fees are charged only for preparatory access, not for official registration.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">7</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Access validity (e.g., 90 days) is clearly stated on the hall ticket.</h3>
                  <p className="text-gray-600">Payments are non-refundable once confirmed.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">8</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment confirms intent to participate.</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Test Environment & Discipline */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Test Environment & Discipline</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">9</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">The preparatory test must be taken in one continuous session.</h3>
                  <p className="text-gray-600">Candidates are expected to manage time independently, avoid distractions, and treat session like a real exam.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">10</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Discipline is part of preparation.</h3>
                  <p className="text-gray-600">Closing browser, refreshing page, or leaving session may result in loss of progress.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">11</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Technical Requirements</h3>
                  <p className="text-gray-600">A stable internet connection is required. Compatible device and updated browser.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents & Records */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Download className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Documents & Records</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">12</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">After successful payment, system generates a Preparatory Hall Ticket and a Digital Payment Receipt.</h3>
                  <p className="text-gray-600">Documents can be downloaded as PDF for reference.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">13</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">These documents are system-generated and for preparation use only.</h3>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">14</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fair Use & Misuse Policy</h3>
                  <p className="text-gray-600">Sharing hall tickets, access links, or test content is prohibited.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Disclaimer */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
              <h2 className="text-xl font-bold text-red-900">Final Disclaimer</h2>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-red-900 mb-4">This preparatory test is not designed to comfort you.</h3>
                <p className="text-red-700 mb-4">It is designed to expose weaknesses before the real exam does.</p>
                <p className="text-red-700 mb-4">If you are here to practice honestly, proceed.</p>
                <p className="text-red-700 mb-4">If you are here to "just try", reconsider.</p>
              </div>
              
              <div className="text-center mt-6">
                <h3 className="font-bold text-red-900 mb-4">Universities and scholarship bodies determine their own admission criteria.</h3>
                <p className="text-red-700">This preparatory platform prepares you — it does not decide for you.</p>
                <p className="text-red-700">Candidates must independently verify official CSCA requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
