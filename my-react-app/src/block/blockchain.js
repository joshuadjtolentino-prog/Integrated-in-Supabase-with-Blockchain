import { ethers } from 'ethers';

// 1. Paste your Contract Address and ABI here from Remix
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const ABI = [ /* PASTE YOUR COPIED ABI ARRAY HERE */ ];

export const syncPWDToBlockchain = async (pwdData) => {
  try {
    // 2. Check if MetaMask (or another wallet) is installed
    if (!window.ethereum) {
      throw new Error("Please install MetaMask to sync data.");
    }

    // 3. Connect to the blockchain via the user's wallet
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Request account access if needed
    await provider.send("eth_requestAccounts", []);
    
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // 4. Create the Data Hash (Privacy Fingerprint)
    // We combine: Full Name + Age + Gender + Certificate ID
    const dataString = `${pwdData.fullname}${pwdData.age}${pwdData.gender}${pwdData.certificate_id}`;
    
    // Use ethers.utils.id to create a Keccak256 hash
    const dataHash = ethers.utils.id(dataString); 

    console.log("Generated Hash:", dataHash);

    // 5. Call the 'syncPWD' function in your Smart Contract
    const tx = await contract.syncPWD(pwdData.certificate_id, dataHash);
    
    // 6. Wait for the transaction to be mined on the block
    const receipt = await tx.wait();
    
    return { 
      success: true, 
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber 
    };

  } catch (error) {
    console.error("Blockchain Sync Error:", error);
    return { 
      success: false, 
      error: error.reason || error.message || "Transaction failed" 
    };
  }
};