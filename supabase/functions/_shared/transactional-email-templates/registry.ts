/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as orderStatusUpdate } from './order-status-update.tsx'
import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as contactNotification } from './contact-notification.tsx'
import { template as welcomeEmail } from './welcome-email.tsx'
import { template as coinPurchaseConfirmation } from './coin-purchase-confirmation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'order-status-update': orderStatusUpdate,
  'contact-confirmation': contactConfirmation,
  'contact-notification': contactNotification,
  'welcome-email': welcomeEmail,
  'coin-purchase-confirmation': coinPurchaseConfirmation,
}
