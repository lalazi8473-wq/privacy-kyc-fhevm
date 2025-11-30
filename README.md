# Privacy KYC Verification Platform

> Built with FHEVM v0.9 - Zero-Knowledge Identity Verification

## 🌟 Overview

A privacy-preserving KYC verification platform that uses Fully Homomorphic Encryption (FHE) to verify user identity without revealing personal information. Users submit encrypted age and gender data, and the smart contract verifies KYC rules (age ≥ 18, gender = male) on encrypted data without ever seeing the plaintext.

## ✨ Features

- 🔒 **Zero Knowledge**: Personal data never leaves your device in plaintext
- ⚡ **Fast & Secure**: Powered by FHEVM v0.9 with military-grade encryption
- 🌐 **Decentralized**: Built on Ethereum Sepolia testnet
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- 🔓 **Client-Side Decryption**: Only you can decrypt verification results

## 🏗️ Architecture

### Smart Contract
- **Name**: KYCVerification
- **Network**: Sepolia Testnet
- **Address**: `0xe53d5593373D0E3e3970B96d7aa52f9417C4e70e`
- **Framework**: FHEVM v0.9 (Solidity 0.8.24)

### Frontend
- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS
- **Wallet**: RainbowKit + Wagmi
- **FHE SDK**: Zama Relayer SDK v0.3.0-5

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd zama-5

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Deploy Smart Contract

```bash
# Compile contracts
cd packages/hardhat
pnpm compile

# Deploy to Sepolia
pnpm deploy
```

## 📖 How It Works

### 1. Submit Encrypted Identity
Users enter age and gender. Data is encrypted on the client side using FHEVM before submission.

### 2. FHE Verification
The smart contract performs verification on encrypted data:
- Check if age ≥ 18
- Check if gender = male (1)
- Returns encrypted result (1 = passed, 0 = failed)

### 3. Decrypt Result
Only the user can decrypt the result using `userDecrypt` with EIP-712 signature.

## 🔐 Privacy Guarantees

- ✅ Age and gender are encrypted before leaving your device
- ✅ Smart contract only sees encrypted data
- ✅ Only you can decrypt verification results
- ✅ No centralized authority can access your information
- ✅ All computation happens on encrypted data (FHE)

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.24, FHEVM v0.9 |
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Wallet | RainbowKit, Wagmi, Viem |
| FHE SDK | Zama Relayer SDK v0.3.0-5 |
| Network | Ethereum Sepolia Testnet |

## 📁 Project Structure

```
zama-5/
├── packages/
│   ├── hardhat/                 # Smart contracts
│   │   ├── contracts/
│   │   │   └── KYCVerification.sol
│   │   ├── scripts/
│   │   │   └── deploy.ts
│   │   └── hardhat.config.ts
│   └── nextjs-showcase/         # Frontend DApp
│       ├── app/
│       │   ├── page.tsx         # Landing page
│       │   ├── dapp/
│       │   │   └── page.tsx     # Main DApp
│       │   └── layout.tsx       # Root layout
│       ├── components/
│       │   ├── Providers.tsx
│       │   └── ClientProviders.tsx
│       └── utils/
│           ├── wallet.ts
│           └── contractABI.ts
├── WINNING_FORMULA.md           # Development guide
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Hardhat (`packages/hardhat/.env`)
```env
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_key
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}
```

#### Frontend (`packages/nextjs-showcase/.env.local`)
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe53d5593373D0E3e3970B96d7aa52f9417C4e70e
NEXT_PUBLIC_CHAIN_ID=11155111
```

## 🧪 Testing

### Local Testing
1. Connect MetaMask to Sepolia testnet
2. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Visit `http://localhost:3000`
4. Click "Launch DApp"
5. Connect wallet
6. Submit identity (try: age=28, gender=male)
7. Wait for transaction confirmation
8. Wait 30 seconds for permission sync
9. Click "Decrypt Verification Result"
10. View result (✅ = passed, ❌ = failed)

### Test Cases

| Age | Gender | Expected Result |
|-----|--------|-----------------|
| 28  | Male   | ✅ Pass         |
| 15  | Male   | ❌ Fail (age)   |
| 28  | Female | ❌ Fail (gender)|
| 15  | Female | ❌ Fail (both)  |

## 🐛 Troubleshooting

### FHEVM Initialization Issues
- Ensure you're using the correct SDK version (v0.3.0-5)
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- Try incognito mode to avoid wallet conflicts

### Decryption 500 Error
- Wait full 30 seconds after transaction confirmation
- Automatic retry mechanism will attempt 3 times
- Check console logs for detailed error messages

### CORS Errors
- Verify `vercel.json` has correct headers
- Restart development server after config changes
- Clear browser cache

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.org/fhevm)
- [Development Guide](./WINNING_FORMULA.md) - Comprehensive guide with best practices
- [Contract on Etherscan](https://sepolia.etherscan.io/address/0xe53d5593373D0E3e3970B96d7aa52f9417C4e70e)

## 🎯 Roadmap

- [x] FHEVM v0.9 integration
- [x] Basic KYC verification (age + gender)
- [x] Client-side encryption/decryption
- [x] Modern responsive UI
- [ ] Custom KYC rules configuration
- [ ] Multiple identity profiles
- [ ] Verification history
- [ ] Cross-chain deployment

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [FHEVM](https://github.com/zama-ai/fhevm) by Zama
- Based on [WINNING_FORMULA.md](./WINNING_FORMULA.md) best practices
- Inspired by the need for privacy-preserving identity verification

---

**Made with ❤️ using Fully Homomorphic Encryption**

