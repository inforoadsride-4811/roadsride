import LoginForm from '@/components/admin/login-form';

export const metadata = {
  title: 'Admin Login | RoadsRide',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <LoginForm />
    </div>
  );
}
