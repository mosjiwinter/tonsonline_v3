import { cookies } from 'next/headers';

export async function getAuth() {
  const cookieStore = await cookies();

  const token = cookieStore.get('token')?.value || '';
  const name = cookieStore.get('name')?.value || '';
  const role = cookieStore.get('role')?.value || '';

  const isLoggedIn = !!token;

  return {
    isLoggedIn,
    token,
    name,
    role,
    isAdmin: role === 'admin',
    isStaff: role === 'staff',
  };
}