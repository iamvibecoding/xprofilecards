export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: November 2, 2025</p>

          <div className="prose prose-sm sm:prose max-w-none text-slate-700 space-y-6">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p>
                X Profile Cards ("we", "us", "our", or "Company") operates the xprofilecards.com website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information Collection and Use</h2>
              <p>We collect information for various purposes to provide and improve our Service:</p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li><strong>X.com Profile Data:</strong> When you enter an X profile URL, we temporarily fetch public profile information (name, handle, bio, followers count, avatar) to generate your card. This data is not stored.</li>
                <li><strong>Technical Data:</strong> We collect IP addresses, browser type, and request logs for security and analytics purposes.</li>
                <li><strong>Cookies:</strong> We use cookies to enhance your experience. You can control cookie settings through your browser.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Use of Data</h2>
              <p>X Profile Cards uses the collected data for various purposes:</p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service</li>
                <li>To provide customer care and support</li>
                <li>To gather analysis or valuable information so we can improve our Service</li>
                <li>To monitor the usage of our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Security of Data</h2>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-3 font-medium">
                Email: <a href="mailto:hello@xprofilecards.com" className="text-blue-600 hover:underline">hello@xprofilecards.com</a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}