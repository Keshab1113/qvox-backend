import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '../hooks/useToast'
import { transcribeFile, transcribeUrl } from '../services/api'
import { Upload, Link as LinkIcon, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function Transcribe() {
  const { toast } = useToast()
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [model, setModel] = useState('QVox')
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('file')

  const fileMutation = useMutation({
    mutationFn: transcribeFile,
    onSuccess: (data) => {
      setResult(data)
      toast({
        title: 'Success',
        description: 'File transcribed successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to transcribe file',
        variant: 'destructive',
      })
    },
  })

  const urlMutation = useMutation({
    mutationFn: transcribeUrl,
    onSuccess: (data) => {
      setResult(data)
      toast({
        title: 'Success',
        description: 'URL transcribed successfully',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to transcribe URL',
        variant: 'destructive',
      })
    },
  })

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleFileSubmit = (e) => {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', model)

    fileMutation.mutate(formData)
  }

  const handleUrlSubmit = (e) => {
    e.preventDefault()
    if (!url) return

    urlMutation.mutate({ url, model })
  }

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transcribe</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload audio files or provide URLs for transcription
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Transcription</CardTitle>
            <CardDescription>
              Choose your input method and start transcription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">
                  <Upload className="mr-2 h-4 w-4" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="url">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file">
                <form onSubmit={handleFileSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Audio File</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Input
                        id="file"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="file"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm font-medium">
                          {file ? file.name : 'Click to upload or drag and drop'}
                        </span>
                        <span className="text-xs text-gray-500">
                          MP3, WAV, M4A up to 200MB
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <select
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="QVox">QVox (Standard)</option>
                      <option value="QVox-Pro">QVox Pro</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!file || fileMutation.isPending}
                  >
                    {fileMutation.isPending ? 'Transcribing...' : 'Start Transcription'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="url">
                <form onSubmit={handleUrlSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Audio URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/audio.mp3"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-url">Model</Label>
                    <select
                      id="model-url"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="QVox">QVox (Standard)</option>
                      <option value="QVox-Pro">QVox Pro</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!url || urlMutation.isPending}
                  >
                    {urlMutation.isPending ? 'Transcribing...' : 'Start Transcription'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Transcription Result
              </CardTitle>
              <CardDescription>
                Request ID: {result.request_id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Transcribed Text</Label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="whitespace-pre-wrap">{result.text}</p>
                </div>
              </div>

              {result.segments && (
                <div>
                  <Label>Segments</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {result.segments.map((segment, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                      >
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{segment.start}s</span>
                          <span>{segment.end}s</span>
                        </div>
                        <p>{segment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}