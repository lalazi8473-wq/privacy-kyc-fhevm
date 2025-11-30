import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
            <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy KYC Verification
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Verify your age and identity <span className="font-semibold text-indigo-600 dark:text-indigo-400">without revealing personal information</span> using Fully Homomorphic Encryption
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🔒 Zero Knowledge
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your personal data never leaves your device in plaintext. All verification happens on encrypted data.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ⚡ Fast & Secure
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Powered by FHEVM v0.9, providing military-grade encryption with instant verification.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🌐 Decentralized
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built on Ethereum Sepolia testnet. No centralized authority can access your data.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            How It Works
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Submit Encrypted Identity</h4>
                  <p className="text-gray-600 dark:text-gray-400">Enter your age and gender. Data is encrypted on your device before submission.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">FHE Verification</h4>
                  <p className="text-gray-600 dark:text-gray-400">Smart contract verifies KYC rules (age ≥ 18, gender = male) on encrypted data.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Decrypt Result</h4>
                  <p className="text-gray-600 dark:text-gray-400">Only you can decrypt and view whether you passed the KYC verification.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/dapp"
            className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            🚀 Launch DApp
          </Link>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Requires MetaMask or compatible Web3 wallet
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">Powered by <span className="font-semibold">FHEVM v0.9</span> | Built on <span className="font-semibold">Sepolia Testnet</span></p>
          <p className="text-sm">
            Contract: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
              0xe53d5593...70e
            </code>
          </p>
        </footer>
      </div>
    </div>
  )
}

