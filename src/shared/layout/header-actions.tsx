type HeaderActionsProps = {
  children?: React.ReactNode
}

export function HeaderActions({ children }: HeaderActionsProps) {
  return <div className='flex items-center gap-3'>{children}</div>
}
