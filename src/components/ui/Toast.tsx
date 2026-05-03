export { toast as Toast, Toaster, toast } from "@/lib/toast-shim"

import { toast } from "@/lib/toast-shim"

export const showToast = {
  success: (msg: string) => toast.success(msg),
  error:   (msg: string) => toast.error(msg),
  info:    (msg: string) => toast(msg),
}
