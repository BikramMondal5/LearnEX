"use client"

import { useState } from 'react'
import SubjectThumbnail from '@/components/subject-thumbnail'
import { SUBJECT_THUMBNAILS } from '@/lib/thumbnails'

export default function ThumbnailsShowcase() {
  // Get all subject categories from the thumbnails config
  const subjects = Object.keys(SUBJECT_THUMBNAILS)
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Subject Thumbnails Showcase</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {subjects.map((subject) => (
          <div key={subject} className="flex flex-col items-center">
            <SubjectThumbnail
              category={subject}
              width={300}
              height={200}
              className="mb-2"
            />
            <p className="text-center text-sm font-medium capitalize">{subject}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 