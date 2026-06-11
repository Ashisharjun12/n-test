import { useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import useCompanyStore from '@/store/company.store'
import React, { useEffect } from 'react'

const EMPTY = {
  name: '', gst: '', pan: '', tradeName: '',
  phone: '', alternatePhone: '', email: '', website: '',
  billingAddress: { line1: '', line2: '', city: '', state: '', pincode: '' },
}

function FieldRow({ label, id, ...inputProps }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-medium text-[#0a0b0d]">{label}</Label>
      <Input
        id={id}
        className="h-11 rounded-[10px] border-[#dee1e6] bg-white px-3 text-[14px] text-[#0a0b0d] placeholder:text-[#a8acb3] focus-visible:border-[#0052ff] focus-visible:ring-[#0052ff]/20"
        {...inputProps}
      />
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#7c828a] mt-2 mb-3">
      {children}
    </p>
  )
}

export default function EditCompanySheet({ open, onClose, company }) {
  const { updateCompany, isLoading, error, clearError } = useCompanyStore()
  const [form, setForm] = useState(EMPTY)

  // Pre-fill form when sheet opens or company changes
  useEffect(() => {
    if (company && open) {
      setForm({
        name: company.name || '',
        gst: company.gst || '',
        pan: company.pan || '',
        tradeName: company.tradeName || '',
        phone: company.phone || '',
        alternatePhone: company.alternatePhone || '',
        email: company.email || '',
        website: company.website || '',
        billingAddress: company.billingAddress || { line1: '', line2: '', city: '', state: '', pincode: '' },
      })
    } else if (!open) {
      setForm(EMPTY)
      clearError()
    }
  }, [company, open])

  const set = (field, value) => {
    clearError()
    setForm((p) => ({ ...p, [field]: value }))
  }
  const setAddr = (field, value) => {
    clearError()
    setForm((p) => ({ ...p, billingAddress: { ...p.billingAddress, [field]: value } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return

    try {
      await updateCompany(company._id, {
        name: form.name,
        gst: form.gst || undefined,
        pan: form.pan || undefined,
        tradeName: form.tradeName || undefined,
        phone: form.phone || undefined,
        alternatePhone: form.alternatePhone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        billingAddress: Object.values(form.billingAddress).some(Boolean)
          ? form.billingAddress
          : undefined,
      })
      onClose()
    } catch (_) {}
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-[24px] p-0 max-h-[90vh] overflow-y-auto border-0"
        style={{ background: '#ffffff', boxShadow: '0 -4px 32px rgba(0,0,0,0.10)' }}
        showCloseButton={false}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#dee1e6]" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-4 border-b border-[#dee1e6]">
          <p className="text-[18px] font-semibold text-[#0a0b0d]">Edit Company</p>
          <p className="text-[13px] text-[#7c828a] mt-0.5">Update your business details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-5 space-y-4">

            {/* Business info */}
            <SectionLabel>Business Info</SectionLabel>
            <FieldRow label="Business Name *" id="co-name" required
              value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Ashish Enterprises" />
            <FieldRow label="Trade Name" id="co-trade"
              value={form.tradeName} onChange={e => set('tradeName', e.target.value)}
              placeholder="Optional trade / brand name" />

            {/* Tax */}
            <SectionLabel>Tax Details</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="GST Number" id="co-gst"
                value={form.gst} onChange={e => set('gst', e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5" maxLength={15} />
              <FieldRow label="PAN" id="co-pan"
                value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())}
                placeholder="AAAAA0000A" maxLength={10} />
            </div>

            {/* Contact */}
            <SectionLabel>Contact</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Phone" id="co-phone" type="tel"
                value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="9876543210" />
              <FieldRow label="Alternate Phone" id="co-alt"
                value={form.alternatePhone} onChange={e => set('alternatePhone', e.target.value)}
                placeholder="Optional" />
            </div>
            <FieldRow label="Business Email" id="co-email" type="email"
              value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="business@example.com" />
            <FieldRow label="Website" id="co-web"
              value={form.website} onChange={e => set('website', e.target.value)}
              placeholder="https://yoursite.com" />

            {/* Billing Address */}
            <SectionLabel>Billing Address</SectionLabel>
            <FieldRow label="Address Line 1" id="co-a1"
              value={form.billingAddress.line1} onChange={e => setAddr('line1', e.target.value)}
              placeholder="House / Flat / Block no." />
            <FieldRow label="Address Line 2" id="co-a2"
              value={form.billingAddress.line2} onChange={e => setAddr('line2', e.target.value)}
              placeholder="Street, Locality" />
            <div className="grid grid-cols-3 gap-3">
              <FieldRow label="City" id="co-city"
                value={form.billingAddress.city} onChange={e => setAddr('city', e.target.value)}
                placeholder="Mumbai" />
              <FieldRow label="State" id="co-state"
                value={form.billingAddress.state} onChange={e => setAddr('state', e.target.value)}
                placeholder="Maharashtra" />
              <FieldRow label="Pincode" id="co-pin"
                value={form.billingAddress.pincode} onChange={e => setAddr('pincode', e.target.value)}
                placeholder="400001" maxLength={6} />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-[13px] text-[#cf202f]">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 px-5 pb-8 pt-4 bg-white border-t border-[#dee1e6] flex gap-3">
            <button type="button" onClick={onClose}
              className="cursor-pointer flex-1 h-11 rounded-full border border-[#dee1e6] text-[14px] font-semibold text-[#5b616e] hover:bg-[#f7f7f7] transition-colors">
              Cancel
            </button>
            <Button type="submit" disabled={isLoading || !form.name.trim()}
              className={cn(
                'flex-1 h-11 cursor-pointer rounded-full bg-[#0052ff] text-[14px] font-semibold text-white hover:bg-[#003ecc] transition-colors',
                (isLoading || !form.name.trim()) && 'opacity-60 cursor-not-allowed'
              )}>
              {isLoading ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
