"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Mail, Camera, Heart, Users, Sparkles, ArrowRight, Gift, User, Share2, Copy, Check, Calendar } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { CookieConsent } from "@/components/ui/cookie-consent"
import RefEmailModal from "./components/RefEmailModal"

const formSchema = z.object({
  email: z.string().email("Kérjük, adjon meg egy érvényes email címet"),
  eventDate: z.date({
    required_error: "Kérjük, adja meg az esemény dátumát",
  }),
  eventType: z
    .string({
      required_error: "Kérjük, válassza ki az esemény típusát",
    })
    .min(1, "Kérjük, válassza ki az esemény típusát"),
})

type FormData = z.infer<typeof formSchema>

export default function LandingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingRef, setIsGeneratingRef] = useState(false)
  const [referralUrl, setReferralUrl] = useState<string | null>(null)
  const [, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      eventType: "",
    },
  })

  const eventTypes = [
    { value: "wedding", label: "💒 Esküvő" },
    { value: "birthday", label: "🎉 Születésnap" },
    { value: "corporate", label: "🏢 Céges rendezvény" },
    { value: "party", label: "🎊 Parti" },
    { value: "graduation", label: "🎓 Ballagás" },
    { value: "other", label: "🎭 Egyéb" },
  ]

  const referralSchema = z.object({
    firstName: z.string().min(2, "Add meg a keresztneved"),
    email: z.string().email("Érvényes email címet adj meg"),
  })

  type ReferralData = z.infer<typeof referralSchema>

  const referralForm = useForm<ReferralData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      firstName: "",
      email: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          eventDate: data.eventDate.toISOString(),
          eventType: data.eventType,
        }),
      })
      const result = await response.json()
      if (response.ok && result?.ok) {
        toast.success(
          "Sikeresen feliratkoztál! Értesítünk, amikor elindulunk.",
        )
        form.reset()
      } else if (response.ok && result?.ok === true && result?.created === false) {
        toast.info("Ezzel az e-mail címmel már feliratkoztál.")
      } else {
        toast.error("Hiba történt a feliratkozás során")
      }
    } catch {
      toast.error(
        "Hálózati hiba történt. Kérjük, ellenőrizze az internetkapcsolatát.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    // Clienten nem kell trackelni; a /r/[code] SSR route végzi a logolást.
  }, [])

  const handleGenerateReferral = async (data: ReferralData) => {
    setIsGeneratingRef(true)
    setCopied(false)
    try {
      const res = await fetch("/api/referral/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })
      if (!res.ok) throw new Error("create_failed")
      const json = await res.json()
      const code: string | null = json.code || null
      if (!code) throw new Error("no_code")
      const base = typeof window !== "undefined" ? window.location.origin : "https://snapcam.hu"
      const url = `${base}/r/${encodeURIComponent(code)}`
      setReferralCode(code)
      setReferralUrl(url)
      referralForm.reset({ firstName: data.firstName, email: data.email })
      window.localStorage?.setItem(`ref-created:${data.email.toLowerCase()}`, code)
      toast.success("Egyedi linked elkészült!")
    } catch {
      toast.error("Nem sikerült a link generálása. Próbáld újra.")
    } finally {
      setIsGeneratingRef(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <Image
                  src="/images/logo.svg"
                  alt="SnapCam Logo"
                  width={280}
                  height={70}
                  className="w-72 h-18 mx-auto mb-6"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">Hamarosan elérhető</span>
                  </div>
                </motion.div>

                <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 bg-clip-text text-transparent leading-tight">
                  Forradalmi
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    Képmegosztás
                  </span>
                </h1>

                <div className="flex items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 shadow-md">

                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-semibold">Várható indulás: október</span>
                  </span>
                </div>

                <p className="text-xl sm:text-2xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed mt-3">
                  Magyarország első interaktív platformja, ahol az emlékek élnek
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="space-y-6"
            >
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
                Hozd létre saját digitális faladat, ahol vendégeid valós időben tudnak képeket megosztani,
                kommentelni és élvezni az eseményt egy teljesen új módon.
                <span className="font-semibold text-purple-600">QR kód, link, és azonnali megosztás.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Valós idejű megosztás</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Interaktív élmény</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Közösségi platform</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="relative">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute -bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9 }} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Miért SnapCam?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Három egyszerű ok, amiért az eseményeid új szintre emeljük</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1 }} className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Valós idejű megosztás</h3>
                  <p className="text-gray-600 leading-relaxed">Vendégeid azonnal megoszthatják képeiket az eseményen, QR kóddal vagy linkkel. Nincs többé várakozás!</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.3 }} className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Interaktív élmény</h3>
                  <p className="text-gray-600 leading-relaxed">Like-olás, kommentelés és közösségi élmény minden vendég számára. Az emlékek élnek!</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.5 }} className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Közösségi platform</h3>
                  <p className="text-gray-600 leading-relaxed">Hozz létre egyedülálló emlékeket és kapcsolatokat vendégeiddel. Egy platform, végtelen lehetőség!</p>
                </div>
              </motion.div>
            </div>
          </motion.div>



          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-gray-900">Tökéletes eseményekhez</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-800">💒 Esküvők</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-pink-100 text-pink-800">🎉 Születésnapok</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-800">🏢 Céges rendezvények</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-green-100 text-green-800">🎊 Partik</Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-orange-100 text-orange-800">🎓 Ballagások</Badge>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }} className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl p-8 sm:p-10 shadow-2xl border bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Különleges ajánlat – Nyereményjáték!</h3>
                </div>
                <p className="max-w-2xl mx-auto text-white/90">
                  20 ingyenes Prémium csomagot osztunk ki azok között, akik a legtöbb pontot gyűjtik a saját megosztási linkjükre érkező kattintásokkal. A <strong>20 legtöbb pontot gyűjtő</strong> nyer induláskor.
                </p>
                <form onSubmit={referralForm.handleSubmit(handleGenerateReferral)} className="space-y-4 max-w-3xl mx-auto">
                  {!referralUrl && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input type="text" placeholder="Keresztnév" prefix={<User className="w-4 h-4" />} {...referralForm.register("firstName")} className="h-10 bg-white/90 text-gray-900 border-white/30" />
                        <Input type="email" placeholder="Email cím" prefix={<Mail className="w-4 h-4" />} {...referralForm.register("email")} className="h-10 bg-white/90 text-gray-900 border-white/30" />
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button type="submit" disabled={isGeneratingRef} className="bg-white text-purple-700 hover:bg-white/90">
                          {isGeneratingRef ? (
                            <>
                              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                              Link generálása...
                            </>
                          ) : (
                            <>
                              Link generálása <Share2 className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                  {referralUrl && (
                    <div className="bg-white/90 rounded-xl border border-white/50 shadow p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
                      <div className="text-left w-full">
                        <p className="text-sm text-gray-600">Megosztható linked</p>
                        <p className="text-sm font-mono break-all text-gray-900">{referralUrl}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button type="button" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(referralUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { } }} className="whitespace-nowrap bg-white text-gray-900 hover:bg-white/90">
                          {copied ? (<>Másolva <Check className="w-4 h-4 ml-2" /></>) : (<>Másolás <Copy className="w-4 h-4 ml-2" /></>)}
                        </Button>
                        <Button type="button" onClick={async () => { try { await navigator.share?.({ url: referralUrl, title: "SnapCam – Nyereményjáték", text: "Gyűjts pontokat a linkemre kattintva!" }) } catch { } }} className="bg-purple-800 hover:bg-purple-900 text-white">
                          Megosztás
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Segíts nekünk!</h3>
              </div>
              <div className="text-center space-y-3">
                <p className="text-lg font-semibold">Cserébe csak egyet kérünk:</p>
                <div className="bg-white/20 rounded-xl p-4 mx-auto max-w-2xl">
                  <p className="text-base leading-relaxed">
                    <strong>A visszajelzésed aranyat ér! </strong> Modd el, miben tudnánk fejlődni, mivel tudnánk még
                    <strong> nagyobb értéket adni </strong> felhasználóinknak! 
                  </p>
                </div>
                <p className="text-sm opacity-90">Visszajelzésed segít nekünk a legjobb terméket létrehozni!</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Értesítést szeretnél kapni az indulásról?</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Iratkozz fel, hogy elsőként értesülj arról, amikor elindítjuk a platformot! Plusz részt vehet a prémium csomag sorsolásán is!
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Select value={form.watch("eventType")} onValueChange={(value) => form.setValue("eventType", value)}>
                    <SelectTrigger className="w-full h-9 bg-white/70 backdrop-blur-md border-white/50 focus:border-purple-500 focus:ring-purple-500 text-base">
                      <SelectValue placeholder="Esemény típusa" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.eventType && (
                    <p className="text-red-500 text-left text-sm mt-1">{form.formState.errors.eventType.message}</p>
                  )}
                </div>
                <div className="relative flex-1">
                  <DatePicker
                    value={form.watch("eventDate")}
                    onChange={(date) => form.setValue("eventDate", date || new Date())}
                    placeholder="Esemény dátuma"
                    className="h-9 text-base"
                  />
                  {form.formState.errors.eventDate && (
                    <p className="text-red-500 text-left text-sm mt-1">{form.formState.errors.eventDate.message}</p>
                  )}
                </div>
              </div>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email cím"
                  prefix={<Mail className="w-4 h-4" />}
                  {...form.register("email")}
                  className="h-9 bg-white/70 backdrop-blur-md border-white/50 focus:border-purple-500 focus:ring-purple-500 text-base"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-left text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Feliratkozás...
                  </>
                ) : (
                  <>
                    Feliratkozás
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>



          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.4 }} className="pt-12 border-t border-white/50">
            <p className="text-gray-500 text-sm">© 2025 SnapCam. Minden jog fenntartva.</p>
          </motion.div>
        </div>
      </div>

      <CookieConsent />
      <RefEmailModal />
    </div>
  )
}

