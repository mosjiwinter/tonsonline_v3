'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  Button, Typography, Container, Box,
  TextField, CircularProgress
} from '@mui/material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminDashboard() {
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [loading, setLoading] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a29bfe', '#fd79a8', '#e17055'];

  const fetchData = () => {
    setLoading(true);
    let url = 'https://script.google.com/macros/s/AKfycbyW36T8ScV4o92bHSb_RslFJWxDlDnWiUOags0UgbgwSvmMocN06hCHPWTsj07Zp9jA/exec';

    const params = new URLSearchParams();
    if (filterDate) params.append('date', filterDate);
    if (filterMonth) params.append('month', filterMonth);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setChartData(data))
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(chartData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    XLSX.writeFile(wb, `Admin-Summary-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.text('Staff Registration Summary', 14, 16);
    (doc as any).autoTable({
      head: [['พนักงาน', 'จำนวน']],
      body: chartData.map(row => [row.name, row.count.toString()]),
    });
    doc.save(`Admin-Summary-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleClearFilter = () => {
    setFilterDate('');
    setFilterMonth('');
    fetchData();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard รวมยอดพนักงาน (Admin)
      </Typography>

      {/* ฟิลเตอร์ */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <TextField
          label="เลือกวัน"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="เลือกเดือน"
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={fetchData}>
          ดึงข้อมูล
        </Button>
        <Button variant="outlined" color="error" onClick={handleClearFilter}>
          ล้างตัวกรอง
        </Button>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* ข้อมูล */}
      {!loading && chartData.length === 0 && (
        <Typography sx={{ mt: 4 }}>ไม่มีข้อมูล</Typography>
      )}

      {!loading && chartData.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                outerRadius={100}
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* ปุ่ม Export */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={handleExportExcel}>
          Export เป็น Excel
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleExportPdf}>
          Export เป็น PDF
        </Button>
      </Box>
    </Container>
  );
}