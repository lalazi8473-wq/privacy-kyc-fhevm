'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers, BrowserProvider } from 'ethers';
import { getWalletProvider } from '@/utils/wallet';
import { CONTRACT_ABI } from '@/utils/contractABI';
import Link from 'next/link';

const CONTRACT_ADDRESS = '0xe53d5593373D0E3e3970B96d7aa52f9417C4e70e';

// FHEVM v0.9 配置（7个必需参数）
const FHEVM_CONFIG = {
  chainId: 11155111,  // Sepolia
  aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
  kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
  inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
  verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
  verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
  gatewayChainId: 10901,
  relayerUrl: 'https://relayer.testnet.zama.org',
};

export default function DAppPage() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form inputs
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [hasSubmittedIdentity, setHasSubmittedIdentity] = useState(false);
  const [canDecrypt, setCanDecrypt] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  
  // 防止重复初始化
  const isInitializingRef = useRef(false);

  // ==================== FHEVM 初始化 ====================
  useEffect(() => {
    if (!isConnected || !address || !walletClient || isInitializingRef.current || fhevmInstance) {
      return;
    }

    const initFhevm = async () => {
      isInitializingRef.current = true;
      setIsInitializing(true);
      setError(null);

      try {
        if (!(window as any).relayerSDK) {
          throw new Error('Relayer SDK not loaded');
        }

        // 初始化 SDK
        await (window as any).relayerSDK.initSDK();

        // 获取 provider
        let provider = getWalletProvider();
        
        if (!provider && walletClient) {
          provider = walletClient;
        }
        
        if (!provider) {
          throw new Error('No wallet provider found');
        }

        // 创建 FHEVM 实例
        const instance = await (window as any).relayerSDK.createInstance({
          ...FHEVM_CONFIG,
          network: provider,
        });

        setFhevmInstance(instance);
        console.log('✅ FHEVM initialized successfully');
      } catch (e: any) {
        setError(e.message);
        console.error('❌ FHEVM init failed:', e);
        isInitializingRef.current = false;
      } finally {
        setIsInitializing(false);
      }
    };

    initFhevm();
  }, [isConnected, address, walletClient, fhevmInstance]);

  // ==================== 提交加密身份 ====================
  const handleSubmitIdentity = async () => {
    if (!fhevmInstance || !walletClient || !age) {
      alert('请填写完整信息');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('🔐 开始加密身份信息...');
      
      // 加密年龄
      const inputAge = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      inputAge.add32(parseInt(age));
      const encryptedAge = await inputAge.encrypt();
      
      // 加密性别 (0=female, 1=male)
      const genderValue = gender === 'male' ? 1 : 0;
      const inputGender = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      inputGender.add32(genderValue);
      const encryptedGender = await inputGender.encrypt();

      console.log('✅ 加密完成，准备提交到合约...');

      // 创建 provider 和 signer
      const provider = new BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // 提交到合约
      const tx = await contract.submitIdentity(
        encryptedAge.handles[0],
        encryptedGender.handles[0],
        encryptedAge.inputProof,
        encryptedGender.inputProof
      );

      console.log('⏳ 等待交易确认...', tx.hash);
      await tx.wait();
      
      console.log('✅ 交易确认成功！');
      setHasSubmittedIdentity(true);
      
      // 开始倒计时（权限同步）
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanDecrypt(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (e: any) {
      console.error('❌ 提交失败:', e);
      setError(e.message || '提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== 解密结果 ====================
  const handleDecryptResult = async (retryCount = 0) => {
    if (!fhevmInstance || !walletClient) return;

    setIsDecrypting(true);
    setError(null);

    try {
      console.log('🔓 开始解密结果...');

      const provider = new BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // 获取加密结果
      const encryptedHandle = await contract.getMyResult();
      console.log('📦 获取到加密句柄:', encryptedHandle);

      // 生成密钥对
      const keypair = fhevmInstance.generateKeypair();
      
      const handleContractPairs = [
        { handle: encryptedHandle, contractAddress: CONTRACT_ADDRESS }
      ];
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];
      
      // 创建 EIP-712 签名
      const eip712 = fhevmInstance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );
      
      const typesWithoutDomain = { ...eip712.types };
      delete typesWithoutDomain.EIP712Domain;
      
      console.log('✍️ 请求签名...');
      const signature = await signer.signTypedData(
        eip712.domain,
        typesWithoutDomain,
        eip712.message
      );
      console.log('✅ 签名成功');
      
      console.log('🔓 调用 userDecrypt...');
      console.log('⏳ 这可能需要 30-60 秒...');
      
      const decryptedResults = await fhevmInstance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );
      
      const decryptedValue = decryptedResults[encryptedHandle];
      console.log('✅ 解密成功！结果:', decryptedValue);
      
      setResult(Number(decryptedValue));
    } catch (e: any) {
      console.error('❌ 解密失败:', e);
      
      // 如果是 500 错误，自动重试最多 3 次
      if (e.message?.includes('500') && retryCount < 3) {
        const waitTime = (retryCount + 1) * 10;
        console.log(`⚠️ 重试 ${retryCount + 1}/3，等待 ${waitTime} 秒...`);
        setError(`权限同步中，自动重试 ${retryCount + 1}/3...`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        return handleDecryptResult(retryCount + 1);
      }
      
      setError(e.message || '解密失败，请稍后重试');
    } finally {
      setIsDecrypting(false);
    }
  };

  // ==================== UI 渲染 ====================
  
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect your Web3 wallet to continue
          </p>
          <ConnectButton />
          <Link 
            href="/"
            className="block mt-6 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Initializing FHEVM...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error && !fhevmInstance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Initialization Error</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <ConnectButton />
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Privacy KYC Verification
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Submit your encrypted identity for verification
          </p>

          {/* FHEVM Status */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">FHEVM Ready</span>
            </div>
          </div>

          {!hasSubmittedIdentity ? (
            <>
              {/* Form */}
              <div className="space-y-6 mb-6">
                {/* Age Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Gender Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your Gender
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setGender('male')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        gender === 'male'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      👨 Male
                    </button>
                    <button
                      onClick={() => setGender('female')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        gender === 'female'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      👩 Female
                    </button>
                  </div>
                </div>

                {/* KYC Rules Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    📋 KYC Requirements
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>✓ Age must be ≥ 18 years old</li>
                    <li>✓ Gender must be Male</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitIdentity}
                disabled={isSubmitting || !age}
                className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Encrypting & Submitting...
                  </span>
                ) : (
                  '🔐 Submit Encrypted Identity'
                )}
              </button>
            </>
          ) : (
            <>
              {/* Waiting for Permissions */}
              {countdown > 0 && (
                <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center">
                  <div className="text-4xl mb-2">{countdown}</div>
                  <p className="text-yellow-800 dark:text-yellow-300 font-semibold">
                    ⏳ Syncing Permissions...
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                    Please wait while the relayer synchronizes your decryption permissions
                  </p>
                </div>
              )}

              {/* Decrypt Button */}
              {canDecrypt && result === null && (
                <button
                  onClick={() => handleDecryptResult()}
                  disabled={isDecrypting}
                  className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isDecrypting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Decrypting... (30-60s)
                    </span>
                  ) : (
                    '🔓 Decrypt Verification Result'
                  )}
                </button>
              )}

              {/* Result Display */}
              {result !== null && (
                <div className={`p-8 rounded-2xl text-center ${
                  result === 1
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="text-6xl mb-4">
                    {result === 1 ? '✅' : '❌'}
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    result === 1
                      ? 'text-green-900 dark:text-green-300'
                      : 'text-red-900 dark:text-red-300'
                  }`}>
                    {result === 1 ? 'KYC Verification Passed!' : 'KYC Verification Failed'}
                  </h3>
                  <p className={`${
                    result === 1
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    {result === 1
                      ? 'Your encrypted identity meets all KYC requirements.'
                      : 'Your encrypted identity does not meet the KYC requirements (Age ≥ 18 and Gender = Male).'}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    Submit New Identity
                  </button>
                </div>
              )}
            </>
          )}

          {/* Error Display */}
          {error && hasSubmittedIdentity && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            🔒 Privacy Guarantee
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Your age and gender are encrypted on your device before submission</li>
            <li>• The smart contract only sees encrypted data, never plaintext</li>
            <li>• Only you can decrypt and view the verification result</li>
            <li>• No centralized authority can access your personal information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 禁用静态生成
export const dynamic = 'force-dynamic';

