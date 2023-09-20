import { logout } from '@/utils/auth';

export default function LogoutButton() {
  return (
    <button
      onClick={logout}
      className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
        Logout
    </button>
  );
}
