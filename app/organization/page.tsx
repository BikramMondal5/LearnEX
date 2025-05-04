import OrganizationTab from "@/components/organization-tab"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "LearnEX - Organization Dashboard",
  description: "Deploy and manage your own StudyMarketplace contracts",
}

export default function OrganizationPage() {
  return <OrganizationTab />
} 