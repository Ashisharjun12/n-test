import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Receipt, ChevronRight,
  Users, Package, FileText, BarChart3,
  Building2, ChevronDown, Plus, MoreHorizontal, Edit, Trash2
} from 'lucide-react'
import ProfileMenu from '@/components/shared/ProfileMenu'
import useAuthStore from '@/store/auth.store'
import useCompanyStore from '@/store/company.store'
import AddCompanySheet from '@/module/company/components/AddCompanySheet'
import EditCompanySheet from '@/module/company/components/EditCompanySheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const FEATURES = [
  {
    id: 'quotations',
    icon: Receipt,
    label: 'Quotations',
    desc: 'Create, send and track estimates for your customers.',
    color: '#0052ff',
    bg: '#e8eeff',
    route: '/quotations',
    active: true,
  },
  {
    id: 'invoices',
    icon: FileText,
    label: 'Invoices',
    desc: 'Generate GST-ready tax invoices instantly.',
    color: '#05b169',
    bg: '#e6f8f0',
    route: null,
    active: false,
  },
  {
    id: 'customers',
    icon: Users,
    label: 'Customers',
    desc: 'Manage your customer contacts and history.',
    color: '#f4b000',
    bg: '#fef8e6',
    route: null,
    active: false,
  },
  {
    id: 'products',
    icon: Package,
    label: 'Products',
    desc: 'Manage catalog, inventory and pricing.',
    color: '#7c828a',
    bg: '#eef0f3',
    route: null,
    active: false,
  },
  {
    id: 'reports',
    icon: BarChart3,
    label: 'Reports',
    desc: 'Sales analytics and business insights.',
    color: '#7c828a',
    bg: '#eef0f3',
    route: null,
    active: false,
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  const firstName = user?.name?.split(' ')[0] || 'there'
  const { activeCompany, companies, fetchCompanies, setActiveCompany, deleteCompany } = useCompanyStore()
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showSwitch, setShowSwitch]         = useState(false)

  const [showEditCompany, setShowEditCompany] = useState(false)
  const [companyToEdit, setCompanyToEdit] = useState(null)
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState(null)
  
  const [showOptionsId, setShowOptionsId] = useState(null)

  const handleDeleteCompany = async () => {
    if (companyToDelete) {
      await deleteCompany(companyToDelete._id)
      setCompanyToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  useEffect(() => {
    if (user?._id) fetchCompanies(user._id)
  }, [user?._id])

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{ height: 64, background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid #dee1e6' }}
      >
        <div className="max-w-3xl mx-auto px-5 h-full flex items-center justify-between">
          <span className="text-[20px] font-bold tracking-tight select-none" style={{ color: '#0052ff' }}>
            nero.
          </span>
          <ProfileMenu />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">

        {/* Greeting + company selector */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] text-[#7c828a] truncate">Good day,</p>
            <h1 className="text-[28px] font-semibold tracking-[-0.4px] text-[#0a0b0d] truncate">
              Hey {firstName} 👋
            </h1>
          </div>

          {/* Company dropdown pill */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSwitch((v) => !v)}
              className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#dee1e6] bg-white hover:border-[#c8cbd1] hover:shadow-sm transition-all text-left"
            >
              <div className="flex size-6 items-center justify-center rounded-[6px]" style={{ background: '#e8eeff' }}>
                <Building2 className="size-3.5" style={{ color: '#0052ff' }} />
              </div>
              <span className="text-[13px] font-medium text-[#0a0b0d] max-w-[140px] truncate">
                {activeCompany?.name || 'No company'}
              </span>
              <ChevronDown className="size-3.5 text-[#7c828a]" />
            </button>

            {/* Switch dropdown */}
            {showSwitch && (
              <div
                className="absolute top-full right-0 mt-2 z-30 w-64 rounded-[16px] border border-[#dee1e6] bg-white p-2"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
              >
                {companies.map((c) => (
                  <div key={c._id} className="relative flex items-center group">
                    <button
                      onClick={() => { setActiveCompany(c); setShowSwitch(false) }}
                      className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left hover:bg-[#f7f7f7] transition-colors pr-10"
                    >
                      <div className="flex size-7 items-center justify-center rounded-[8px] shrink-0"
                        style={{ background: c._id === activeCompany?._id ? '#e8eeff' : '#eef0f3' }}>
                        <Building2 className="size-3.5"
                          style={{ color: c._id === activeCompany?._id ? '#0052ff' : '#7c828a' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#0a0b0d] truncate">{c.name}</p>
                        {c.gst && <p className="text-[11px] text-[#7c828a] truncate">GST: {c.gst}</p>}
                      </div>
                      {c._id === activeCompany?._id && (
                        <span className="text-[10px] font-bold text-[#0052ff] shrink-0">✓</span>
                      )}
                    </button>
                    
                    <div className="absolute right-2 flex items-center z-10">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation() 
                          setShowOptionsId(showOptionsId === c._id ? null : c._id) 
                        }}
                        className="p-1.5 hover:bg-[#eef0f3] rounded-[6px] text-[#7c828a] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        style={{ opacity: showOptionsId === c._id ? 1 : undefined }}
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                      
                      {showOptionsId === c._id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-[#dee1e6] py-1 z-50">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation() 
                              setShowOptionsId(null) 
                              setCompanyToEdit(c) 
                              setShowEditCompany(true) 
                              setShowSwitch(false)
                            }}
                            className="cursor-pointer w-full text-left px-3 py-1.5 text-[13px] hover:bg-[#f7f7f7] flex items-center gap-2 text-[#0a0b0d] transition-colors"
                          >
                            <Edit className="size-3.5" /> Edit
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation() 
                              setShowOptionsId(null) 
                              setCompanyToDelete(c) 
                              setShowDeleteConfirm(true) 
                              setShowSwitch(false)
                            }}
                            className="cursor-pointer w-full text-left px-3 py-1.5 text-[13px] hover:bg-red-50 flex items-center gap-2 text-[#cf202f] transition-colors"
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="h-px bg-[#eef0f3] mx-2 my-1" />

                <button
                  onClick={() => { setShowSwitch(false); setShowAddCompany(true) }}
                  className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left hover:bg-[#f7f7f7] transition-colors text-[#0052ff]"
                >
                  <div className="flex size-7 items-center justify-center rounded-[8px]" style={{ background: '#e8eeff' }}>
                    <Plus className="size-3.5" style={{ color: '#0052ff' }} />
                  </div>
                  <span className="text-[13px] font-semibold">Add New Company</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ id, icon: Icon, label, desc, color, bg, route, active }) => (
            <button
              key={id}
              onClick={() => active && route && navigate(route)}
              className="text-left rounded-[24px] p-5 transition-all border"
              style={{
                borderColor: '#dee1e6',
                background: '#ffffff',
                cursor: active ? 'pointer' : 'default',
                opacity: active ? 1 : 0.55,
              }}
              onMouseEnter={e => {
                if (!active) return
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)'
                e.currentTarget.style.borderColor = '#c8cbd1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#dee1e6'
              }}
            >
              {/* Icon + badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex size-11 items-center justify-center rounded-[14px]"
                  style={{ background: bg }}
                >
                  <Icon className="size-5" style={{ color }} />
                </div>
                {!active && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                    style={{ background: '#eef0f3', color: '#7c828a' }}
                  >
                    Soon
                  </span>
                )}
                {active && (
                  <ChevronRight className="size-4 mt-0.5" style={{ color: '#a8acb3' }} />
                )}
              </div>

              {/* Text */}
              <p className="text-[16px] font-semibold tracking-tight text-[#0a0b0d]">{label}</p>
              <p className="text-[13px] text-[#5b616e] mt-0.5 leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Click-outside backdrop for company switcher */}
      {showSwitch && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowSwitch(false)}
        />
      )}

      {/* Add Company Sheet */}
      <AddCompanySheet
        open={showAddCompany}
        onClose={() => setShowAddCompany(false)}
      />

      {/* Edit Company Sheet */}
      <EditCompanySheet
        open={showEditCompany}
        onClose={() => { setShowEditCompany(false); setCompanyToEdit(null); }}
        company={companyToEdit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => {
        setShowDeleteConfirm(open);
        if (!open) setCompanyToDelete(null);
      }}>
        <AlertDialogContent className="rounded-[24px] bg-white border border-[#dee1e6] p-6 max-w-[400px]" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-semibold text-[#0a0b0d]">Delete Company</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-[#5b616e] mt-2">
              Are you sure you want to delete <strong className="text-[#0a0b0d]">{companyToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 border-t-0 p-0 bg-transparent w-full">
            <AlertDialogCancel className="cursor-pointer mt-0 sm:mt-0 w-full sm:flex-1 h-11 rounded-full border border-[#dee1e6] text-[14px] font-semibold text-[#5b616e] hover:bg-[#f7f7f7] hover:text-[#5b616e] transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany} className="cursor-pointer w-full sm:flex-1 h-11 rounded-full bg-[#cf202f] text-[14px] font-semibold text-white hover:bg-[#a11824] transition-colors">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
