import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

export default function GrossistePendingBanner() {
  const { isGrossistePending } = useAuth();
  if (!isGrossistePending()) return null;
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-yellow-700">
        <Clock size={16} className="shrink-0" />
        <span>
          <strong>Votre compte grossiste est en cours de validation.</strong> Vous voyez les prix détail pour l'instant. Une fois approuvé par l'administrateur, vous aurez accès aux prix grossiste.
        </span>
      </div>
    </div>
  );
}