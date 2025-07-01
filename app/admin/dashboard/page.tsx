'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  Button, Typography, Container, Box,
  TextField, CircularProgress, Stack, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Divider
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

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/api/dashboard/admin';

      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (filterMonth) params.append('month', filterMonth);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setChartData(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
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

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(chartData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Admin-Summary-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.text('สรุปจำนวนลงทะเบียน', 14, 16);
    (doc as any).autoTable({
      head: [['ชื่อพนักงาน', 'จำนวนลงทะเบียน']],
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
    <Container sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h5" gutterBottom>
        แดชบอร์ดสรุปยอดลงทะเบียน (Admin)
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* ฟิลเตอร์ */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <TextField
          label="เลือกวัน (YYYY-MM-DD)"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="เลือกเดือน (YYYY-MM)"
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={fetchData} disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'ดึงข้อมูล'}
        </Button>
        <Button variant="outlined" color="error" onClick={handleClearFilter} disabled={loading}>
          ล้างตัวกรอง
        </Button>
      </Stack>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* ไม่มีข้อมูล */}
      {!loading && chartData.length === 0 && (
        <Typography sx={{ mt: 4 }}>ไม่พบข้อมูลที่ต้องการ</Typography>
      )}

      {/* แผนภูมิ */}
      {!loading && chartData.length > 0 && (
        <>
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

          {/* ตาราง */}
          <Typography variant="h6" sx={{ mt: 4 }}>
            รายละเอียดข้อมูล
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ลำดับ</TableCell>
                  <TableCell>ชื่อพนักงาน</TableCell>
                  <TableCell align="right">จำนวนลงทะเบียน</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row, index) => (
                  <TableRow key={row.name}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ปุ่ม Export */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={4}>
            <Button variant="contained" onClick={handleExportExcel}>
              Export เป็น Excel
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleExportCSV}>
              Export เป็น CSV
            </Button>
            <Button variant="outlined" color="error" onClick={handleExportPdf}>
              Export เป็น PDF
            </Button>
          </Stack>
        </>
      )}
    </Container>
  );
}