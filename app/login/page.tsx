"use client"
import { useState, useEffect } from "react"
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material"

export default function ModernLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingLogin, setCheckingLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    setMounted(true)
    const role = sessionStorage.getItem("role")
    if (role === "admin") {
      window.location.href = "/admin/dashboard"
    } else if (role === "staff") {
      window.location.href = "/staff"
    } else {
      setCheckingLogin(false)
    }
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (loading) return

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem("token", data.userId)
        sessionStorage.setItem("name", data.name)
        sessionStorage.setItem("role", data.role)

        if (data.role === "admin") {
          window.location.href = "/admin/dashboard"
        } else {
          window.location.href = "/staff"
        }
      } else {
        setError(data.message || "เข้าสู่ระบบไม่สำเร็จ")
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setLoading(false)
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  if (checkingLogin) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "white" }} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: isMobile ? 2 : 3,
      }}
    >
      <Container maxWidth="sm">
        <Fade in={mounted} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              padding: isMobile ? 3 : 4,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              maxWidth: 400,
              margin: "0 auto",
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                }}
              >
                <LoginIcon sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                เข้าสู่ระบบ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                กรุณาใส่ข้อมูลเพื่อเข้าสู่ระบบ
              </Typography>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="ชื่อผู้ใช้"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
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
                fullWidth
                label="รหัสผ่าน"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
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
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                  fontSize: "1.1rem",
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
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>

              {error && (
                <Fade in={!!error}>
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2,
                      "& .MuiAlert-icon": {
                        alignItems: "center",
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}
            </form>

            {/* Footer */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                © 2024 ระบบจัดการ - ปลอดภัยและเชื่อถือได้
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}
