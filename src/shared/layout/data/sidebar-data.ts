import {
  FilePlus2,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
} from 'lucide-react'
import { appIdentity, currentUser } from '@/features/documents/data/app'
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
          title: 'Documentos',
          url: '/documentos',
          icon: FileText,
        },
        {
          title: 'Modelos',
          url: '/modelos',
          icon: LayoutTemplate,
        },
        {
          title: 'Novo documento',
          url: '/documentos/novo',
          icon: FilePlus2,
        },
      ],
    },
  ],
}
