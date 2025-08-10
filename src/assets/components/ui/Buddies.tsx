import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

interface User {
  id: string
  email: string
  displayName?: string
}

interface BuddiesProps {
  user: User
}

function Buddies({ user }: BuddiesProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Buddies</h1>
          <p className="text-muted-foreground">
            Manage your friends and split subscription costs together.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Buddy Management Coming Soon!</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              We're working on the buddy system where you can add friends, 
              automatically calculate splits, and manage shared subscriptions together.
            </p>
            <div className="flex gap-4">
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add Buddy
              </Button>
              <Link to="/">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Preview Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Add Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Easily add friends by email or phone number to start splitting bills together.
              </p>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Auto-Calculate Splits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically calculate how much each person owes for shared subscriptions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Buddies