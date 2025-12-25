import { FC, ReactNode } from 'react'

import { Progress } from './ui/progress'
import { ReloadIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

export interface InformationPopinProps {
    children: ReactNode
    id?: string
    display: boolean
    title: string
    progress?: number
    className?: string
    showSpinner?: boolean
    showProgress?: boolean
    footer?: ReactNode
    isAlert?: boolean
    errorLink?: {
        label: string
        url: string
    }
}

export const InformationPopin: FC<InformationPopinProps> = ({
    id,
    children,
    display,
    title,
    progress,
    className,
    showSpinner = false,
    showProgress = false,
    footer,
    errorLink: _errorLink,
    isAlert = false,
}) => {
    if (!display) return null

    return (
        <div id={id} className="fixed top-0 left-0 z-50 h-screen w-screen">
            <div className="bg-background/70 absolute h-full w-full"></div>
            <div className="absolute grid h-full w-full place-content-center p-4">
                <div
                    className={cn(
                        'border-primary bg-background shadow-primary/50 relative flex w-full max-w-[600px] min-w-[300px] flex-col items-center gap-2 rounded-md border px-6 py-4 shadow-lg',
                        isAlert && 'border-red-500 bg-red-500/10',
                        className
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center font-black',
                            isAlert ? '!text-red-500' : '!text-primary',
                            className
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <span>{title}</span>
                            {showSpinner && (
                                <ReloadIcon className="mr-2 size-4 animate-spin" />
                            )}
                        </div>
                    </div>
                    <div className="flex w-full flex-col items-center text-center">
                        {children}
                    </div>
                    {showProgress && (
                        <div className="flex w-full items-center">
                            <Progress value={progress} className="h-2 w-full" />
                        </div>
                    )}
                    {footer}
                </div>
            </div>
        </div>
    )
}
