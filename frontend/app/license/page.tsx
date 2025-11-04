export default function License() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Proprietary License</h1>
          <p className="text-sm text-slate-500 mb-8">X Profile Cards - Closed Source Software</p>

          <div className="bg-amber-50 rounded-lg p-6 mb-8 border border-amber-200">
            <p className="text-sm font-medium text-amber-900">
              ⚠️ This is proprietary software. Unauthorized copying, modification, or distribution is prohibited.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
            <pre className="text-xs sm:text-sm text-slate-700 overflow-x-auto whitespace-pre-wrap">
{`PROPRIETARY LICENSE AGREEMENT

Copyright © 2025 Siddhesh Kamath. All rights reserved.

This software is proprietary and confidential. Unauthorized 
copying, modification, distribution, or use is prohibited.

TERMS AND CONDITIONS:

1. OWNERSHIP
   The Software is owned exclusively by Siddhesh Kamath.

2. RESTRICTED USE
   - Non-commercial, personal use only
   - NO modification or reverse engineering
   - NO distribution, selling, or leasing
   - NO public disclosure of source code

3. INTELLECTUAL PROPERTY
   All rights remain the sole property of Siddhesh Kamath.

4. NO WARRANTIES
   THE SOFTWARE IS PROVIDED "AS IS" WITHOUT ANY WARRANTIES.

5. LIABILITY
   THE AUTHOR IS NOT LIABLE FOR ANY DAMAGES OR CLAIMS.

6. TERMINATION
   License terminates automatically on violation.

7. GOVERNING LAW
   Governed by the laws of India.`}
            </pre>
          </div>

          <div className="prose prose-sm sm:prose max-w-none text-slate-700 space-y-6">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What You CANNOT Do</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Copy or distribute the source code</li>
                <li>Modify or create derivative works</li>
                <li>Reverse engineer or decompile</li>
                <li>Use for commercial purposes</li>
                <li>Sell or lease the software</li>
                <li>Public disclosure of algorithms or code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What You CAN Do</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Use the service for personal, non-commercial purposes</li>
                <li>Create cards and export images</li>
                <li>Share your generated cards on social media</li>
                <li>Report bugs or suggest features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property Rights</h2>
              <p>
                All intellectual property rights, including patents, trademarks, copyrights, and trade secrets 
                related to X Profile Cards are the exclusive property of Siddhesh Kamath. Unauthorized use of these 
                rights is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Licensing Inquiries</h2>
              <p>
                For commercial licensing, partnerships, or other inquiries, please contact:
              </p>
              <p className="mt-3 font-medium">
                Email:{' '}
                <a href="mailto:siddheshkamath40@gmail.com" className="text-blue-600 hover:underline">
                  siddheshkamath40@gmail.com
                </a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}