'use client';

import { useState } from 'react';
import axios from 'axios';
import { Upload, Send, FileText, MessageCircle, Loader2, CheckCircle, AlertCircle, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QAItem {
  question: string;
  answer: string;
  timestamp: Date;
}

export default function PDFQAApp() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState<QAItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a PDF file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post('http://127.0.0.1:8000/upload_pdf/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess(true);
      setQaHistory([]);
    } catch (err) {
      setError('Failed to upload PDF. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !uploadSuccess) return;

    setIsAsking(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('question', question.trim());

      const response = await axios.post('http://127.0.0.1:8000/ask_question/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newQA: QAItem = {
        question: question.trim(),
        answer: response.data.answer || 'No answer received',
        timestamp: new Date(),
      };

      setQaHistory(prev => [...prev, newQA]);
      setQuestion('');
    } catch (err) {
      setError('Failed to get answer. Please try again.');
      console.error('Question error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const resetApp = () => {
    setFile(null);
    setUploadSuccess(false);
    setQaHistory([]);
    setError(null);
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Brain className="w-12 h-12 text-cyan-400" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Document Intelligence
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Upload your PDF and unlock intelligent insights with our advanced AI-powered question answering system
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {!uploadSuccess && (
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Upload Document</h2>
              </div>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-400/10 scale-105'
                    : file
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      {file ? (
                        <div className="relative">
                          <CheckCircle className="w-16 h-16 text-green-400" />
                          <div className="absolute inset-0 animate-ping">
                            <CheckCircle className="w-16 h-16 text-green-400 opacity-20" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <FileText className="w-16 h-16 text-gray-400" />
                          <Upload className="w-8 h-8 text-cyan-400 absolute -top-2 -right-2" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-white mb-2">
                        {file ? file.name : 'Drop your PDF here'}
                      </p>
                      <p className="text-gray-400 text-lg">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to process` : 'or click to browse files'}
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Process with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="backdrop-blur-md bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span className="text-green-300 text-lg font-medium">Document processed successfully! Ready for questions.</span>
              </div>
              <Button
                variant="outline"
                onClick={resetApp}
                className="border-green-400/30 text-green-400 hover:bg-green-400/10 rounded-xl"
              >
                Upload New Document
              </Button>
            </div>
          </div>
        )}

        {/* Question Section */}
        {uploadSuccess && (
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Ask Anything</h2>
            </div>
            
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What insights can you extract from this document?"
                    className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20"
                    disabled={isAsking}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!question.trim() || isAsking}
                  className="h-14 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isAsking ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Thinking Indicator */}
        {isAsking && (
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-center gap-4 text-cyan-400">
              <div className="relative">
                <Brain className="w-8 h-8 animate-pulse" />
                <div className="absolute inset-0 animate-ping">
                  <Brain className="w-8 h-8 opacity-20" />
                </div>
              </div>
              <span className="text-xl font-medium">AI is analyzing...</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}

        {/* Q&A History */}
        {qaHistory.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-7 h-7 text-cyan-400" />
              <h2 className="text-3xl font-bold text-white">Conversation History</h2>
            </div>
            
            <div className="space-y-6">
              {qaHistory.map((qa, index) => (
                <div key={index} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    {/* Question */}
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-300 mb-2">Your Question</p>
                          <p className="text-white text-lg leading-relaxed">{qa.question}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Answer */}
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-6">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-cyan-300 mb-2">AI Response</p>
                          <p className="text-white text-lg leading-relaxed">{qa.answer}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <p className="text-sm text-gray-400">
                        {qa.timestamp.toLocaleTimeString()} • {qa.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}