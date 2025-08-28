"use client"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Gift, Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

function getVisitorId() {
  if (typeof document === "undefined") return ""
  const m = document.cookie.match(/(?:^|; )vid=([^;]+)/)
  if (m) return decodeURIComponent(m[1])
  let id = localStorage.getItem("vid")
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("vid", id) }
  return id
}

export default function RefEmailModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const refCode = useMemo(() => {
    if (typeof window === "undefined") return null
    return new URLSearchParams(window.location.search).get("ref")
  }, [])

  useEffect(() => {
    if (!refCode) return
    const key = `ref-offer-shown:${refCode}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, "1")
    setOpen(true)
  }, [refCode])

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/referral/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: refCode, email, visitorId: getVisitorId() }),
      })
      if (!res.ok) {
        let message = "Váratlan hiba történt. Kérjük, próbáld újra."
        try {
          const data = await res.json()
          if (data?.error) message = data.error
        } catch {}
        toast.error(message)
        return
      }
      const data = await res.json()
      if (data?.awarded) {
        toast.success("Köszönjük! Jóváírtuk a pontot az ismerősödnek.")
      } else {
        toast.info("Ezt az e-mail címet már felhasználták, most nem járt pont.")
      }
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!refCode) return null
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-white">+10 pont bónusz</DialogTitle>
            <DialogDescription className="text-white/80">
              Add meg az emailed, és jóváírjuk a bónuszt.
            </DialogDescription>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="text-sm text-gray-600">
          <p>Írd be az e-mail címed, és <strong>plusz pontot kap</strong>, akitől a linket kaptad.</p>
          <p className="mt-2">Mi csendben maradunkn nem zaklatunk emailekkel: csak akkor szólunk, ha elindultunk és nyert. Kíváncsi vagy? A játék a főoldalon elérhető!</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Email cím</label>
            <Input
              type="email"
              placeholder="pl. te@pelda.hu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefix={<Mail className="w-4 h-4" />}
              className="h-10"
            />
          </div>
          <DialogFooter className="mt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Most nem
            </Button>
            <Button onClick={submit} disabled={loading || !email} className="bg-purple-600 hover:bg-purple-700">
              {loading ? (
                <span className="inline-flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Küldés
                </span>
              ) : (
                "Küldés"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

