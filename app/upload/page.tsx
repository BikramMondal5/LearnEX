"use client"

import SpaceBackground from "@/components/space-background"
import UploadMaterialForm from "@/components/upload-material-form"

export default function UploadPage() {
  return (
    <main className="min-h-screen pt-16">
      <SpaceBackground density={600} speed={0.0002} />

      {/* Modern Header Section */}
      <section className="relative py-8">
        <div className="container mx-auto px-4">
          {/* No heading as requested */}
        </div>
      </section>

      {/* Main Content Section */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {/* Form Container */}
          <div className="mx-auto max-w-5xl rounded-2xl glass-card p-8 backdrop-blur-sm shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh-gradient opacity-10"></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10">
                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>
              </div>
            </div>
            
            <div className="relative z-10">
              <UploadMaterialForm />
            </div>
          </div>

          {/* Security information */}
          <div className="mx-auto mt-16 max-w-5xl rounded-xl glass-card p-8 backdrop-blur-sm border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5"></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-5">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <span className="mx-3 text-sm font-medium text-gradient-blue-cyan font-space">DECENTRALIZED STORAGE</span>
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-card p-5 flex flex-col items-center rounded-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/20 to-blue-500/20 border border-white/10">
                    <svg className="h-6 w-6 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="mb-3 font-bold text-white font-space">IPFS Content Storage</h4>
                  <p className="text-sm text-slate-300 text-center">
                    All study materials are stored on IPFS (InterPlanetary File System), a distributed and decentralized storage network. 
                    Content is addressed by its hash, making it tamper-proof and permanently accessible as long as at least one node 
                    on the network has a copy.
                  </p>
                </div>
                
                <div className="glass-card p-5 flex flex-col items-center rounded-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-500/20 border border-white/10">
                    <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16.2426 7.75736C16.5858 8.10051 16.8536 8.50491 17.0304 8.94759C17.2071 9.39026 17.2894 9.86316 17.2728 10.338C17.2561 10.8129 17.1409 11.2781 16.9344 11.7067C16.7279 12.1352 16.4345 12.518 16.0711 12.8321C15.7077 13.1463 15.2825 13.3864 14.8246 13.5379C14.3667 13.6894 13.886 13.7489 13.41 13.7127C12.934 13.6764 12.47 13.5452 12.0463 13.3265C11.6225 13.1077 11.2484 12.8061 10.9426 12.4393" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.5 9L7 7.5L8.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 16H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="mb-3 font-bold text-white font-space">Blockchain Integration</h4>
                  <p className="text-sm text-slate-300 text-center">
                    The content identifier (CID) from IPFS is stored on the blockchain, creating an immutable record of ownership. 
                    This blockchain record enables secure access control and verifiable ownership of educational content shared with the community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
