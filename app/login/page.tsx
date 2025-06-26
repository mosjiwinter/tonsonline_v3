'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true); // รอเช็ค sessionStorage

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    if (role === 'admin') {
      window.location.href = '/admin/dashboard';
    } else if (role === 'staff') {
      window.location.href = '/staff';
    } else {
      setCheckingLogin(false); // ยังไม่ login ให้แสดง form
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {  // เปลี่ยน path เป็น absolute
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('token', data.userId);
        sessionStorage.setItem('name', data.name);
        sessionStorage.setItem('role', data.role);

        if (data.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/staff';
        }
      } else {
        setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  if (checkingLogin) {
    return (
      <Container maxWidth="xs" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          เข้าสู่ระบบ
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="ชื่อผู้ใช้"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="รหัสผ่าน"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2, backgroundColor: '#00b900' }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </form>
      </Box>
    </Container>
  );
}