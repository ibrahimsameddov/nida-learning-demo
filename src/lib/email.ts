/**
 * Client-side email via EmailJS.
 * Configure three env vars in .env.local:
 *   VITE_EMAILJS_SERVICE_ID   — your EmailJS service ID
 *   VITE_EMAILJS_TEMPLATE_ID  — template ID (see below for required params)
 *   VITE_EMAILJS_PUBLIC_KEY   — EmailJS public key
 *
 * Required template params:
 *   {{to_email}}       — parent's email address
 *   {{student_name}}   — student's full name
 *   {{student_age}}    — student's age
 *   {{platform_url}}   — link to the platform (for parent to create/login)
 *   {{message}}        — full body text
 */

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

export async function sendParentalConsentEmail({
  parentEmail,
  studentName,
  studentAge,
}: {
  parentEmail: string
  studentName: string
  studentAge:  number
}): Promise<void> {
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string | undefined
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string | undefined

  if (!serviceId || !templateId || !publicKey) {
    // EmailJS not configured — fail silently (NIDA notification still goes)
    return
  }

  const platformUrl = window.location.origin
  const message =
    `${studentName} (${studentAge} yaş) NIDA Tədris Platformasına qeydiyyatdan keçib. ` +
    `Azərbaycan Respublikasının qanunvericiliyinə əsasən 18 yaşından aşağı şəxslərin ` +
    `məlumatlarının toplanması üçün valideyn razılığı tələb olunur. ` +
    `Razılıq vermək üçün ${platformUrl} platformasına valideyn hesabı ilə daxil olun — ` +
    `hesabınız avtomatik olaraq ${studentName} ilə əlaqələndiriləcək. ` +
    `Razı deyilsinizsə, bu emaili nəzərə almayın.`

  const res = await fetch(EMAILJS_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:  serviceId,
      template_id: templateId,
      user_id:     publicKey,
      template_params: {
        to_email:     parentEmail,
        student_name: studentName,
        student_age:  studentAge,
        platform_url: platformUrl,
        message,
      },
    }),
  })

  if (!res.ok) throw new Error(`EmailJS error: ${res.status}`)
}
