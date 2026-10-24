import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Mesca CL',
  description: 'Privacy policy for Mesca CL personal website.',
};

export default async function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Information We Collect</h2>
          <p>We collect information that you provide voluntarily through our website forms, including but not limited to:</p>
          <ul>
            <li>Name and email address when contacting us</li>
            <li>Profile information including name, bio, and profile image</li>
            <li>Phone and WhatsApp numbers for contact features</li>
            <li>Location information (optional)</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li>To provide and maintain the website functionality</li>
            <li>To improve user experience and content</li>
            <li>To respond to your inquiries and requests</li>
            <li>To display your profile information publicly on the website</li>
            <li>To administer the website and analyze usage</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Data Storage and Security</h2>
          <p>Your data is stored securely and accessed only by authorized personnel. We implement appropriate technical and organizational measures to protect your information.</p>
          <p>Profile data and project information are stored in a SQLite database. Financial contribution data is handled securely through appropriate payment processors.</p>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of certain data processing activities</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify users of any changes by posting the new privacy policy on this page.</p>
        </div>
      </div>
    </div>
  );
}