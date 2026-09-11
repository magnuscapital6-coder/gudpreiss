import { redirect } from 'next/navigation';

export default function AdminResetPasswordRedirect({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = searchParams.token;
  if (token && typeof token === 'string') {
    redirect(`/reset-password?token=${encodeURIComponent(token)}`);
  }
  redirect('/login');
}
