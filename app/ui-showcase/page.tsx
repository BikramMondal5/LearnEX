"use client"

import { Button } from "@/components/ui/button"
import { GradientOutlineButton } from "@/components/ui/gradient-outline-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Download, ExternalLink, Mail, Plus, Search, Settings } from "lucide-react"

export default function UIShowcasePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">UI Components Showcase</h1>
        
        <section className="mb-16">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Gradient Outline Buttons</CardTitle>
              <CardDescription className="text-slate-400">
                Modern buttons with cyan-to-magenta gradient borders on dark backgrounds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Basic Variations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white mb-4">Size Variations</h3>
                <div className="flex flex-wrap gap-4">
                  <GradientOutlineButton size="sm">Small</GradientOutlineButton>
                  <GradientOutlineButton>Default</GradientOutlineButton>
                  <GradientOutlineButton size="lg">Large</GradientOutlineButton>
                </div>
              </div>
              
              {/* With Icons */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white mb-4">With Icons</h3>
                <div className="flex flex-wrap gap-4">
                  <GradientOutlineButton>
                    <Plus className="mr-2 h-4 w-4" />
                    New Item
                  </GradientOutlineButton>
                  <GradientOutlineButton>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </GradientOutlineButton>
                  <GradientOutlineButton>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Site
                  </GradientOutlineButton>
                </div>
              </div>
              
              {/* Notifications & Badges */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white mb-4">Notifications & Badges</h3>
                <div className="flex flex-wrap gap-4">
                  <GradientOutlineButton>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs">
                      5
                    </span>
                  </GradientOutlineButton>
                  
                  <GradientOutlineButton>
                    <Mail className="mr-2 h-4 w-4" />
                    Messages
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs">
                      3
                    </span>
                  </GradientOutlineButton>
                  
                  <GradientOutlineButton>
                    New to you
                  </GradientOutlineButton>
                </div>
              </div>
              
              {/* States */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white mb-4">States</h3>
                <div className="flex flex-wrap gap-4">
                  <GradientOutlineButton>Default</GradientOutlineButton>
                  <GradientOutlineButton disabled>Disabled</GradientOutlineButton>
                  <GradientOutlineButton className="hover:bg-purple-900/10">
                    Hover Custom
                  </GradientOutlineButton>
                </div>
              </div>
              
              {/* Full Width */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white mb-4">Full Width</h3>
                <div className="grid gap-4">
                  <GradientOutlineButton className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Search Database
                  </GradientOutlineButton>
                  
                  <GradientOutlineButton className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Update Settings
                  </GradientOutlineButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 