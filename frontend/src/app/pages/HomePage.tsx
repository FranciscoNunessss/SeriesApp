import { Link } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tv, Users, History } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <Tv className="w-20 h-20 text-blue-600 mx-auto" />
        <h1 className="text-4xl text-gray-900">Welcome to Series Tracking Platform</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Keep track of your favorite TV series, seasons, and episodes. 
          Monitor your progress and never lose track of where you left off.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8 text-center space-y-4">
            <Users className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-2xl text-gray-900">Manage Users</h2>
            <p className="text-gray-600">
              Create and manage multiple users. Track progress for each person separately.
            </p>
            <Link to="/users">
              <Button variant="secondary" className="w-full">
                Go to Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8 text-center space-y-4">
            <Tv className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-2xl text-gray-900">Browse Series</h2>
            <p className="text-gray-600">
              Add your favorite series, organize seasons, and manage episodes effortlessly.
            </p>
            <Link to="/series">
              <Button variant="secondary" className="w-full">
                Go to Series
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8 text-center space-y-4">
            <History className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-2xl text-gray-900">Watch History</h2>
            <p className="text-gray-600">
              View your complete watch history with ratings and track your viewing patterns.
            </p>
            <Link to="/history">
              <Button variant="secondary" className="w-full">
                Go to History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardContent className="p-8">
          <h2 className="text-2xl text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                1
              </span>
              <p>Create or select a user from the Users page</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                2
              </span>
              <p>Add your favorite TV series with details like genre, year, and status</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                3
              </span>
              <p>Create seasons and add episodes for each series</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                4
              </span>
              <p>Mark episodes as watched and rate them to track your progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
