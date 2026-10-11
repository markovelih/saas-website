'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/supabase/types'
import { Loader2, Save, Send, CreditCard, CheckCircle } from 'lucide-react'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'invoice_sent', label: 'Invoice Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export function AdminOrderActions({ order }: { order: Order }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(order.status)
  const [quotePrice, setQuotePrice] = useState(order.quote_price?.toString() || '')
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '')

  const handleUpdateOrder = async () => {
    setLoading(true)
    const supabase = createClient()
    
    await supabase
      .from('orders')
      .update({
        status,
        quote_price: quotePrice ? parseFloat(quotePrice) : null,
        admin_notes: adminNotes,
      })
      .eq('id', order.id)
    
    setLoading(false)
    router.refresh()
  }

  const handleMarkInvoiceSent = async () => {
    setLoading(true)
    const supabase = createClient()
    
    await supabase
      .from('orders')
      .update({
        invoice_sent: true,
        status: 'invoice_sent',
      })
      .eq('id', order.id)
    
    setLoading(false)
    router.refresh()
  }

  const handleMarkPaid = async () => {
    setLoading(true)
    const supabase = createClient()
    
    await supabase
      .from('orders')
      .update({
        paid: true,
        status: 'paid',
      })
      .eq('id', order.id)
    
    setLoading(false)
    router.refresh()
  }

  const handleMarkCompleted = async () => {
    setLoading(true)
    const supabase = createClient()
    
    await supabase
      .from('orders')
      .update({
        status: 'completed',
      })
      .eq('id', order.id)
    
    setLoading(false)
    router.refresh()
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="space-y-2">
          <Label>Order Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as Order["status"])}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quote Price */}
        <div className="space-y-2">
          <Label>Quote Price ($)</Label>
          <Input
            type="number"
            value={quotePrice}
            onChange={(e) => setQuotePrice(e.target.value)}
            placeholder="Enter price"
            className="bg-input border-border"
          />
        </div>

        {/* Admin Notes */}
        <div className="space-y-2">
          <Label>Admin Notes</Label>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Internal notes about this order..."
            rows={4}
            className="bg-input border-border resize-none"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleUpdateOrder}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>

        {/* Quick Actions */}
        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground">Quick Actions</p>
          
          {!order.invoice_sent && (
            <Button
              variant="outline"
              onClick={handleMarkInvoiceSent}
              disabled={loading}
              className="w-full justify-start"
            >
              <Send className="h-4 w-4 mr-2" />
              Mark Invoice as Sent
            </Button>
          )}
          
          {!order.paid && (
            <Button
              variant="outline"
              onClick={handleMarkPaid}
              disabled={loading}
              className="w-full justify-start text-green-400 hover:text-green-300 border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          
          {order.status !== 'completed' && (
            <Button
              variant="outline"
              onClick={handleMarkCompleted}
              disabled={loading}
              className="w-full justify-start text-blue-400 hover:text-blue-300 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
