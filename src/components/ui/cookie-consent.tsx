"use client"

import { useState, useEffect, useRef } from "react"
import { hotjar } from 'react-hotjar'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cookie, Settings, Shield, BarChart3, Eye } from "lucide-react"

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  const initializedRef = useRef(false)
  const persistConsent = (consent: CookiePreferences) => {
    try {
      // Persist to localStorage for client-side checks
      localStorage.setItem("cookie-consent", JSON.stringify(consent))
    } catch {}
    try {
      // Mirror to cookie so server components (e.g., layout) can read it
      const encoded = encodeURIComponent(JSON.stringify(consent))
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
      document.cookie = `cookie-consent=${encoded}; Path=/; Max-Age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`
    } catch {}
  }
  const initializeHotjarIfNeeded = (analyticsAccepted: boolean) => {
    if (initializedRef.current) return
    if (!analyticsAccepted) return
    if (typeof window === 'undefined') return
    const id = Number(process.env.NEXT_PUBLIC_HOTJAR_ID)
    const sv = Number(process.env.NEXT_PUBLIC_HOTJAR_SV)
    if (!id || !sv) return
    if (process.env.NODE_ENV !== 'production') {
      // Allow in dev if needed; keep as best-practice guard
    }
    try {
      // react-hotjar v6 expects an options object
      hotjar.initialize({ id, sv })
      initializedRef.current = true
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowConsent(true)
    } else {
      try {
        const parsedConsent = JSON.parse(consent)
        if (parsedConsent.analytics !== undefined || parsedConsent.hotjar !== undefined) {
          const newConsent = {
            essential: true,
            analytics: parsedConsent.analytics || parsedConsent.hotjar || false,
            marketing: false,
          }
          localStorage.setItem("cookie-consent", JSON.stringify(newConsent))
          setShowConsent(false)
          initializeHotjarIfNeeded(Boolean(newConsent.analytics))
        } else {
          setShowConsent(false)
          initializeHotjarIfNeeded(Boolean(parsedConsent.analytics))
        }
      } catch {
        setShowConsent(true)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    persistConsent(allAccepted)
    setShowConsent(false)
    initializeHotjarIfNeeded(true)
    // Reload so server can conditionally inject tags based on cookie
    if (typeof window !== 'undefined') window.location.reload()
  }

  const handleAcceptSelected = () => {
    persistConsent(preferences)
    setShowConsent(false)
    initializeHotjarIfNeeded(Boolean(preferences.analytics))
    if (typeof window !== 'undefined') window.location.reload()
  }

  const handleDecline = () => {
    const declined = {
      essential: true,
      analytics: false,
      marketing: false,
    }
    persistConsent(declined)
    setShowConsent(false)
    if (typeof window !== 'undefined') window.location.reload()
  }

  if (!showConsent) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <div className="mx-auto max-w-4xl">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/50 shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookie beállítások</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Weboldalunk cookie-kat használ a felhasználói élmény javítása érdekében. 
                    Néhány cookie elengedhetetlen az oldal működéséhez, mások segítenek 
                    megérteni, hogyan használják az oldalt.
                  </p>
                </div>

                {showDetails && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Elengedhetetlen</p>
                            <p className="text-xs text-gray-500">Az oldal alapvető működéséhez szükséges</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Mindig aktív</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Analytics</p>
                            <p className="text-xs text-gray-500">Google Analytics, Hotjar - használati statisztikák</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Marketing</p>
                            <p className="text-xs text-gray-500">Személyre szabott tartalom és hirdetések</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleAcceptAll} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Összes elfogadása</Button>
                  <Button onClick={handleAcceptSelected} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">Kiválasztott elfogadása</Button>
                  <Button onClick={handleDecline} variant="ghost" className="text-gray-600 hover:text-gray-800">Elutasítás</Button>
                  <Button onClick={() => setShowDetails(!showDetails)} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <Settings className="w-4 h-4 mr-2" />
                    {showDetails ? "Részletek elrejtése" : "Részletek megjelenítése"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

