import { Sidebar } from './Sidebar'
import GlassTopbar from './GlassTopbar'
import { BottomNav } from './BottomNav'

interface PageWrapperProps {
  children: React.ReactNode
  showBack?: boolean
}

export default function PageWrapper({ children, showBack }: PageWrapperProps) {
  return (
    <>
      <Sidebar />
      <GlassTopbar showBack={showBack} />
      <div className="main-content">
        {children}
      </div>
      <BottomNav />
    </>
  )
}
