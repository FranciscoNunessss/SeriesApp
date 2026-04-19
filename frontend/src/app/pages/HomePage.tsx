import { Link } from 'react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tv, History } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-16">
        <Tv className="w-16 h-16 text-blue-600 mx-auto" />
        <h1 className="text-4xl text-gray-900">Series Tracker</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gerencie suas séries e acompanhe o histórico do que assistiu
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8 text-center space-y-4">
            <Tv className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-2xl text-gray-900">Minhas Séries</h2>
            <p className="text-gray-600">
              Adicione, edite e gerencie suas séries. Organize por temporadas e episódios.
            </p>
            <Link to="/series">
              <Button className="w-full">Ver Séries</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8 text-center space-y-4">
            <History className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-2xl text-gray-900">Histórico</h2>
            <p className="text-gray-600">
              Veja o histórico completo de episódios assistidos e quando foram vistos.
            </p>
            <Link to="/history">
              <Button className="w-full">Ver Histórico</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}