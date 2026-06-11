import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import useAuthStore from '@/store/auth.store'

export default function ProfileMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="cursor-pointer flex items-center justify-center size-9 rounded-full font-semibold text-[13px] text-white select-none transition-opacity hover:opacity-80 focus:outline-none"
        style={{ background: '#0052ff' }}
        aria-label="Profile menu"
      >
        {initials}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-[16px] border border-[#dee1e6] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
      >
        {/* User info */}
        <div className="px-2 py-1.5">
          <p className="text-[13px] font-semibold text-[#0a0b0d] leading-tight">{user?.name}</p>
          <p className="text-[11px] text-[#7c828a] truncate mt-0.5">{user?.email}</p>
        </div>

        <DropdownMenuSeparator className="my-1 bg-[#eef0f3]" />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2.5 px-2 py-2.5 rounded-[10px] text-[14px] text-[#cf202f] focus:bg-red-50 focus:text-[#cf202f]"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
