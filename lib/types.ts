// Blockchain and NFT types
export interface NFT {
  id: string
  tokenId: string
  contractAddress: string
  owner: string
  metadata: NFTMetadata
}

export interface NFTMetadata {
  name: string
  description: string
  image?: string
  properties: {
    type: string
    category: string
    price: string
    author: string
    cid: string
    createdAt: string
  }
}

// Study material types
export interface StudyMaterial {
  id: string
  title: string
  description: string
  price: string
  category: string
  type: "pdf" | "video" | "other"
  author: string
  createdAt: string
  cid?: string
}

export interface PurchasedMaterial extends StudyMaterial {
  purchasedAt: string
  tokenId: string
}

// User types
export interface User {
  address: string
  materials: PurchasedMaterial[]
  uploads: StudyMaterial[]
}

