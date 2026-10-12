'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Archive,
  Bell,
  FileText,
  FolderOpen,
  Grid2X2,
  Inbox,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Shield,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/(auth)/actions'

interface SidebarProps {
  isAdmin?: boolean
  userName?: string
  userEmail?: string
  role?: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Grid2X2 },
  { href: '/dashboard/orders', label: 'Projects', icon: FolderOpen },
  { href: '/dashboard/new-order', label: 'New Order', icon: Plus },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/files', label: 'Files', icon: FileText },
  { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const initialNotifications = [
  {
    id: 1,
    title: 'Project request received',
    description: 'Your website order was created successfully.',
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Design review pending',
    description: 'Koryx will review your project details soon.',
    time: '12m ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Client dashboard is ready',
    description: 'You can now track projects, files, and updates here.',
    time: '1h ago',
    unread: false,
  },
]

export function Sidebar({ isAdmin, userName, userEmail, role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [archivedNotifications, setArchivedNotifications] = useState<typeof initialNotifications>([])
  const [notificationTab, setNotificationTab] = useState<'inbox' | 'archive' | 'comments'>('inbox')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const desktopNotificationsRef = useRef<HTMLDivElement | null>(null)
  const desktopAccountMenuRef = useRef<HTMLDivElement | null>(null)
  const desktopAccountTriggerRef = useRef<HTMLDivElement | null>(null)
  const desktopNotificationsTriggerRef = useRef<HTMLButtonElement | null>(null)

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  )

  useEffect(() => {
    setMobileOpen(false)
    setAccountMenuOpen(false)
    setNotificationsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node

      const insideDesktopAccountMenu = !!desktopAccountMenuRef.current?.contains(target)
      const insideDesktopAccountTrigger = !!desktopAccountTriggerRef.current?.contains(target)
      const insideDesktopNotifications = !!desktopNotificationsRef.current?.contains(target)
      const insideDesktopNotificationsTrigger = !!desktopNotificationsTriggerRef.current?.contains(target)

      if (accountMenuOpen && !insideDesktopAccountMenu && !insideDesktopAccountTrigger) {
        setAccountMenuOpen(false)
      }

      if (notificationsOpen && !insideDesktopNotifications && !insideDesktopNotificationsTrigger) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [accountMenuOpen, notificationsOpen, mobileOpen])

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [mobileOpen])

  function archiveNotification(id: number) {
    setNotifications((current) => {
      const item = current.find((notification) => notification.id === id)

      if (item) {
        setArchivedNotifications((archive) => [{ ...item, unread: false }, ...archive])
      }

      return current.filter((notification) => notification.id !== id)
    })
  }

  function archiveAll() {
    setArchivedNotifications((archive) => [
      ...notifications.map((item) => ({ ...item, unread: false })),
      ...archive,
    ])
    setNotifications([])
  }

  function closeAllMenus() {
    setAccountMenuOpen(false)
    setNotificationsOpen(false)
  }

  function navigateTo(path: string) {
    closeAllMenus()
    setMobileOpen(false)
    router.push(path)
  }

  const NotificationsPanel = ({
    mobile = false,
  }: {
    mobile?: boolean
  }) => (
    <div
      ref={!mobile ? desktopNotificationsRef : undefined}
      className={cn(
        'overflow-hidden rounded-2xl border border-white/[0.12] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.75)]',
        mobile
  ? 'fixed left-0 bottom-3 z-[140] w-[292px] max-w-[calc(100vw-12px)] max-h-[min(70vh,560px)]'
  : 'absolute bottom-11 left-0 right-0 z-[90] md:right-auto md:w-[408px]'
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex h-11 items-center border-b border-white/[0.08]">
        <button
          type="button"
          onClick={() => setNotificationTab('inbox')}
          className={cn(
            'h-full px-4 text-sm font-medium transition-none',
            notificationTab === 'inbox'
              ? 'border-b border-blue-500 text-white'
              : 'text-white/45 hover:text-white'
          )}
        >
          Inbox
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-white/[0.12] px-1.5 py-0.5 text-xs text-white/70">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setNotificationTab('archive')}
          className={cn(
            'h-full px-4 text-sm font-medium transition-none',
            notificationTab === 'archive'
              ? 'border-b border-blue-500 text-white'
              : 'text-white/45 hover:text-white'
          )}
        >
          Archive
        </button>

        <button
          type="button"
          onClick={() => setNotificationTab('comments')}
          className={cn(
            'h-full px-4 text-sm font-medium transition-none',
            notificationTab === 'comments'
              ? 'border-b border-blue-500 text-white'
              : 'text-white/45 hover:text-white'
          )}
        >
          Comments
        </button>

        {mobile ? (
          <button
            type="button"
            onClick={() => setNotificationsOpen(false)}
            className="ml-auto mr-2 flex h-8 w-8 items-center justify-center rounded-md text-white/45 hover:bg-white/[0.07] hover:text-white"
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            className="ml-auto mr-2 flex h-8 w-8 items-center justify-center rounded-md text-white/45 transition-none hover:bg-white/[0.07] hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={cn('overflow-y-auto', mobile ? 'max-h-[calc(min(70vh,560px)-44px)]' : 'max-h-[420px]')}>
        {notificationTab === 'inbox' && (
          notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                className="group flex gap-3 border-b border-white/[0.08] px-4 py-4 transition-none hover:bg-white/[0.055]"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-400">
                  <Inbox className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5 text-white">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-white/50">
                    {item.description}
                  </p>
                  <p className="mt-1 text-xs text-white/35">{item.time}</p>
                </div>

                <button
                  type="button"
                  onClick={() => archiveNotification(item.id)}
                  className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/40 transition-none hover:bg-white/[0.08] hover:text-white group-hover:flex"
                  aria-label="Archive notification"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-16 text-center">
              <Archive className="mx-auto h-8 w-8 text-white/25" />
              <p className="mt-4 text-sm text-white/45">Nothing in the inbox</p>
            </div>
          )
        )}

        {notificationTab === 'archive' && (
          archivedNotifications.length > 0 ? (
            archivedNotifications.map((item) => (
              <div key={item.id} className="border-b border-white/[0.08] px-4 py-4">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm text-white/45">{item.description}</p>
                <p className="mt-1 text-xs text-white/30">{item.time}</p>
              </div>
            ))
          ) : (
            <div className="px-4 py-16 text-center">
              <Archive className="mx-auto h-8 w-8 text-white/25" />
              <p className="mt-4 text-sm text-white/45">Nothing in the archive</p>
            </div>
          )
        )}

        {notificationTab === 'comments' && (
          <div className="px-4 py-16 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-white/25" />
            <p className="mt-4 text-sm text-white/45">No new comments</p>
          </div>
        )}
      </div>

      {notificationTab === 'inbox' && notifications.length > 0 && (
        <button
          type="button"
          onClick={archiveAll}
          className="flex h-10 w-full items-center justify-center border-t border-white/[0.08] text-sm font-medium text-white/70 transition-none hover:bg-white/[0.06] hover:text-white"
        >
          Archive All
        </button>
      )}
    </div>
  )

  const AccountMenu = ({
    mobile = false,
  }: {
    mobile?: boolean
  }) => (
    <div
      ref={!mobile ? desktopAccountMenuRef : undefined}
      className={cn(
        'overflow-hidden rounded-2xl border border-white/[0.12] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.75)]',
        mobile
  ? 'fixed left-0 bottom-3 z-[150] w-[292px] max-w-[calc(100vw-12px)]'
  : 'absolute bottom-11 left-0 right-0 z-[90]'
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative border-b border-white/[0.08] p-4">
        {mobile && (
          <button
            type="button"
            onClick={() => setAccountMenuOpen(false)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:bg-white/[0.07] hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <p className="truncate text-sm font-medium text-white">{userName || 'User'}</p>
        <p className="mt-1 truncate text-xs text-white/45">{userEmail}</p>
        <p className="mt-2 inline-flex rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
          {role || 'Client'}
        </p>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={() => navigateTo('/dashboard/settings')}
          className="flex h-11 w-full items-center justify-between rounded-md px-3 text-sm text-white/70 transition-none hover:bg-white/[0.07] hover:text-white active:bg-white/[0.1]"
        >
          <span>Settings</span>
          <Settings className="h-4 w-4 text-white/40" />
        </button>

        <button
          type="button"
          onClick={() => navigateTo('/dashboard/support')}
          className="flex h-11 w-full items-center justify-between rounded-md px-3 text-sm text-white/70 transition-none hover:bg-white/[0.07] hover:text-white active:bg-white/[0.1]"
        >
          <span>Help</span>
          <LifeBuoy className="h-4 w-4 text-white/40" />
        </button>

        <form action={logout}>
          <button
            type="submit"
            className="mt-2 flex h-11 w-full items-center justify-between rounded-md bg-white text-sm font-medium text-black transition-none hover:bg-white/90 active:bg-white/80"
          >
            <span className="px-3">Log Out</span>
            <LogOut className="mr-3 h-4 w-4 text-black/60" />
          </button>
        </form>
      </div>
    </div>
  )

  const SidebarContent = ({ mobileView = false }: { mobileView?: boolean }) => (
    <>
      <div className="flex h-14 items-center border-b border-white/[0.08] px-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <Image src="/koryx-logo.png" alt="Koryx" width={140} height={36} className="h-auto w-[120px]" />
        </Link>
      </div>

      <div className="border-b border-white/[0.08] p-3">
        <div className="flex h-9 items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.03] px-2.5 text-white/40">
          <Search className="h-4 w-4" />
          <span className="text-sm">Find...</span>
          <span className="ml-auto rounded border border-white/[0.12] px-1.5 py-0.5 text-xs text-white/45">
            F
          </span>
        </div>
      </div>

      <nav className={cn('relative z-0 flex-1 overflow-y-auto px-2 py-3', mobileView && 'pb-24')}>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  closeAllMenus()
                  setMobileOpen(false)
                }}
                className={cn(
                  'flex h-9 items-center gap-3 rounded-md px-3 text-[14px] font-medium transition-none',
                  isActive
                    ? 'bg-white/[0.11] text-white'
                    : 'text-white/58 hover:bg-white/[0.07] hover:text-white'
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {isAdmin === true && (
            <Link
              href="/dashboard/admin"
              onClick={() => {
                closeAllMenus()
                setMobileOpen(false)
              }}
              className={cn(
                'flex h-9 items-center gap-3 rounded-md px-3 text-[14px] font-medium transition-none',
                pathname.startsWith('/dashboard/admin')
                  ? 'bg-white/[0.11] text-white'
                  : 'text-white/58 hover:bg-white/[0.07] hover:text-white'
              )}
            >
              <Shield className="h-4.5 w-4.5 shrink-0" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>
      </nav>

      {mobileView ? (
        <div className="border-t border-white/[0.08] p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen((prev) => !prev)
                setNotificationsOpen(false)
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm font-medium text-white/75 active:bg-white/[0.1]"
            >
              <User className="h-4 w-4" />
              <span>Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev)
                setAccountMenuOpen(false)
              }}
              className="relative flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm font-medium text-white/75 active:bg-white/[0.1]"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute right-3 top-2.5 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setAccountMenuOpen((prev) => !prev)
              setNotificationsOpen(false)
            }}
            className="mt-2 flex min-w-0 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-none active:bg-white/[0.08]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.11] text-sm font-semibold text-white">
              {(userName || userEmail || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-4 text-white">
                {userName || 'User'}
              </p>
              <p className="truncate text-xs leading-4 text-white/42">
                {role || 'Client'}
              </p>
            </div>

            <MoreHorizontal className="h-4 w-4 text-white/50" />
          </button>
        </div>
      ) : (
        <div className="relative z-[95] border-t border-white/[0.08] p-2">
          <div ref={desktopAccountTriggerRef} className="relative flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen((prev) => !prev)
                setNotificationsOpen(false)
              }}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left transition-none hover:bg-white/[0.06]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.11] text-sm font-semibold text-white">
                {(userName || userEmail || 'U').charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-4 text-white">
                  {userName || 'User'}
                </p>
                <p className="truncate text-xs leading-4 text-white/42">
                  {role || 'Client'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen((prev) => !prev)
                setNotificationsOpen(false)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition-none hover:bg-white/[0.07] hover:text-white"
              aria-label="Account menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            <button
              ref={desktopNotificationsTriggerRef}
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev)
                setAccountMenuOpen(false)
              }}
              className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition-none hover:bg-white/[0.07] hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </button>

            {accountMenuOpen && <AccountMenu />}
            {notificationsOpen && <NotificationsPanel />}
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.08] bg-black px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/koryx-logo.png" alt="Koryx" width={140} height={36} className="h-auto w-[120px]" />
        </Link>

        <button
          type="button"
          onClick={() => {
            setMobileOpen((prev) => {
              const next = !prev
              if (!next) {
                closeAllMenus()
              }
              return next
            })
          }}
          className="rounded-md p-2 text-white/60 hover:bg-white/[0.07] hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => {
            setMobileOpen(false)
            closeAllMenus()
          }}
        />
      )}

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-14 z-[80] flex w-[292px] flex-col border-r border-white/[0.08] bg-black transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <SidebarContent mobileView />
      </aside>

      <aside className="fixed bottom-0 left-0 top-0 hidden w-[292px] flex-col border-r border-white/[0.08] bg-black lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && accountMenuOpen && <AccountMenu mobile />}
      {mobileOpen && notificationsOpen && <NotificationsPanel mobile />}
    </>
  )
}
