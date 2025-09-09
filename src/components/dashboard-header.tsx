import UserMenu from './user-menu';
import { type User } from '@/lib/types';

// El header ahora recibe el usuario y se lo pasa al menú
export default function DashboardHeader({ user }: { user: User }) {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div>
        {/* Se pueden añadir breadcrumbs o el título de la página aquí */}
      </div>
      <div className="flex items-center">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
