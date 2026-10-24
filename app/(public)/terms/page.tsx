import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Mesca CL',
  description: 'Terms of service for Mesca CL personal website.',
};

export default async function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-8">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Acceptance of Terms</h2>
          <p>By accessing and using the Mesca CL website (the &quot;Site&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Site.</p>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Use of the Website</h2>
          <p>You agree to use the Site only for lawful purposes and in accordance with these Terms. You are responsible for:</p>
          <ul>
            <li>Maintaining the security of any account credentials</li>
            <li>Providing accurate and complete information when using the Site</li>
            <li>Complying with all applicable laws and regulations in your jurisdiction</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">User Generated Content</h2>
          <p>The Site allows users to submit projects, profiles, and other content. By submitting content, you grant Mesca CL a non-exclusive, royalty-free license to display, modify, and distribute your content in connection with the Site. You retain all other rights to your content.</p>
          <p>We reserve the right to remove any content that, in our sole discretion, violates these Terms or is otherwise objectionable.</p>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Intellectual Property</h2>
          <p>The original content, features, functionality, and design of the Site are owned by Mesca CL and are protected by international copyright, trademark, patent, trade dress, and other intellectual property laws. The Site and its original content are expressly permitted.</p>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Links to Third-Party Sites</h2>
          <p>The Site may contain links to third-party websites or services that are not owned or controlled by Mesca CL. Mesca CL has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that Mesca CL is not responsible or liable for any content, accuracy, quality, advertising, products, or other materials available on third-party sites.</p>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Termination</h2>
          <p>Mesca CL may terminate or suspend your access to the Site immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Site will cease immediately.</p>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Disclaimer</h2>
          <p>The Site is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Mesca CL makes no representations or warranties of any kind, express or implied, regarding the operation of the Site or the information, content, materials, or products included on the Site. You agree that your use of the Site is at your sole risk.</p>

          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.</p>
        </div>
      </div>
    </div>
  );
}