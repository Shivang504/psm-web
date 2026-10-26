import {
  Camera,
  CheckCircle2,
  Clock,
  Gauge,
  Loader2,
  MapPin,
  Navigation,
  Moon,
  Sun,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { sagaActions } from '../../../store/actions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  endDayFailure,
  endDayStart,
  endDaySuccess,
  startDayFailure,
  startDayStart,
  startDaySuccess,
} from '../../../store/slices/dashboardSlice'
import type { ApiResponse } from '../../../utils/types'

export interface StartDayModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  purpose?: 'start' | 'end'
}

type TravelMode = '1' | '2' | '3'

const TRAVEL_MODES: { value: TravelMode; label: string }[] = [
  { value: '1', label: 'Own Vehicle' },
  { value: '2', label: 'Public Transport' },
  { value: '3', label: 'With Colleague' },
]

const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
])

async function toUploadImage(file: File, fallbackName: string): Promise<File> {
  if (ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return new File([file], fallbackName, { type: 'image/jpeg' })
    }
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.92)
    })
    if (!blob) {
      return new File([file], fallbackName, { type: 'image/jpeg' })
    }
    return new File([blob], fallbackName, { type: 'image/jpeg' })
  } catch {
    return new File([file], fallbackName, { type: 'image/jpeg' })
  }
}

export function StartDayModal({
  open,
  onClose,
  onSuccess,
  purpose = 'start',
}: StartDayModalProps) {
  const dispatch = useAppDispatch()
  const isEndDay = purpose === 'end'
  const submitting = useAppSelector((state) =>
    isEndDay ? state.dashboard.endDayLoading : state.dashboard.startDayLoading,
  )

  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [vehicleType, setVehicleType] = useState<TravelMode>('1')
  const [meterNo, setMeterNo] = useState('')
  const [address, setAddress] = useState('Head Office / Field Area')
  const [locality, setLocality] = useState('Main Office District')
  const [pincode, setPincode] = useState('395007')
  const [latitude, setLatitude] = useState<number>(21.1702)
  const [longitude, setLongitude] = useState<number>(72.8311)
  const [gpsDetecting, setGpsDetecting] = useState(false)
  const [gpsDetected, setGpsDetected] = useState(false)

  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [meterFile, setMeterFile] = useState<File | null>(null)
  const [meterPreview, setMeterPreview] = useState<string | null>(null)

  const selfieInputRef = useRef<HTMLInputElement>(null)
  const meterInputRef = useRef<HTMLInputElement>(null)

  const handleDetectLocation = useCallback((showNotification = true) => {
    if (!navigator.geolocation) {
      if (showNotification) {
        toast.error('Geolocation is not supported by your browser')
      }
      return
    }

    setGpsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)))
        setLongitude(Number(pos.coords.longitude.toFixed(6)))
        setGpsDetected(true)
        setGpsDetecting(false)
        if (showNotification) {
          toast.success('Location detected successfully!')
        }
      },
      (err) => {
        setGpsDetecting(false)
        if (showNotification) {
          toast.error(
            err.message || 'Unable to retrieve location. Using default.',
          )
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }, [])

  // Live timer
  useEffect(() => {
    if (!open) return
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [open])

  if (!open) return null

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelfieFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMeterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMeterFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setMeterPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Create an instant canvas dummy selfie if camera isn't available
  const handleGenerateFallbackSelfie = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 300
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // background gradient
      const grad = ctx.createLinearGradient(0, 0, 300, 300)
      grad.addColorStop(0, '#4f46e5')
      grad.addColorStop(1, '#9333ea')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 300, 300)

      // text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Employee Check-In', 150, 130)
      ctx.font = '14px sans-serif'
      ctx.fillText(new Date().toLocaleTimeString(), 150, 160)
      ctx.fillText(new Date().toLocaleDateString(), 150, 185)

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.png', { type: 'image/png' })
          setSelfieFile(file)
          setSelfiePreview(canvas.toDataURL('image/png'))
          toast.success('Selfie image ready!')
        }
      }, 'image/png')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selfieFile) {
      toast.error('Selfie photo is required to start your day.')
      return
    }

    if (!address.trim()) {
      toast.error('Address is required.')
      return
    }

    const pad = (n: number) => String(n).padStart(2, '0')
    const now = new Date()
    const formattedStartTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

    const formData = new FormData()
    formData.append('is_vehicle', vehicleType)
    formData.append('lat', String(latitude))
    formData.append('long', String(longitude))
    formData.append('address', address.trim())
    formData.append('locality', locality.trim() || address.trim())
    formData.append('pincode', String(parseInt(pincode, 10) || 395007))
    formData.append('is_flag', isEndDay ? '0' : '1')
    formData.append('start_time', formattedStartTime)

    const selfieUpload = await toUploadImage(selfieFile, 'selfie.jpg')
    formData.append(
      'user_selfie',
      selfieUpload,
      selfieUpload.name || 'selfie.jpg',
    )

    if (vehicleType === '1') {
      if (meterNo.trim()) {
        formData.append('meter_no', meterNo.trim())
      }
      if (meterFile) {
        const meterUpload = await toUploadImage(meterFile, 'meter.jpg')
        formData.append(
          'meter_image',
          meterUpload,
          meterUpload.name || 'meter.jpg',
        )
      }
    }

    if (isEndDay) {
      dispatch(endDayStart())
    } else {
      dispatch(startDayStart())
    }
    dispatch({
      type: isEndDay ? sagaActions.END_DAY : sagaActions.START_DAY,
      payload: {
        query: '/attendance',
        method: 'POST',
        variables: formData,
        showToast: true,
        successMessage: isEndDay
          ? 'Day ended successfully.'
          : 'Day started successfully! Attendance recorded.',
        onSuccess: (res: ApiResponse<{ attendance?: unknown }>) => {
          const attendance = res?.data?.attendance as never
          if (isEndDay) {
            dispatch(endDaySuccess(attendance))
          } else {
            dispatch(startDaySuccess(attendance))
          }
          onSuccess?.()
          onClose()
        },
        onFailure: (message: string) => {
          if (isEndDay) {
            dispatch(endDayFailure(message))
          } else {
            dispatch(startDayFailure(message))
          }
        },
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[#1E1B4B]/35 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-modal-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[24px] border border-white/90 bg-white/95 backdrop-blur-2xl shadow-[0_24px_60px_-15px_rgba(30,27,75,0.25)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#4F46E5]/10 px-6 py-4.5 bg-gradient-to-r from-[#EEF2FF]/60 to-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-[14px] bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/25">
              {isEndDay ? (
                <Moon className="size-5" />
              ) : (
                <Sun className="size-5" />
              )}
            </div>
            <div>
              <h2
                id="day-modal-title"
                className="text-[18px] font-bold text-[#1E1B4B]"
              >
                {isEndDay ? 'End Your Day' : 'Start Your Day'}
              </h2>
              <p className="text-[12px] text-[#4C4A7A]">
                {isEndDay
                  ? 'Capture your closing selfie and location to end today'
                  : 'Record attendance & mark yourself present for today'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-[10px] text-[#4C4A7A] transition hover:bg-white hover:text-[#1E1B4B]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto p-6 space-y-5"
        >
          {/* Live Date & Time Banner */}
          <div className="flex items-center justify-between rounded-[16px] border border-[#4F46E5]/15 bg-[#EEF2FF]/50 px-4 py-3 text-[13px]">
            <div className="flex items-center gap-2 text-[#312E81] font-medium">
              <Clock className="size-4 text-[#4F46E5]" />
              <span>
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <span className="font-bold text-[#4F46E5] tabular-nums">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>

          {/* Selfie Photo Upload / Capture */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#1E1B4B]">
              Selfie Photo <span className="text-[#DC2626]">*</span>
            </label>
            <p className="mb-2 text-[12px] text-[#4C4A7A]">
              Capture or upload your selfie to verify your attendance
            </p>

            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleSelfieChange}
              className="hidden"
            />

            {selfiePreview ? (
              <div className="relative overflow-hidden rounded-[16px] border border-[#4F46E5]/20 bg-white p-2">
                <img
                  src={selfiePreview}
                  alt="Selfie preview"
                  className="h-44 w-full rounded-[12px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => selfieInputRef.current?.click()}
                  className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-[10px] bg-[#1E1B4B]/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-[#1E1B4B]"
                >
                  <Camera className="size-3.5" /> Retake
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => selfieInputRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#4F46E5]/30 bg-white/60 p-4 transition hover:border-[#4F46E5] hover:bg-[#EEF2FF]/30 cursor-pointer"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5]">
                    <Camera className="size-5" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#312E81]">
                    Click to Take / Upload Selfie
                  </span>
                  <span className="text-[11px] text-[#4C4A7A]">
                    PNG, JPG, or JPEG
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateFallbackSelfie}
                  className="text-center text-[12px] font-medium text-[#4F46E5] hover:underline cursor-pointer"
                >
                  Or use instant check-in badge image
                </button>
              </div>
            )}
          </div>

          {/* GPS Location Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#1E1B4B]">
                Current Location
              </label>
              <button
                type="button"
                onClick={() => handleDetectLocation(true)}
                disabled={gpsDetecting}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] transition disabled:opacity-50 cursor-pointer"
              >
                {gpsDetecting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Navigation className="size-3.5" />
                )}
                {gpsDetected ? 'Refresh GPS' : 'Detect GPS'}
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-[12px] bg-white/70 px-3 py-2 text-[12px] border border-[#4F46E5]/15 text-[#312E81]">
              <MapPin className="size-4 shrink-0 text-[#4F46E5]" />
              <span className="truncate">
                Lat: {latitude}, Long: {longitude}
              </span>
              {gpsDetected && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
                  <CheckCircle2 className="size-3" /> GPS Locked
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#4C4A7A]">
                  Address / Site
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ring Road Office"
                  className="h-[40px] w-full rounded-[12px] border border-[rgba(79,70,229,0.2)] bg-white/80 px-3 text-[13px] text-[#1E1B4B] outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#4C4A7A]">
                  Locality / City
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Central City"
                  className="h-[40px] w-full rounded-[12px] border border-[rgba(79,70,229,0.2)] bg-white/80 px-3 text-[13px] text-[#1E1B4B] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#4C4A7A]">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 395007"
                className="h-[40px] w-full rounded-[12px] border border-[rgba(79,70,229,0.2)] bg-white/80 px-3 text-[13px] text-[#1E1B4B] outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Travel / Vehicle Mode */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#1E1B4B]">
              Mode of Travel
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TRAVEL_MODES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setVehicleType(item.value)}
                  className={`flex min-h-[40px] cursor-pointer items-center justify-center rounded-[12px] px-2 text-center text-[12px] font-semibold leading-tight transition ${
                    vehicleType === item.value
                      ? 'bg-[#4F46E5] text-white shadow-sm'
                      : 'border border-[rgba(79,70,229,0.18)] bg-white/70 text-[#312E81] hover:bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {vehicleType === '1' && (
            <div className="rounded-[16px] border border-[#4F46E5]/15 bg-[#EEF2FF]/40 p-3.5 space-y-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#312E81]">
                  {isEndDay
                    ? 'Ending Meter Reading (km)'
                    : 'Starting Meter Reading (km)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={meterNo}
                    onChange={(e) => setMeterNo(e.target.value)}
                    placeholder="e.g. 12450"
                    className="h-[40px] w-full rounded-[12px] border border-[rgba(79,70,229,0.2)] bg-white px-3 pl-9 text-[13px] text-[#1E1B4B] outline-none focus:border-[#4F46E5]"
                  />
                  <Gauge className="size-4 absolute left-3 top-3 text-[#4F46E5]" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#312E81]">
                  Meter Photo (Optional)
                </label>
                <input
                  ref={meterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMeterChange}
                  className="hidden"
                />

                {meterPreview ? (
                  <div className="flex items-center justify-between rounded-[12px] border border-white/80 bg-white p-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={meterPreview}
                        alt="Meter"
                        className="size-10 rounded-[8px] object-cover"
                      />
                      <span className="text-[12px] text-[#312E81] font-medium truncate max-w-[160px]">
                        {meterFile?.name || 'meter-image.png'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => meterInputRef.current?.click()}
                      className="text-[11px] font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => meterInputRef.current?.click()}
                    className="flex h-[38px] w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#4F46E5]/30 bg-white/70 text-[12px] font-medium text-[#312E81] hover:bg-white cursor-pointer"
                  >
                    <Upload className="size-3.5 text-[#4F46E5]" /> Upload Meter
                    Photo
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#4F46E5]/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-[44px] cursor-pointer rounded-[14px] border border-[#4F46E5]/20 bg-white/80 px-5 text-[14px] font-semibold text-[#312E81] transition hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-[44px] cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#4F46E5] px-6 text-[14px] font-semibold text-white shadow-md shadow-[#4F46E5]/25 transition hover:bg-[#4338CA] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  {isEndDay ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                  <span>
                    {isEndDay ? 'Confirm & End Day' : 'Confirm & Start Day'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
