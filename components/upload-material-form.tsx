"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload, FileText, Video, AlertTriangle, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useWallet } from "@/hooks/use-wallet"
import { 
  listMaterial, 
  listMaterialOnChainDebug, 
  debugListMaterial, 
  listMaterialWithFallback,
  verifyContractFunctions 
} from "@/lib/blockchain"
import { verifyContract, checkUserBalance, checkNetwork, switchToCorrectNetwork, testContractConnection, canUploadMaterials, getProvider, getContract, testContractVersion, getCurrentContractAddress } from "@/lib/contract"
import { toast } from "@/hooks/use-toast"
import { pinFileToIPFS } from "@/lib/pinning-service"
import { TestContractResult } from "@/lib/contract-types"

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    },
    { message: "Price must be a non-negative number" }
  ),
})

export default function UploadMaterialForm() {
  const { currentAccount, connect } = useWallet()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pinningProgress, setPinningProgress] = useState(0)
  const [isVerifyingContract, setIsVerifyingContract] = useState(false)
  const [contractVerified, setContractVerified] = useState<boolean | null>(null)
  const [userBalance, setUserBalance] = useState<string | null>(null)
  const [hasEnoughBalance, setHasEnoughBalance] = useState<boolean | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean | null>(null)
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const [isTestingContract, setIsTestingContract] = useState(false)
  const [contractTestResult, setContractTestResult] = useState<any>(null)
  const [isTestingSimplified, setIsTestingSimplified] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [canUpload, setCanUpload] = useState<boolean | null>(null)
  const [isCheckingUploadRights, setIsCheckingUploadRights] = useState(false)
  const [contractType, setContractType] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "0.05",
    },
  })

  useEffect(() => {
    const checkContractAndNetwork = async () => {
      setIsVerifyingContract(true)
      try {
        const networkCheck = await checkNetwork();
        setIsCorrectNetwork(networkCheck.isCorrectNetwork);
        setCurrentNetwork(networkCheck.currentNetwork);
        
        if (!networkCheck.isCorrectNetwork) {
          toast({
            title: "Wrong Network",
            description: `You are connected to ${networkCheck.currentNetwork}. Please switch to Sepolia testnet.`,
            variant: "destructive",
          });
          setIsVerifyingContract(false);
          return;
        }
        
        const isVerified = await verifyContract()
        setContractVerified(isVerified)
        if (!isVerified) {
          toast({
            title: "Contract Verification Failed",
            description: "There might be an issue with the contract connection. Check the console for details.",
            variant: "destructive",
          })
        }
        
        const { hasBalance, balance } = await checkUserBalance()
        setUserBalance(balance)
        setHasEnoughBalance(hasBalance)
        if (!hasBalance) {
          toast({
            title: "Low Balance",
            description: `Your wallet balance (${balance} ETH) might not be enough to cover gas fees. Consider adding more ETH.`,
            variant: "destructive",
          })
        }

        // Detect contract type
        await detectContractType();

        // Check if user can upload materials
        setIsCheckingUploadRights(true);
        try {
          const canUploadResult = await canUploadMaterials();
          setCanUpload(canUploadResult);
          
          if (!canUploadResult) {
            if (contractType === "SchoolLibrary") {
              toast({
                title: "School Library Mode",
                description: "This contract is configured as a School Library. Only the administrator can upload materials.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Upload Restricted",
                description: "Your account does not have permission to upload materials. The contract may restrict uploads to approved users only.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Error checking upload rights:", error);
          // Default to allowing uploads if we can't determine
          setCanUpload(true);
        } finally {
          setIsCheckingUploadRights(false);
        }
      } catch (error) {
        console.error("Error verifying contract or checking network:", error)
        setContractVerified(false)
      } finally {
        setIsVerifyingContract(false)
      }
    }

    if (currentAccount) {
      checkContractAndNetwork()
    }
  }, [currentAccount])

  // New function to detect contract type with better error handling
  const detectContractType = async () => {
    try {
      setIsCheckingUploadRights(true);
      const provider = getProvider();
      if (!provider) {
        console.error("Provider not available");
        setContractType("Unknown");
        return;
      }
      
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not available");
        setContractType("Unknown");
        return;
      }
      
      // Try to determine contract type
      let detectedType = "Unknown";
      let adminAddress = null;
      
      // Check if this is a school library contract
      const hasIsApprovedCreator = typeof contract.isApprovedCreator === 'function';
      
      if (hasIsApprovedCreator) {
        detectedType = "SchoolLibrary";
        console.log("Detected contract type: School Library");
        
        // Check if current user is the admin
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        
        try {
          // Try to get platformFeeRecipient (admin address)
          if (typeof contract.platformFeeRecipient === 'function') {
            adminAddress = await contract.platformFeeRecipient();
            console.log("Admin address:", adminAddress);
          }
          
          const isAdmin = await contract.isApprovedCreator(userAddress);
          console.log(`User is${isAdmin ? '' : ' not'} the admin of the School Library contract`);
          
          // Force check upload permissions
          const canUploadResult = await canUploadMaterials();
          setCanUpload(canUploadResult);
          
          if (!canUploadResult && isAdmin) {
            // This is a serious error - the user should be able to upload but can't
            console.error("Critical permission mismatch: User is admin but canUploadMaterials returned false");
            toast({
              title: "Permission Error",
              description: "You appear to be the admin but upload permissions are restricted. Please enable debug mode and try the permission check.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      } else {
        // Check for StudyMarketplace characteristics
        try {
          // First try the safer version testing function
          const versionTest = await testContractVersion();
          console.log("Contract version test result:", versionTest);
          
          if (versionTest.success) {
            detectedType = "StudyMarketplace";
            console.log("Detected contract type via version test: StudyMarketplace");
          } else {
            // Try alternate detection method by function presence
            if (typeof contract.getActiveMaterials === 'function' && 
                typeof contract.purchaseMaterial === 'function') {
              detectedType = "StudyMarketplace";
              console.log("Detected contract type by function presence: StudyMarketplace");
            }
          }
            
          // Force check upload permissions for marketplace too
          const canUploadResult = await canUploadMaterials();
          setCanUpload(canUploadResult);
          
          if (!canUploadResult && detectedType === "StudyMarketplace") {
            // This is unexpected - regular marketplace should allow uploads
            console.error("Unexpected permission restriction in StudyMarketplace");
            toast({
              title: "Permission Warning",
              description: "Upload appears to be restricted in a standard marketplace. Enable debug mode to troubleshoot.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error detecting contract type:", error);
        }
      }
      
      // Set the detected contract type
      setContractType(detectedType);
      
    } catch (error) {
      console.error("Error in contract type detection:", error);
      setContractType("Unknown");
    } finally {
      setIsCheckingUploadRights(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setFileError(null)

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setFileError("File size exceeds 50MB limit")
      setFile(null)
      return
    }

    const fileType = selectedFile.type
    if (!fileType.includes("pdf") && !fileType.includes("video")) {
      setFileError("Only PDF and video files are supported")
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const getFileTypeIcon = () => {
    if (!file) return null
    
    if (file.type.includes("pdf")) {
      return <FileText className="h-6 w-6 text-blue-500" />
    } else if (file.type.includes("video")) {
      return <Video className="h-6 w-6 text-red-500" />
    }
    
    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!currentAccount) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to list a material",
          variant: "destructive",
        })
        return
      }

      if (canUpload === false) {
        toast({
          title: "Upload Restricted",
          description: "Your account does not have permission to upload materials.",
          variant: "destructive",
        })
        return
      }

      const networkCheck = await checkNetwork();
      if (!networkCheck.isCorrectNetwork) {
        toast({
          title: "Wrong Network",
          description: `You are connected to ${networkCheck.currentNetwork}. Please switch to the correct network.`,
          variant: "destructive",
        });
        return;
      }

      if (contractVerified === false) {
        toast({
          title: "Contract Not Verified",
          description: "The smart contract could not be verified. Please check your connection and try again.",
          variant: "destructive",
        })
        return
      }

      if (hasEnoughBalance === false) {
        toast({
          title: "Insufficient Balance",
          description: `Your wallet balance (${userBalance} ETH) is too low to cover gas fees. Please add more ETH to your wallet.`,
          variant: "destructive",
        })
        return
      }

      if (!file) {
        setFileError("Please select a file to upload")
        return
      }

      setIsUploading(true)
      setUploadProgress(10)

      let contentHash = ""
      try {
        setUploadProgress(30)
        setPinningProgress(20)
        
        const contentResponse = await pinFileToIPFS(file, (progress) => {
          setPinningProgress(20 + Math.floor(progress * 0.6))
        })
        
        contentHash = contentResponse.url
        
        setUploadProgress(70)
        setPinningProgress(80)
        
        toast({
          title: "Content Pinned Successfully",
          description: "Your content has been pinned to IPFS and is ready to be listed.",
        });
      } catch (error) {
        console.error("Error pinning to IPFS:", error);
        throw new Error("Failed to pin content to IPFS");
      }

      // Generate a random preview hash for testing
      const previewHash = `ipfs://Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      try {
        console.log("Listing material with parameters:", {
          title: values.title,
          description: values.description,
          category: values.category,
          contentHash,
          previewHash,
          price: values.price
        });

        const verifyResult = await verifyContractFunctions();
        if (!verifyResult.success) {
          toast({
            title: "Contract Verification Failed",
            description: verifyResult.error || "Could not verify contract functions. Proceeding with caution.",
            variant: "destructive",
          });
        }

        if (verifyResult.warning) {
          toast({
            title: "Contract Warning",
            description: verifyResult.warning,
          });
        }

        toast({
          title: "Submitting to Blockchain",
          description: "Attempting to list your material on the blockchain. This may take a moment...",
        });

        const result = await listMaterialWithFallback(
          values.title,
          values.description,
          values.category,
          contentHash,
          previewHash,
          values.price
        );

        if (typeof result === 'object' && result !== null) {
          if (result.success) {
            toast({
              title: "Material Listed Successfully",
              description: `Your study material has been pinned to IPFS and listed on the marketplace with ID: ${result.materialId}`,
            });
            
            form.reset();
            setFile(null);
          } else {
            throw new Error(result.error || "Failed to list material on the blockchain");
          }
        } else if (result !== null) {
          toast({
            title: "Material Listed Successfully",
            description: `Your study material has been pinned to IPFS and listed on the marketplace with ID: ${result}`,
          });
          
          form.reset();
          setFile(null);
        } else {
          throw new Error("Failed to list material on the blockchain");
        }
      } catch (error: any) {
        console.error("Error listing material on blockchain:", error);
        let txErrorMessage = "You don't have permission to upload materials, or there was an error in the transaction.";
        
        // Check for specific errors related to newly deployed contracts
        if (error.message) {
          console.log("Detailed error:", error.message);
          
          if (error.message.includes("transaction failed") || 
              error.message.includes("reverted") || 
              error.message.includes("execution reverted")) {
            
            // Add a more helpful message for newly deployed contracts
            txErrorMessage = "Transaction failed. If you're using a newly deployed contract, make sure:";
            txErrorMessage += "\n1. You're using the same wallet that deployed the contract";
            txErrorMessage += "\n2. You're on the correct network";
            txErrorMessage += "\n3. The contract was deployed with the complete bytecode";
            
            // Suggest checking platform fee recipient
            toast({
              title: "Contract Ownership Check",
              description: "Checking if your wallet is the platform fee recipient...",
            });
            
            // Add a slight delay to show the toast before the async call
            setTimeout(async () => {
              try {
                const contract = await getContract();
                if (contract) {
                  const feeRecipient = await contract.platformFeeRecipient();
                  const currentWallet = currentAccount;
                  
                  console.log("Contract fee recipient:", feeRecipient);
                  console.log("Current wallet:", currentWallet);
                  
                  if (feeRecipient.toLowerCase() !== currentWallet.toLowerCase()) {
                    toast({
                      title: "Permission Issue",
                      description: `Your current wallet (${currentWallet.slice(0,6)}...${currentWallet.slice(-4)}) is NOT the platform fee recipient of this contract. The fee recipient is ${feeRecipient.slice(0,6)}...${feeRecipient.slice(-4)}`,
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Wallet is Fee Recipient",
                      description: "Your wallet is the platform fee recipient, so you should be able to list materials. The error might be caused by something else.",
                    });
                  }
                }
              } catch (checkError) {
                console.error("Error checking fee recipient:", checkError);
              }
            }, 500);
          }
          
          txErrorMessage += ` Error: ${error.message}`;
        }
        
        toast({
          title: "Blockchain Transaction Failed",
          description: txErrorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading material:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your material. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setPinningProgress(0);
    }
  }

  const handleConnectWallet = async () => {
    try {
      await connect()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Wallet Connection Failed",
        description: "Please make sure MetaMask is installed and try again.",
        variant: "destructive",
      })
    }
  }

  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true)
    try {
      const success = await switchToCorrectNetwork()
      if (success) {
        toast({
          title: "Network Switched",
          description: "Successfully switched to Sepolia testnet.",
        })
        window.location.reload()
      } else {
        toast({
          title: "Network Switch Failed",
          description: "Failed to switch to Sepolia testnet. Please try manually switching in your wallet.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error switching network:", error)
      toast({
        title: "Network Switch Error",
        description: "An error occurred while trying to switch networks.",
        variant: "destructive",
      })
    } finally {
      setIsSwitchingNetwork(false)
    }
  }

  const handleTestContract = async () => {
    setIsTestingContract(true);
    try {
      const result = await testContractConnection();
      setContractTestResult(result);
      
      if (result.success) {
        toast({
          title: "Contract Test Successful",
          description: result.message,
        });
      } else {
        toast({
          title: "Contract Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
      console.log('Contract test result:', result);
    } catch (error) {
      console.error('Error testing contract:', error);
      toast({
        title: "Contract Test Error",
        description: "An unexpected error occurred while testing the contract.",
        variant: "destructive",
      });
    } finally {
      setIsTestingContract(false);
    }
  };

  const handleTestSimplified = async () => {
    setIsTestingSimplified(true);
    try {
      const networkCheck = await checkNetwork();
      if (!networkCheck.isCorrectNetwork) {
        toast({
          title: "Wrong Network",
          description: `You are connected to ${networkCheck.currentNetwork}. Please switch to the correct network.`,
          variant: "destructive",
        });
        setIsTestingSimplified(false);
        return;
      }

      toast({
        title: "Testing Contract",
        description: "Attempting to list a material with simplified parameters...",
      });

      const result = await listMaterialOnChainDebug(
        "Test Title",
        "Test Description",
        "Test",
        "ipfs://test-content-hash",
        "ipfs://test-preview-hash",
        "0.01"
      );

      if (result !== null) {
        toast({
          title: "Test Successful",
          description: `Successfully listed test material with ID: ${result}`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Failed to list test material. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error testing with simplified parameters:", error);
      toast({
        title: "Test Error",
        description: error.message || "An error occurred during the test",
        variant: "destructive",
      });
    } finally {
      setIsTestingSimplified(false);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const testContractVersionOnClick = async () => {
    try {
      const result = await testContractVersion();
      console.log("Contract version test result:", result);
      
      toast({
        title: `Contract Version Test: ${result.success ? "Success" : "Failed"}`,
        description: `Version: ${result.version || "N/A"}${result.details ? "\nDetails available in console" : ""}`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error testing contract version:", error);
      toast({
        title: "Contract Version Test Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };

  // Update the display message for upload permissions
  const getUploadRestrictionMessage = () => {
    if (contractType === "SchoolLibrary") {
      return "This contract is configured as a School Library. Only the administrator can upload materials.";
    } else if (contractType === "StudyMarketplace") {
      return "Your account does not have permission to upload materials. This is unexpected for a standard marketplace. Please contact support or enable debug mode to troubleshoot.";
    } else {
      return "Your account does not have permission to upload materials. The contract type could not be determined.";
    }
  };

  return (
    <div className="max-w-6xl mx-auto rounded-xl border border-slate-800 bg-gradient-to-b from-black/50 to-slate-900/50 p-8 backdrop-blur-sm">
     

      {isVerifyingContract && (
        <div className="text-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
          <p className="text-slate-300">Checking network and verifying contract...</p>
        </div>
      )}

      {isCorrectNetwork === false && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wrong Network</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>You are connected to {currentNetwork}. This app requires Sepolia testnet.</p>
            <Button 
              onClick={handleSwitchNetwork} 
              disabled={isSwitchingNetwork}
              variant="gradient-purple" 
              className="mt-2"
            >
              {isSwitchingNetwork ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching...
                </>
              ) : (
                "Switch to Sepolia"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {contractVerified === false && isCorrectNetwork !== false && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Contract Verification Failed</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <p>There might be an issue with the smart contract connection. Please check your network connection and wallet settings.</p>
            <Button 
              onClick={handleTestContract} 
              disabled={isTestingContract}
              variant="gradient-purple" 
              className="mt-2"
            >
              {isTestingContract ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Contract...
                </>
              ) : (
                "Test Contract Connection"
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {canUpload === false && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {contractType === "SchoolLibrary" ? "School Library Mode" : "Upload Restricted"}
          </AlertTitle>
          <AlertDescription>
            {getUploadRestrictionMessage()}
          </AlertDescription>
        </Alert>
      )}

      {debugMode && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold">Debug Information</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDebugMode}
            >
              Hide Debug
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm mb-1">Contract Address: {getCurrentContractAddress() || "N/A"}</p>
              <p className="text-sm mb-1">Network: {currentNetwork || "Not connected"}</p>
              <p className="text-sm mb-1">Contract Type: {contractType || "Unknown"}</p>
              <p className="text-sm mb-1">Can Upload: {canUpload === null ? "Unknown" : canUpload ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-sm mb-1">Wallet: {currentAccount || "Not connected"}</p>
              <p className="text-sm mb-1">Balance: {userBalance || "Unknown"}</p>
              <p className="text-sm mb-1">Contract Verified: {contractVerified === null ? "Unknown" : contractVerified ? "Yes" : "No"}</p>
              <p className="text-sm mb-1">Correct Network: {isCorrectNetwork === null ? "Unknown" : isCorrectNetwork ? "Yes" : "No"}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestContract}
              disabled={isTestingContract || !currentAccount}
            >
              {isTestingContract ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Bug className="mr-2 h-4 w-4" />
                  Test Contract
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testContractVersionOnClick}
              disabled={!currentAccount}
            >
              <Bug className="mr-2 h-4 w-4" />
              Test Version
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestSimplified}
              disabled={isTestingSimplified || !currentAccount}
            >
              {isTestingSimplified ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Bug className="mr-2 h-4 w-4" />
                  Simple Test
                </>
              )}
            </Button>
            
            {!isCorrectNetwork && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork || !currentAccount}
              >
                {isSwitchingNetwork ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Switching...
                  </>
                ) : (
                  <>Switch to Sepolia</>
                )}
              </Button>
            )}
          </div>
          
          {contractTestResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
              <pre>{JSON.stringify(contractTestResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {hasEnoughBalance === false && isCorrectNetwork !== false && (
        <Alert className="mb-4 bg-amber-900/50 border-amber-700">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-200">Low Balance Warning</AlertTitle>
          <AlertDescription className="text-amber-300">
            Your wallet balance ({userBalance} ETH) might not be enough to cover gas fees. Consider adding more ETH before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {!currentAccount ? (
        <div className="text-center">
          <p className="mb-4 text-slate-300">
            Please connect your wallet to upload study materials
          </p>
          <Button 
            variant="cursor-style"
            size="cursor-lg"
            onClick={handleConnectWallet}
          >
            Connect Wallet
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduction to Blockchain" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A comprehensive guide to blockchain technology..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="blockchain">Blockchain</SelectItem>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="language">Language</SelectItem>
                            <SelectItem value="physics">Physics</SelectItem>
                            <SelectItem value="chemistry">Chemistry</SelectItem>
                            <SelectItem value="biology">Biology</SelectItem>
                            <SelectItem value="computer-science">Computer Science</SelectItem>
                            <SelectItem value="literature">Literature</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="economics">Economics</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (ETH)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" min="0" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Set to 0 for free materials
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <FormLabel>File</FormLabel>
                  <div className="rounded-lg border border-dashed border-slate-700 p-8 min-h-[310px] flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="h-8 w-8 text-slate-500" />
                      <p className="text-sm text-slate-400">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-xs text-slate-500">
                        Supported formats: PDF, MP4, MOV (Max 50MB)
                      </p>
                      <Input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.mp4,.mov"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 border-slate-700 hover:bg-slate-800/50 hover:text-purple-400 transition-all duration-300"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select File
                      </Button>
                    </div>
                  </div>

                  {fileError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                  )}

                  {file && (
                    <div className="mt-4 rounded-lg bg-slate-800 p-3">
                      <div className="flex items-center space-x-3">
                        {getFileTypeIcon()}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-xs text-slate-400">Uploading file</p>
                          <p className="text-xs text-slate-400">{uploadProgress}%</p>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {uploadProgress === 100 && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <p className="text-xs text-slate-400">Pinning to IPFS</p>
                            <p className="text-xs text-slate-400">{pinningProgress}%</p>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800">
                            <div
                              className="h-1.5 rounded-full bg-purple-500"
                              style={{ width: `${pinningProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isUploading || !contractVerified || isCorrectNetwork === false || !canUpload}
              className="w-full"
              variant="gradient-purple"
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Upload & Mint Material</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
