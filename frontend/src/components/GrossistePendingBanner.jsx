import { useAuth } from '../context/AuthContext';
import { Clock, XCircle } from 'lucide-react';

export default function GrossistePendingBanner() {
  const { isGrossistePending, isGrossisteRejected, user } = useAuth();

  if (isGrossistePending()) {
    return (
      <div className="bg-choco-warm border-b border-choco-border px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-choco-dark/70">
          <Clock size={16} className="shrink-0 text-choco-accent" />
          <span>
            <strong>Votre compte grossiste est en cours de validation.</strong> Vous voyez les prix détail pour l'instant. Une fois approuvé par l'administrateur, vous aurez accès aux prix grossiste.
          </span>
        </div>
      </div>
    );
  }

  if (isGrossisteRejected()) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-red-700">
          <XCircle size={16} className="shrink-0" />
          <span>
            <strong>Votre demande grossiste a été refusée.</strong> Vous continuez à voir les prix détail. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administration.
          </span>
        </div>
      </div>
    );
  }

  return null;
}
