import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Key,
  Mail,
  Globe,
  Clock,
  Save,
  RefreshCw,
} from 'lucide-react'

export default function Settings() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    profile: {
      name: 'Admin User',
      email: 'admin@qvox.com',
      company: 'QVox Technologies',
    },
    notifications: {
      emailAlerts: true,
      slackWebhook: false,
      dailyDigest: true,
      errorNotifications: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      ipWhitelisting: false,
    },
    appearance: {
      darkMode: false,
      compactView: false,
      animations: true,
    },
    api: {
      defaultModel: 'QVox',
      timeout: '120',
      retryAttempts: '3',
    },
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast({
      title: 'Settings saved',
      description: 'Your changes have been successfully saved.',
    })
  }

  const handleReset = () => {
    // Reset to defaults
    toast({
      title: 'Settings reset',
      description: 'Settings have been reset to default values.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account and application preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">API Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, name: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, email: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={settings.profile.company}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, company: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value="Administrator"
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {settings.profile.name.charAt(0)}
                  </div>
                  <Button variant="outline">Change Photo</Button>
                  <Button variant="ghost">Remove</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailAlerts: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Digest</Label>
                  <p className="text-sm text-gray-500">
                    Receive a daily summary of API usage
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.dailyDigest}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, dailyDigest: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Error Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when API calls fail
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.errorNotifications}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, errorNotifications: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Slack Integration</Label>
                  <p className="text-sm text-gray-500">
                    Send notifications to Slack webhook
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.slackWebhook}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, slackWebhook: checked }
                  })}
                />
              </div>

              {settings.notifications.slackWebhook && (
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <Input
                    id="slack-webhook"
                    placeholder="https://hooks.slack.com/services/..."
                    type="url"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security preferences and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">IP Whitelisting</Label>
                  <p className="text-sm text-gray-500">
                    Restrict access to specific IP addresses
                  </p>
                </div>
                <Switch
                  checked={settings.security.ipWhitelisting}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    security: { ...settings.security, ipWhitelisting: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: e.target.value }
                  })}
                />
                <p className="text-xs text-gray-500">
                  Automatically log out after period of inactivity
                </p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Last login: Today at 09:45 AM from IP 192.168.1.100
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-gray-500">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={settings.appearance.darkMode}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, darkMode: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Compact View</Label>
                  <p className="text-sm text-gray-500">
                    Reduce spacing for a more compact interface
                </p>
                </div>
                <Switch
                  checked={settings.appearance.compactView}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, compactView: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Animations</Label>
                  <p className="text-sm text-gray-500">
                    Enable or disable UI animations
                  </p>
                </div>
                <Switch
                  checked={settings.appearance.animations}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    appearance: { ...settings.appearance, animations: checked }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Theme Color</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700" />
                  <Button variant="outline" className="h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700" />
                  <Button variant="outline" className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700" />
                  <Button variant="outline" className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-700" />
                  <Button variant="outline" className="h-10 w-10 rounded-full bg-orange-600 hover:bg-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure default API behavior and timeouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default-model">Default Model</Label>
                  <select
                    id="default-model"
                    value={settings.api.defaultModel}
                    onChange={(e) => setSettings({
                      ...settings,
                      api: { ...settings.api, defaultModel: e.target.value }
                    })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="QVox">QVox (Standard)</option>
                    <option value="QVox-Pro">QVox Pro</option>
                    <option value="QVox-Lite">QVox Lite</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={settings.api.timeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      api: { ...settings.api, timeout: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    value={settings.api.retryAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      api: { ...settings.api, retryAttempts: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    value="200"
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <div className="flex gap-2">
                  <Input
                    value="https://api.qvox.com/v1/transcribe"
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                  />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  API rate limit: 200 requests per minute per API key
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}