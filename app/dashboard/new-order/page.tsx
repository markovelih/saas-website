'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createOrder } from './actions'
import { toast } from 'sonner'

const websiteTypes = [
  'Business Website',
  'E-Commerce Store',
  'Portfolio',
  'Landing Page',
  'Blog',
  'Web Application',
  'SaaS Platform',
  'Custom Software',
  'Integration or New Feature',
  'Restaurant Website',
  'Booking Platform',
  'Other',
]

const budgetRanges = [
  '$1,000 - $2,500',
  '$2,500 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000+',
]

const designStyles = [
  'Minimal & Clean',
  'Bold & Colorful',
  'Dark & Modern',
  'Corporate & Professional',
  'Creative & Artistic',
  'Luxury & Premium',
  'Playful & Fun',
  'Not sure - Need guidance',
]

const featuresList = [
  { id: 'booking', label: 'Booking System' },
  { id: 'payments', label: 'Payment Processing' },
  { id: 'login', label: 'User Login System' },
  { id: 'admin', label: 'Admin Panel' },
  { id: 'database', label: 'Database Integration' },
  { id: 'animations', label: 'Custom Animations' },
  { id: 'seo', label: 'SEO Optimization' },
  { id: 'contact', label: 'Contact Form' },
  { id: 'ecommerce', label: 'E-Commerce Features' },
  { id: 'blog', label: 'Blog System' },
  { id: 'newsletter', label: 'Newsletter Signup' },
  { id: 'analytics', label: 'Analytics Integration' },
]

export default function NewOrderPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  function toggleFeature(featureId: string) {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    const data = {
      businessName: formData.get('businessName') as string,
      websiteType: formData.get('websiteType') as string,
      budget: formData.get('budget') as string,
      deadline: formData.get('deadline') as string,
      pages: formData.get('pages') as string,
      designStyle: formData.get('designStyle') as string,
      features: selectedFeatures.map(id => 
        featuresList.find(f => f.id === id)?.label || id
      ),
      description: formData.get('description') as string,
      contactEmail: formData.get('contactEmail') as string,
      phone: formData.get('phone') as string,
      references: formData.get('references') as string,
    }

    const result = await createOrder(data)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Project brief submitted successfully!')
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Start Your Project</h1>
        <p className="text-muted-foreground mt-1">
          Tell us about your idea so we can review the scope and plan your project
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Basic details about your business or brand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business / Brand Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Enter your business name"
                required
                className="h-12"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="websiteType">Type of Project *</Label>
                <Select name="websiteType" required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {websiteTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range *</Label>
                <Select name="budget" required>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map(range => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="deadline">Preferred Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pages">Number of Pages</Label>
                <Input
                  id="pages"
                  name="pages"
                  placeholder="e.g., 5-10 pages"
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Preferences */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Design Preferences</CardTitle>
            <CardDescription>
              Help us understand your visual style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="designStyle">Design Style</Label>
              <Select name="designStyle">
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {designStyles.map(style => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Features Needed</Label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {featuresList.map(feature => (
                  <label
                    key={feature.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFeatures.includes(feature.id)
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <Checkbox
                      id={feature.id}
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                    <span className="text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Describe your project in detail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your project, goals, target audience, and any specific requirements..."
                required
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="references">Reference Links / Inspiration</Label>
              <Textarea
                id="references"
                name="references"
                placeholder="Share any website links that inspire you or represent the style you're looking for..."
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How can we reach you about this project?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            className="glow min-h-[48px] flex-1 sm:flex-none sm:px-12"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Send Project Brief
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-[48px]"
            asChild
          >
            <Link href="/dashboard">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
