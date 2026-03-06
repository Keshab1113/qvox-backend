import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Info, Trash2 } from 'lucide-react'

const variantConfig = {
  destructive: {
    icon: Trash2,
    iconClassName: 'text-red-600',
    titleClassName: 'text-red-600',
    buttonVariant: 'destructive',
    defaultTitle: 'Are you sure?',
    defaultDescription: 'This action cannot be undone.'
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'text-yellow-600',
    titleClassName: 'text-yellow-600',
    buttonVariant: 'default',
    defaultTitle: 'Please confirm',
    defaultDescription: 'Are you sure you want to proceed?'
  },
  info: {
    icon: Info,
    iconClassName: 'text-blue-600',
    titleClassName: 'text-blue-600',
    buttonVariant: 'default',
    defaultTitle: 'Information',
    defaultDescription: ''
  }
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  variant = 'destructive',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`rounded-full bg-opacity-20 p-2 ${config.iconClassName} bg-current`}>
                <Icon className={`h-5 w-5 ${config.iconClassName}`} />
              </div>
            )}
            <AlertDialogTitle className={config.titleClassName}>
              {title || config.defaultTitle}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2">
            {description || config.defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}