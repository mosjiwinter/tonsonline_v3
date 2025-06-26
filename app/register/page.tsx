"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import {
  TextField,
  Stack,
  Typography,
  Button,
  styled,
  Snackbar,
  Alert,
  Paper,
  Box,
  Container,
  InputAdornment,
  Fade,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
} from "@mui/material"
import "leaflet/dist/leaflet.css"
import {
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CameraAlt as CameraIcon,
  CreditCard as ContactCardIcon,
  HowToReg as RegisterIcon,
} from "@mui/icons-material"

const Map = dynamic(() => import("./LeafletMap"), { ssr: false })

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

const steps = ["ข้อมูลร้านค้า", "ที่อยู่และตำแหน่ง", "อัปโหลดรูปภาพ"]

export default function ModernRegisterPage() {
  const [referrer, setReferrer] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [storeName, setStoreName] = useState("")
  const [address, setAddress] = useState("")
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [storeImage, setStoreImage] = useState<File | null>(null)
  const [idCardImage, setIdCardImage] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error" | "info"
  }>({
    open: false,
    message: "",
    severity: "info",
  })

  const showSnackbar = (message: string, severity: "success" | "error" | "info" = "info") => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  useEffect(() => {
    setMounted(true)
    const ref = new URL(window.location.href).searchParams.get("ref") || ""
    setReferrer(ref)

    navigator.geolocation.getCurrentPosition(
      (pos) => setLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => showSnackbar("ไม่สามารถดึงพิกัดได้ กรุณาอนุญาต GPS หรือระบุตำแหน่งเอง", "error"),
    )
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!storeName || !address || !latLng || !storeImage || !idCardImage || !phoneNumber) {
      showSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน", "error")
      return
    }

    setLoading(true)
    setMessage("กำลังส่งข้อมูล...")

    try {
      const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(",")[1])
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }

      const storeImageBase64 = await readFileAsBase64(storeImage)
      const idCardImageBase64 = await readFileAsBase64(idCardImage)

      const payload = {
        action: "register",
        userId: "",
        name: storeName,
        phone: phoneNumber,
        referrer,
        address,
        lat: latLng.lat,
        lng: latLng.lng,
        storeImage: storeImageBase64,
        idCardImage: idCardImageBase64,
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const result = await res.json()
      showSnackbar(result.message || "ส่งข้อมูลสำเร็จ ✅", "success")
      setTimeout(() => (window.location.href = "/cms"), 1500)
    } catch (err) {
      console.error(err)
      showSnackbar("เกิดข้อผิดพลาดในการส่งข้อมูล ❌", "error")
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatLng({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        showSnackbar("ดึงตำแหน่งปัจจุบันสำเร็จ", "success")
      },
      () => showSnackbar("ไม่สามารถดึงพิกัดได้", "error"),
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Fade in={mounted} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                p: 4,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <RegisterIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                ลงทะเบียนร้านค้า
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                กรุณากรอกข้อมูลให้ครบถ้วนเพื่อลงทะเบียน
              </Typography>
            </Box>

            {/* Stepper */}
            <Box sx={{ p: 3, pb: 0 }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Content */}
            <Box sx={{ p: 4 }}>
              {/* Referrer Info */}
              {referrer && (
                <Card sx={{ mb: 3, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
                      <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      รหัสผู้แนะนำ: {referrer}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  {/* Store Information Section */}
                  <Card elevation={2}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          display: "flex",
                          alignItems: "center",
                          color: "primary.main",
                          fontWeight: 600,
                        }}
                      >
                        <StoreIcon sx={{ mr: 1 }} />
                        ข้อมูลร้านค้า
                      </Typography>
                      <Stack spacing={3}>
                        <TextField
                          label="ชื่อร้านค้า"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          required
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <StoreIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />
                        <TextField
                          label="เบอร์โทรศัพท์"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Address and Location Section */}
                  <Card elevation={2}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          display: "flex",
                          alignItems: "center",
                          color: "primary.main",
                          fontWeight: 600,
                        }}
                      >
                        <LocationIcon sx={{ mr: 1 }} />
                        ที่อยู่และตำแหน่ง
                      </Typography>
                      <Stack spacing={3}>
                        <TextField
                          label="ที่อยู่จัดส่ง"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          fullWidth
                          multiline
                          rows={3}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                                <LocationIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                              },
                              "&.Mui-focused": {
                                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                              },
                            },
                          }}
                        />

                        <Button
                          variant="contained"
                          onClick={getCurrentLocation}
                          startIcon={<LocationIcon />}
                          sx={{
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            boxShadow: "0 8px 32px rgba(79, 172, 254, 0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #43a3f5 0%, #00d9fe 100%)",
                              boxShadow: "0 12px 40px rgba(79, 172, 254, 0.4)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          📍 ใช้ GPS ปัจจุบัน
                        </Button>

                        <Box sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 2 }}>
                          <Map latLng={latLng ?? { lat: 0, lng: 0 }} setLatLng={setLatLng} />
                        </Box>

                        {latLng && (
                          <Alert severity="success" sx={{ borderRadius: 2 }}>
                            📌 ตำแหน่งปัจจุบัน: {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
                          </Alert>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Image Upload Section */}
                  <Card elevation={2}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          display: "flex",
                          alignItems: "center",
                          color: "primary.main",
                          fontWeight: 600,
                        }}
                      >
                        <CameraIcon sx={{ mr: 1 }} />
                        อัปโหลดรูปภาพ
                      </Typography>
                      <Stack spacing={3}>
                        {/* Store Image */}
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            รูปหน้าร้าน
                          </Typography>
                          <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
                            <Button
                              component="label"
                              variant="contained"
                              startIcon={<CloudUploadIcon />}
                              sx={{
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                                boxShadow: "0 8px 32px rgba(250, 112, 154, 0.3)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #f9618a 0%, #fdd835 100%)",
                                  boxShadow: "0 12px 40px rgba(250, 112, 154, 0.4)",
                                  transform: "translateY(-2px)",
                                },
                              }}
                            >
                              เลือกรูปหน้าร้าน
                              <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={(e) => setStoreImage(e.target.files?.[0] || null)}
                              />
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                              {storeImage ? `✅ ${storeImage.name}` : "ยังไม่ได้เลือกรูป"}
                            </Typography>
                          </Stack>
                        </Box>

                        <Divider />

                        {/* ID Card Image */}
                        <Box>
                          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            รูปบัตรประชาชน
                          </Typography>
                          <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
                            <Button
                              component="label"
                              variant="contained"
                              startIcon={<ContactCardIcon />}
                              sx={{
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                                color: "text.primary",
                                boxShadow: "0 8px 32px rgba(168, 237, 234, 0.3)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #9ee5e1 0%, #fcc9d9 100%)",
                                  boxShadow: "0 12px 40px rgba(168, 237, 234, 0.4)",
                                  transform: "translateY(-2px)",
                                },
                              }}
                            >
                              เลือกรูปบัตร ปชช.
                              <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={(e) => setIdCardImage(e.target.files?.[0] || null)}
                              />
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                              {idCardImage ? `✅ ${idCardImage.name}` : "ยังไม่ได้เลือกรูป"}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={loading ? null : <SaveIcon />}
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                        boxShadow: "0 12px 40px rgba(102, 126, 234, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                      "&:disabled": {
                        background: "rgba(102, 126, 234, 0.6)",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            "@keyframes spin": {
                              "0%": { transform: "rotate(0deg)" },
                              "100%": { transform: "rotate(360deg)" },
                            },
                          }}
                        />
                        กำลังส่งข้อมูล...
                      </Box>
                    ) : (
                      "ส่งข้อมูลลงทะเบียน"
                    )}
                  </Button>

                  {message && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      {message}
                    </Alert>
                  )}
                </Stack>
              </form>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: "center", p: 3, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              <Typography variant="caption" color="text.secondary">
                © 2024 ระบบลงทะเบียนร้านค้า - ปลอดภัยและเชื่อถือได้
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%", borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
