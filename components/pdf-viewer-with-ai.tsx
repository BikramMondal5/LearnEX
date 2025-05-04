"use client"

import { useState, useRef, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  X,
  MessageSquareText,
  Sparkles,
  Loader,
  Video,
  ExternalLink,
  PlusCircle
} from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import "@/styles/pdf-viewer.css"
import MarkdownRenderer from "./markdown-renderer"

// Add a style tag for additional markdown styles
const markdownStyles = `
  .markdown-content pre {
    background-color: rgba(0, 0, 0, 0.25);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
    max-width: 100%;
  }
  
  .markdown-content code {
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .markdown-content ul, .markdown-content ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }
  
  .markdown-content ul {
    list-style-type: disc;
  }
  
  .markdown-content ol {
    list-style-type: decimal;
  }
  
  .markdown-content p {
    margin: 0.5rem 0;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .markdown-content h1, .markdown-content h2, .markdown-content h3, 
  .markdown-content h4, .markdown-content h5, .markdown-content h6 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: white;
    font-weight: bold;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .markdown-content h1 { font-size: 1.5rem; }
  .markdown-content h2 { font-size: 1.25rem; }
  .markdown-content h3 { font-size: 1.125rem; }
  
  .markdown-content blockquote {
    border-left: 4px solid #8b5cf6;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #d1d5db;
    font-style: italic;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .markdown-content a {
    color: #818cf8;
    text-decoration: underline;
    word-break: break-all;
  }
  
  .markdown-content a:hover {
    color: #6366f1;
  }
  
  .markdown-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    display: block;
    overflow-x: auto;
    max-width: 100%;
  }
  
  .markdown-content th, .markdown-content td {
    border: 1px solid #374151;
    padding: 0.5rem;
    text-align: left;
    word-break: break-word;
  }
  
  .markdown-content th {
    background-color: #1f2937;
  }

  /* Add this to ensure all content wraps properly inside the chat container */
  .chat-response-container {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
  }
`;

// Set a dummy worker source or disable worker to avoid the CDN errors
if (typeof window !== 'undefined') {
  // This effectively bypasses the worker requirement
  pdfjs.GlobalWorkerOptions.workerSrc = '';
}

// Access API keys from environment variables
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// Gemini API endpoints - using 2.0-flash with v1beta path
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

interface PdfViewerWithAiProps {
  pdfUrl: string
  title: string
  onClose: () => void
}

// Interface for video recommendations
interface VideoRecommendation {
  title: string;
  url: string;
  thumbnail: string;
}

// Pre-built prompt templates for common topics
const PROMPT_TEMPLATES = {
  explain: "Explain the concept of {topic} in simple terms a beginner would understand. Include key principles and real-world applications.",
  summarize: "Provide a comprehensive summary of {topic}, covering the most important aspects, key developments, and current state of the field.",
  videos: "Recommend the best YouTube channels, courses, or specific videos to learn about {topic} from beginner to advanced level.",
  compare: "Compare and contrast {topic} with related technologies or approaches. Highlight key differences, advantages, and limitations.",
  future: "Discuss the future trends and potential developments in {topic} over the next 5-10 years. What innovations or breakthroughs might we expect?",
  history: "Provide a brief history of {topic}, including when it was developed, major milestones, and how it has evolved over time.",
  career: "What career opportunities exist in {topic}? Describe job roles, required skills, and how to start a career in this field.",
  practical: "Give me practical, step-by-step instructions to implement or use {topic} in a real-world scenario with code examples where applicable.",
  challenges: "What are the main challenges or limitations of {topic}? Discuss the problems that need to be solved and potential solutions.",
  resources: "What are the best books, websites, courses, and communities to learn more about {topic} for someone who wants to master it?"
};

const AI_FEATURES = [
  { 
    id: "document-summary", 
    name: "Document Summary", 
    description: "Intelligent identification of key information, quickly creating concise summaries to help you grasp the essence of the documents",
    icon: "FileText"
  },
  { 
    id: "smart-qa", 
    name: "Smart Q&A", 
    description: "Answering questions based on the document content, providing professional answers to enhance your understanding of the documents",
    icon: "HelpCircle" 
  },
  { 
    id: "instant-answer", 
    name: "Instant Answer", 
    description: "Get immediate responses to your questions with lightning-fast processing, optimized for quick learning and time-sensitive inquiries",
    icon: "Zap" 
  },
  { 
    id: "document-translation", 
    name: "Document Translation", 
    description: "Translate a PDF file and compare it side by side with the original file on the left and the translated file on the right",
    icon: "Languages" 
  }
];

// Replace POPULAR_TOPICS with AI_FEATURES
const POPULAR_TOPICS = AI_FEATURES;

const getSystemInstruction = (aiQuery: string) => `
🧠 Identity & Role
You are LearnEx PDF Assistant, the official document companion for LearnEx – Study Marketplace, a decentralized platform that enables buying and selling educational resources using blockchain technology.

Your mission is to help users understand, explore, and apply the content of any uploaded PDF effectively.

👤 Your Core Responsibilities:
Guide users to relevant answers based on their document-related queries.

Simplify complex content for easy understanding and learning.

Connect knowledge to real-life applications, making the content more meaningful.

💬 Communication Style
Maintain a tone that is both friendly and professional. Make learning engaging while building user trust.

✅ Key Communication Guidelines:
Be polite, helpful, and approachable.

Use clear, concise language that avoids jargon.

Enhance clarity with Markdown formatting for lists, emphasis, and code blocks.

Use emojis thoughtfully to improve friendliness or draw attention to key points (📚, 💡, ✅).

Keep responses focused and relevant, but warmly conversational.

🎯 Primary Objectives
As the LearnEx PDF Assistant, ensure that every user experience is:

✅ Helpful: Provide accurate, concise, and well-structured answers.

🎓 Educational: Help users understand document content thoroughly.

🌐 Platform-Aware: Guide users on how to use LearnEx features effectively.

🔗 Blockchain-Informed: Educate users about the role and benefits of blockchain in education.

Pdf file is already uploaded and whatever the user ask is the content of the pdf file. Make sure to follow these above guidelines and now respond to this query: ${aiQuery}
`;

export default function PdfViewerWithAi({ pdfUrl, title, onClose }: PdfViewerWithAiProps) {
  // PDF viewer state
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [useIframeViewer, setUseIframeViewer] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  
  // AI assistant state
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState("")
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [aiHistory, setAiHistory] = useState<Array<{question: string, answer: string, videos?: VideoRecommendation[]}>>([]); 
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Helper function to ensure proper URL format
  const formatIpfsUrl = (url: string): string => {
    // If it's already a complete URL (e.g., from a gateway), return it
    if (url.startsWith('http') && !url.includes('/ipfs/https://')) {
      return url;
    }
    
    // If it has the double gateway issue, fix it
    if (url.includes('/ipfs/https://')) {
      const parts = url.split('/ipfs/');
      if (parts.length >= 2) {
        const secondPart = parts[1];
        if (secondPart.includes('/ipfs/')) {
          // Extract just the CID
          const cidParts = secondPart.split('/ipfs/');
          return `${parts[0]}/ipfs/${cidParts[1]}`;
        }
      }
    }
    
    // Handle ipfs:// protocol
    if (url.startsWith('ipfs://')) {
      return `https://gateway.ipfs.io/ipfs/${url.substring(7)}`;
    }
    
    // If it's just a CID, add the preferred gateway
    if (!url.startsWith('http')) {
      return `https://gateway.ipfs.io/ipfs/${url}`;
    }
    
    // Default case
    return url;
  };
  
  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }
  
  // Handle document load error
  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error)
    
    // More descriptive error message based on error type
    let errorMessage = "Failed to load PDF. Please try again."
    
    if (error.message.includes("network") || error.message.includes("Failed to fetch")) {
      errorMessage = "Network error: PDF can't be loaded from IPFS gateway. Try using the 'Open in Browser' button."
    } else if (error.message.includes("password") || error.message.includes("encrypted")) {
      errorMessage = "This PDF is password protected and cannot be opened."
    } else if (error.message.includes("not found") || error.message.includes("404")) {
      errorMessage = "PDF not found on IPFS gateway. The file may no longer be pinned or the hash is incorrect."
    } else if (error.message.includes("corrupt") || error.message.includes("invalid")) {
      errorMessage = "The PDF file appears to be corrupted or invalid."
    }
    
    setError(errorMessage)
    setIsLoading(false)
  }
  
  // Navigation functions
  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }
  
  const goToNextPage = () => {
    if (numPages) {
      setPageNumber(prev => Math.min(prev + 1, numPages))
    }
  }
  
  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3))
  }
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }
  
  // Rotation function
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }
  
  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])
  
  // Download function
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${title.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Function to fetch videos related to a topic
  const fetchRelatedVideos = async (topic: string, shouldShowVideos: boolean = false): Promise<VideoRecommendation[]> => {
    // Skip video recommendations for general or greeting queries
    if (!shouldShowVideos) {
      return [];
    }

    try {
      // Filter out non-educational keywords from the topic
      const filteredTopic = topic
        .replace(/^(hi|hello|hey|greetings|thanks|thank you|please|okay)[\s\.,!?]*/i, '')
        .replace(/[\.,!?]+$/, '')
        .trim();
        
      // If the filtered topic is too short or generic, don't fetch videos
      if (filteredTopic.length < 3 || /^(how are you|who are you|what can you do|what's up)$/i.test(filteredTopic)) {
        return [];
      }

      // Enhance search query to specifically target educational content
      const educationalQuery = `${encodeURIComponent(filteredTopic)}+educational+tutorial+course+learn`;
      
      // Use the YouTube API to fetch educational video recommendations
      const response = await fetch(
        `${YOUTUBE_API_URL}?part=snippet&q=${educationalQuery}&maxResults=3&type=video&videoCategoryId=27&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        console.error(`YouTube API request failed with status ${response.status}`);
        throw new Error(`YouTube API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        // Filter out possible non-educational content based on title keywords
        const educationalVideos = data.items.filter((item: any) => {
          const title = item.snippet.title.toLowerCase();
          const description = item.snippet.description.toLowerCase();
          
          // Check for educational keywords in title or description
          const hasEducationalTerms = 
            title.includes('learn') || 
            title.includes('tutorial') || 
            title.includes('course') || 
            title.includes('lesson') ||
            title.includes('education') ||
            title.includes('guide') ||
            title.includes('how to') ||
            description.includes('learn') || 
            description.includes('tutorial') || 
            description.includes('course');
            
          // Avoid obvious entertainment-only content
          const hasEntertainmentTerms =
            title.includes('funny') ||
            title.includes('prank') ||
            title.includes('reaction') ||
            title.includes('gameplay');
            
          return hasEducationalTerms && !hasEntertainmentTerms;
        });
        
        return educationalVideos.map((item: any) => ({
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.medium.url
        }));
      } else {
        // Fallback to more specific educational search if no results
        return [
          {
            title: `Learn about ${filteredTopic} - Educational Tutorial`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(filteredTopic)}+course+tutorial+learning`,
            thumbnail: `https://i.ytimg.com/vi/placeholder/mqdefault.jpg`
          }
        ];
      }
    } catch (error) {
      console.error("Error fetching related videos:", error);
      // Return empty array in case of error
      return [];
    }
  };
  
  // Function to query Gemini AI
  const queryGeminiAI = async (query: string): Promise<string> => {
    try {
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: getSystemInstruction(query)
            }]
          }]
        })
      });
      
      if (!response.ok) {
        console.error(`API request failed with status ${response.status}`, await response.text());
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract the response text from the Gemini API response
      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        return "I apologize, but I couldn't generate a response for this query. Please try again with a different question.";
      }
    } catch (error) {
      console.error("Error querying Gemini AI:", error);
      return "I encountered an error while processing your request. Please try again later.";
    }
  };
  
  // AI assistant functions
  const toggleAiPanel = () => {
    setIsAiPanelOpen(prev => !prev)
  }
  
  // Function to apply a prompt template to a topic
  const applyPromptTemplate = (template: string, topic: string): string => {
    return template.replace("{topic}", topic);
  };

  // Function to build smart prompts
  const buildSmartPrompt = (topic: string, promptType: keyof typeof PROMPT_TEMPLATES): string => {
    return applyPromptTemplate(PROMPT_TEMPLATES[promptType], topic);
  };

  // Updated AI query submit handler to use more context-aware queries
  const handleAiQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiQuery.trim()) return;
    
    setIsAiThinking(true);
    
    try {
      // Enhance the user's query with additional context
      let enhancedQuery = aiQuery;
      
      // Check if the query is just a topic name without specific instructions
      const isSimpleTopic = POPULAR_TOPICS.some(topic => 
        aiQuery.toLowerCase() === topic.name.toLowerCase() || 
        aiQuery.toLowerCase().includes(topic.name.toLowerCase())
      );
      
      if (isSimpleTopic && !aiQuery.includes("explain") && aiQuery.split(" ").length < 4) {
        // If user just entered a topic name, default to explanation
        enhancedQuery = buildSmartPrompt(aiQuery, "explain");
      }
      
      // Call Gemini API with the enhanced query
      const aiResponseText = await queryGeminiAI(enhancedQuery);
      
      // Determine if this is a query that would benefit from video explanations
      
      // Check for common greeting patterns or generic interactions to exclude
      const genericPatterns = [
        /^(hi|hello|hey|greetings)/i,
        /^(how are you|what's up|how's it going)/i,
        /^(thanks|thank you)/i,
        /^(bye|goodbye)/i,
        /^(who are you|what can you do)/i
      ];
      
      const isGenericQuery = genericPatterns.some(pattern => pattern.test(aiQuery.trim()));
      
      // Check for educational indicators in the query
      const educationalIndicators = [
        /explain|tutorial|learn|teach|course|lesson|how to|what is|define|concept of|understand/i,
        /video|watch|visual|demonstrate/i
      ];
      
      const hasEducationalIntent = educationalIndicators.some(pattern => pattern.test(aiQuery));
      
      // Only fetch videos for educational queries that would benefit from visual explanation
      const shouldShowVideos = !isGenericQuery && (hasEducationalIntent || isSimpleTopic);
      
      // Get video recommendations only if appropriate
      const videos = await fetchRelatedVideos(aiQuery, shouldShowVideos);
      
      // Create the history entry with both the AI response and videos
      const historyEntry = {
        question: aiQuery,
        answer: aiResponseText,
        videos: videos
      };
      
      // Add to history
      setAiHistory(prev => [...prev, historyEntry]);
      setAiResponse(aiResponseText);
      setAiQuery("");
    } catch (error) {
      console.error("Error getting AI response:", error);
      setAiResponse("I'm sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsAiThinking(false);
    }
  };
  
  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIframeLoading(false);
    setError("The PDF could not be displayed. The document may be unavailable or the CID may be invalid.");
  };

  // Use a simpler approach with useEffect
  useEffect(() => {
    let isMounted = true;
    
    const attemptToLoadPdf = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      setIframeLoading(true);
      
      try {
        // Properly format the URL first to avoid double gateway issues
        const formattedUrl = formatIpfsUrl(pdfUrl);
        console.log(`Formatted PDF URL: ${formattedUrl}`);
        
        // Always use iframe viewer to avoid PDF.js worker issues
        setLocalPdfUrl(formattedUrl);
        setUseIframeViewer(true);
        setIsLoading(false);
        
      } catch (err) {
        if (!isMounted) return;
        
        console.error("Error setting up PDF viewer:", err);
        setError(`Failed to load PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    attemptToLoadPdf();
    
    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);
  
  // Make it go fullscreen on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      try {
        setTimeout(() => {
          if (containerRef.current && document.fullscreenEnabled) {
            containerRef.current.requestFullscreen().catch(e => console.log("Fullscreen failed:", e));
          }
        }, 1000);
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    }
    
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log("Exit fullscreen failed"));
      }
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pdf-viewer-main">
      {/* Add the style tag for markdown styles */}
      <style dangerouslySetInnerHTML={{ __html: markdownStyles }} />
      
      <div 
        ref={containerRef}
        className="relative flex flex-col w-full h-full max-w-[95vw] max-h-[95vh] bg-slate-900 rounded-lg overflow-hidden border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-end p-3 border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={toggleAiPanel}
            >
              <Sparkles className="h-5 w-5 text-purple-400" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto bg-slate-800 p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader className="h-8 w-8 text-purple-500 animate-spin mb-4" />
                <p className="text-white mb-2">Loading document...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-500 mb-4">{error}</p>
                <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
              </div>
            ) : useIframeViewer ? (
              // Use iframe if direct fetching is not working
              <div className="w-full h-full flex items-center justify-center relative" onClick={toggleFullscreen}>
                {iframeLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 z-10">
                    <Loader className="h-8 w-8 text-purple-500 animate-spin mb-4" />
                    <p className="text-white mb-2">Loading document in browser viewer...</p>
                  </div>
                )}
                <iframe 
                  src={`${localPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full h-full border-0 bg-white rounded-lg shadow-lg"
                  title={title}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  style={{
                    overflow: 'hidden'
                  }}
                  frameBorder="0"
                />
              </div>
            ) : (
              <div 
                className="flex flex-col items-center pdf-container"
                onClick={toggleFullscreen}
              >
                <Document
                  file={localPdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(err) => {
                    console.error("PDF.js load error:", err);
                    // If react-pdf fails, fall back to iframe
                    setUseIframeViewer(true);
                  }}
                  className="pdf-document"
                  options={{
                    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                    cMapPacked: true,
                    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/'
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    className="pdf-page shadow-xl"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    canvasBackground="#fff"
                    key={`page_${pageNumber}_scale_${scale}_rotation_${rotation}`}
                  />
                </Document>
              </div>
            )}
          </div>
          
          {/* AI Assistant Panel - Enhanced visual design */}
          {isAiPanelOpen && (
            <div className="w-[30vw] min-w-[280px] max-w-[450px] transition-all duration-300
              border-l border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-white/10 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-space tracking-tight">AI Assistant</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    onClick={toggleAiPanel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-5 bg-slate-900/50">
                {aiHistory.length === 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 p-6 rounded-xl border border-white/5 backdrop-blur-sm mb-8 w-full">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-600/30 flex items-center justify-center mx-auto mb-4 ring-4 ring-purple-500/10">
                        <Sparkles className="h-7 w-7 text-purple-400" />
                      </div>
                      <p className="text-white text-sm text-center font-medium">
                        Select a topic or use a prompt template
                      </p>
                    </div>
                    
                    {/* Topic cards with icons - enhanced design */}
                    <div className="grid grid-cols-2 gap-4 mb-8 w-full">
                      {POPULAR_TOPICS.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => setAiQuery(topic.name)}
                          className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-white/5 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-500/5 group"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-3 group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-300 ring-2 ring-white/5">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                          </div>
                          <h4 className="text-sm font-medium text-white mb-1">{topic.name}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{topic.description}</p>
                        </button>
                      ))}
                    </div>
                    
                    {/* Prompt templates - enhanced design */}
                    <div className="space-y-4 w-full">
                      <h4 className="text-xs font-medium text-indigo-300 uppercase tracking-wider text-left px-1">Prompt templates</h4>
                      <div className="flex flex-wrap gap-2 justify-start">
                        {Object.entries(PROMPT_TEMPLATES).map(([key, template]) => (
                          <button
                            key={key}
                            onClick={() => setAiQuery(applyPromptTemplate(template, "this topic"))}
                            className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-indigo-900/30 hover:to-purple-900/30 text-slate-300 hover:text-white border border-white/5 transition-all duration-300"
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {aiHistory.map((item, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-600/30">
                            <MessageSquareText className="h-4 w-4 text-slate-300" />
                          </div>
                          <div className="flex-1 bg-slate-800 rounded-xl p-4 text-sm text-white shadow-md">
                            {item.question}
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 ring-2 ring-purple-500/30">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-800/95 rounded-xl p-4 text-sm text-white shadow-md border border-purple-500/10 chat-response-container overflow-hidden">
                            <div className="w-full overflow-hidden break-words">
                              <MarkdownRenderer content={item.answer} className="overflow-wrap-anywhere break-words" />
                            </div>
                            
                            {item.videos && item.videos.length > 0 ? (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs font-semibold mb-3 text-indigo-300">Recommended Educational Videos</p>
                                <div className="space-y-4">
                                  {item.videos.map((video, videoIndex) => (
                                    <a 
                                      key={videoIndex}
                                      href={video.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex flex-col rounded-xl bg-slate-900/80 hover:bg-slate-800 transition-all duration-300 overflow-hidden shadow-md hover:shadow-lg hover:shadow-purple-500/10 border border-white/5"
                                    >
                                      <div className="relative aspect-video w-full overflow-hidden">
                                        <img 
                                          src={video.thumbnail} 
                                          alt={video.title}
                                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/320x180/gray/white?text=Video";
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                                          <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                            <Video className="h-7 w-7 text-white" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="p-3">
                                        <p className="text-xs font-medium line-clamp-2 text-white">{video.title}</p>
                                        <div className="flex items-center mt-2">
                                          <ExternalLink className="h-3 w-3 text-indigo-400 mr-1" />
                                          <span className="text-[10px] text-indigo-300">Watch on YouTube</span>
                                        </div>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 pt-4 border-t border-white/10">
                                <button 
                                  onClick={async () => {
                                    try {
                                      // Show loading state
                                      const updatedHistory = [...aiHistory];
                                      updatedHistory[index] = {
                                        ...updatedHistory[index],
                                        videos: [{ 
                                          title: "Loading educational videos...", 
                                          url: "#", 
                                          thumbnail: "https://i.ytimg.com/vi/placeholder/mqdefault.jpg" 
                                        }]
                                      };
                                      setAiHistory(updatedHistory);
                                      
                                      // Force fetch educational videos when the button is clicked
                                      // Use a more direct approach to get educational videos
                                      const educationalQuery = item.question
                                        .replace(/^(hi|hello|hey|greetings|thanks|thank you|please|okay)[\s\.,!?]*/i, '')
                                        .replace(/[\.,!?]+$/, '')
                                        .trim();
                                        
                                      const response = await fetch(
                                        `${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(educationalQuery)}+educational+tutorial+course&maxResults=3&type=video&key=${YOUTUBE_API_KEY}`
                                      );
                                      
                                      if (!response.ok) {
                                        throw new Error(`YouTube API request failed with status ${response.status}`);
                                      }
                                      
                                      const data = await response.json();
                                      
                                      let videos: VideoRecommendation[] = [];
                                      
                                      if (data.items && data.items.length > 0) {
                                        videos = data.items.map((videoItem: any) => ({
                                          title: videoItem.snippet.title,
                                          url: `https://www.youtube.com/watch?v=${videoItem.id.videoId}`,
                                          thumbnail: videoItem.snippet.thumbnails.medium.url
                                        }));
                                      } else {
                                        // Fallback if no videos found
                                        videos = [{
                                          title: `Learn about ${educationalQuery} - Educational Tutorial`,
                                          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(educationalQuery)}+tutorial+learning`,
                                          thumbnail: `https://i.ytimg.com/vi/placeholder/mqdefault.jpg`
                                        }];
                                      }
                                      
                                      // Update the history item with the fetched videos
                                      const newHistory = [...aiHistory];
                                      newHistory[index] = {
                                        ...newHistory[index],
                                        videos: videos
                                      };
                                      setAiHistory(newHistory);
                                    } catch (error) {
                                      console.error("Error fetching videos:", error);
                                      // Handle error state
                                      const errorHistory = [...aiHistory];
                                      errorHistory[index] = {
                                        ...errorHistory[index],
                                        videos: [{
                                          title: "Could not load videos. Try again later.",
                                          url: "#",
                                          thumbnail: `https://i.ytimg.com/vi/placeholder/mqdefault.jpg`
                                        }]
                                      };
                                      setAiHistory(errorHistory);
                                    }
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-all duration-300"
                                >
                                  <PlusCircle className="h-3 w-3" />
                                  <span>Find Educational Videos</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <form onSubmit={handleAiQuerySubmit} className="p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
                <div className="relative">
                  <Input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Enter your query..."
                    className="pr-12 bg-slate-800 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg shadow-inner"
                    disabled={isAiThinking}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full text-purple-400 hover:text-purple-300 transition-colors"
                    disabled={isAiThinking}
                  >
                    {isAiThinking ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 pdf-controls">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-white text-sm">
              {pageNumber} / {numPages || '?'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextPage}
              disabled={numPages !== null && pageNumber >= numPages}
              className="text-white hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="text-white hover:bg-white/10"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-white text-sm w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              disabled={scale >= 3}
              className="text-white hover:bg-white/10"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            
            <div className="h-6 border-l border-white/20 mx-2"></div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={rotate}
              className="text-white hover:bg-white/10"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
