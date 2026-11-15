import { cn } from '@/lib/utils'
import { LayoutDashboard, Inbox, Users, Settings, Sparkles } from 'lucide-react'

export function Sidebar({ currentPath, onNavigate, onToggleAskInbox }) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Threads', path: '/thread', icon: Inbox },
    { label: 'Clients', path: '/client', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-screen justify-between p-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md font-bold text-sm">
            AI
          </div>
          <span className="font-semibold text-lg tracking-tight">EmailAssist</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path
            return (
              <button
                key={item.path}
                onClick={() => onNavigate && onNavigate(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.path === '/thread' ? 'Threads' : item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t">
        <button
          onClick={onToggleAskInbox}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          Ask Inbox
        </button>
      </div>
    </aside>
  )
}
