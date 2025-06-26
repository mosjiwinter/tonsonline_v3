'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

export default function StaffPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffUserId, setStaffUserId] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (!token || role !== 'staff') {
      router.push('/login');
      return;
    }

    setStaffName(sessionStorage.getItem('name') || '');
    setStaffUserId(token);

    const initLiff = async () => {
      try {
        await liff.init({ liffId: '2007552712-Ml60zkVe' });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setProfile(profile);

        const registerUrl = `https://liff.line.me/2007552712-Ml60zkVe/register?ref=${profile.userId}`;
        const qr = await QRCode.toDataURL(registerUrl);
        setQrImage(qr);
      } catch (err) {
        console.error(err);
        setErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล LINE');
      }
    };

    initLiff();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.clear();
    liff.logout();
    router.push('/login');
  };

  if (errorMessage) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'red' }}>
        <h3>⚠️ {errorMessage}</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>หน้าพนักงาน</h2>

      <p><strong>ชื่อ (จาก Sheet):</strong> {staffName}</p>
      <p><strong>รหัสพนักงาน (token):</strong> {staffUserId}</p>

      {profile && (
        <>
          <p><strong>ชื่อ LINE:</strong> {profile.displayName}</p>
          <p><strong>LINE ID:</strong> {profile.userId}</p>

          <div style={{ marginTop: '20px' }}>
            <p>📲 ให้ลูกค้าสแกน QR นี้เพื่อลงทะเบียน:</p>
            {qrImage && (
              <img
                src={qrImage}
                alt="QR Code"
                style={{ width: '240px', border: '1px solid #ccc', marginTop: '10px' }}
              />
            )}
          </div>
        </>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginTop: '30px',
          backgroundColor: '#d32f2f',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        ออกจากระบบ
      </button>
    </div>
  );
}