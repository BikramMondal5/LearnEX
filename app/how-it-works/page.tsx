import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Lock, ShieldCheck, Upload, Wallet } from "lucide-react"
import GradientButtonExample from "@/components/gradient-button-example"

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-xl text-muted-foreground">
            Our decentralized platform uses blockchain technology and encryption to securely share study materials
          </p>
        </div>

        <div className="grid gap-8">
          <section>
            <h2 className="text-2xl font-bold mb-6">The Technology Stack</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Decentralized Storage</CardTitle>
                  <CardDescription>IPFS (InterPlanetary File System)</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    All study materials are stored on IPFS, a distributed file system that allows files to be stored
                    across multiple nodes, ensuring high availability and censorship resistance.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Encryption</CardTitle>
                  <CardDescription>Lit Protocol</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Lit Protocol provides decentralized encryption, allowing content to be encrypted before being stored
                    on IPFS and only decrypted by users who own the corresponding NFT access token.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blockchain</CardTitle>
                  <CardDescription>Blockchain Technology</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    LearnEX uses specialized blockchain technology for educational content that stores metadata, access rights,
                    and transaction history, ensuring transparent and immutable records.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>NFT Access Control</CardTitle>
                  <CardDescription>ERC-1155 Standard</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    We use the ERC-1155 standard for NFTs, which allows multiple users to purchase access to the same
                    study material, making it more efficient than traditional NFTs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">The Process</h2>
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-px bg-border md:left-1/2" />

              <div className="grid gap-12">
                <div className="relative grid md:grid-cols-2">
                  <div className="flex md:justify-end md:pr-8">
                    <div className="relative max-w-md md:text-right">
                      <div className="absolute right-0 top-0 -mr-8 h-8 w-8 rounded-full bg-background flex items-center justify-center border md:-mr-12 md:right-auto md:left-full">
                        <Upload className="h-4 w-4" />
                      </div>
                      <h3 className="text-xl font-bold">1. Upload & Encryption</h3>
                      <p className="mt-2 text-muted-foreground">
                        Students upload their study materials (PDFs, notes, videos) to the platform. The content is
                        automatically encrypted using Lit Protocol before being stored on IPFS.
                      </p>
                    </div>
                  </div>
                  <div className="md:pl-8" />
                </div>

                <div className="relative grid md:grid-cols-2">
                  <div className="md:pr-8" />
                  <div className="relative max-w-md">
                    <div className="absolute left-0 top-0 -ml-8 h-8 w-8 rounded-full bg-background flex items-center justify-center border md:-ml-12">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="text-xl font-bold">2. NFT Minting</h3>
                    <p className="mt-2 text-muted-foreground">
                      The uploaded material is minted as an ERC-1155 NFT on the blockchain. This NFT represents access rights
                      to the encrypted content, and multiple copies can be purchased by different users.
                    </p>
                  </div>
                </div>

                <div className="relative grid md:grid-cols-2">
                  <div className="flex md:justify-end md:pr-8">
                    <div className="relative max-w-md md:text-right">
                      <div className="absolute right-0 top-0 -mr-8 h-8 w-8 rounded-full bg-background flex items-center justify-center border md:-mr-12 md:right-auto md:left-full">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <h3 className="text-xl font-bold">3. Purchase & Payment</h3>
                      <p className="mt-2 text-muted-foreground">
                        Other students browse the marketplace and purchase access to study materials by buying the
                        corresponding NFT. Payments are made in cryptocurrency and are automatically distributed to the
                        content creator.
                      </p>
                    </div>
                  </div>
                  <div className="md:pl-8" />
                </div>

                <div className="relative grid md:grid-cols-2">
                  <div className="md:pr-8" />
                  <div className="relative max-w-md">
                    <div className="absolute left-0 top-0 -ml-8 h-8 w-8 rounded-full bg-background flex items-center justify-center border md:-ml-12">
                      <Lock className="h-4 w-4" />
                    </div>
                    <h3 className="text-xl font-bold">4. Decryption & Access</h3>
                    <p className="mt-2 text-muted-foreground">
                      When a student wants to access their purchased material, Lit Protocol verifies their NFT ownership
                      on the blockchain. If verified, the content is decrypted and made available for viewing or
                      download.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Security & Privacy</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <CardTitle>Our Security Measures</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <h3 className="font-bold">End-to-End Encryption</h3>
                  <p className="text-muted-foreground">
                    All content is encrypted before leaving your device and is only decrypted for authorized users who
                    own the corresponding NFT.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">Decentralized Storage</h3>
                  <p className="text-muted-foreground">
                    By using IPFS, your content is stored across multiple nodes, eliminating single points of failure
                    and ensuring high availability.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">Blockchain Verification</h3>
                  <p className="text-muted-foreground">
                    All transactions and access rights are recorded on the blockchain, providing a transparent and
                    immutable record that cannot be tampered with.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">NFT-Based Access Control</h3>
                  <p className="text-muted-foreground">
                    The ERC-1155 standard ensures that only users who have purchased access can decrypt and view the
                    content, protecting creators' intellectual property.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Add gradient button example section */}
          <section className="py-16 bg-slate-900/50">
            <div className="container mx-auto px-4">
              <h2 className="mb-12 text-center text-3xl font-bold text-white">Button Styling Examples</h2>
              <GradientButtonExample />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

