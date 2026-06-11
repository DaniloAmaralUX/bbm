import { FilePlus2, FileText, LayoutDashboard } from 'lucide-react'
import { appIdentity, currentUser } from '@/features/tr/data/app'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.avatar,
  },
  teams: [],
  navGroups: [
    {
      title: appIdentity.name,
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'TRs',
          url: '/trs',
          icon: FileText,
        },
        {
          title: 'Novo TR',
          url: '/novo-tr',
          icon: FilePlus2,
        },
      ],
    },
  ],
}
