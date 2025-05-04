"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/ui/cube-loader"

export default function LoaderExamplePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">3D Cube Loader</h1>
        
        <section className="mb-16">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Cube Loader Component</CardTitle>
              <CardDescription className="text-slate-400">
                A modern 3D spinning cube loader with customizable colors and sizes
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-12">
              {/* Size Variations */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Size Variations</h3>
                <div className="flex flex-wrap items-center justify-around gap-12 p-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center h-20 w-20">
                      <Loader size="sm" />
                    </div>
                    <span className="text-sm text-slate-400">Small</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center h-20 w-20">
                      <Loader size="default" />
                    </div>
                    <span className="text-sm text-slate-400">Default</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center h-20 w-20">
                      <Loader size="lg" />
                    </div>
                    <span className="text-sm text-slate-400">Large</span>
                  </div>
                </div>
              </div>
              
              {/* Color Variations */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Color Variations</h3>
                <div className="flex flex-wrap items-center justify-around gap-12 p-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center h-20 w-20">
                      <Loader color="blue" />
                    </div>
                    <span className="text-sm text-slate-400">Blue</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center h-20 w-20">
                      <Loader color="purple" />
                    </div>
                    <span className="text-sm text-slate-400">Purple</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center h-20 w-20">
                      <Loader color="cyan" />
                    </div>
                    <span className="text-sm text-slate-400">Cyan</span>
                  </div>
                </div>
              </div>
              
              {/* Usage in components */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Usage Example</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-center p-8 rounded-lg border border-slate-800 bg-black/50">
                    <Button 
                      variant="gradient-outline" 
                      className="relative"
                      disabled
                    >
                      <span className="opacity-0">Processing...</span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center h-4 w-4">
                            <Loader size="sm" color="purple" />
                          </div>
                          Processing...
                        </div>
                      </span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center p-8 rounded-lg border border-slate-800 bg-black/50">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center justify-center h-20 w-20">
                        <Loader color="cyan" size="lg" />
                      </div>
                      <span className="text-sm text-slate-400">Loading data...</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Implementation Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">Implementation</h3>
                <div className="p-6 rounded-lg border border-slate-800 bg-black/50 overflow-x-auto">
                  <pre className="text-sm text-slate-300">
                    {`import Loader from "@/components/ui/cube-loader"

// Basic usage with wrapper div for centering
<div className="flex items-center justify-center h-16 w-16">
  <Loader />
</div>

// With size options
<Loader size="sm" />
<Loader size="default" />
<Loader size="lg" />

// With color options
<Loader color="blue" />
<Loader color="purple" />
<Loader color="cyan" />

// With custom class
<Loader className="my-class" />`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 