import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, CreditCard, Users, Settings, DollarSign, Calendar, Share2, MessageCircle, Globe } from 'lucide-react'
import blink from '../blink/client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'
import { useCurrency } from '../hooks/useCurrency'
import { CurrencySelector } from './CurrencySelector'

interface User {
  id: string
  email: string
  displayName?: string
}

interface Subscription {
  id: string
  userId: string
  name: string
  amount: number
  billingCycle: string
  nextDueDate: string
  isShared: string
  category?: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface DashboardProps {
  user: User
}

function Dashboard({ user }: DashboardProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { formatAmount } = useCurrency()

  const loadSubscriptions = useCallback(async () => {
    try {
      const data = await blink.db.subscriptions.list({
        where: { userId: user.id },
        orderBy: { nextDueDate: 'asc' }
      })
      setSubscriptions(data)
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user.id, toast])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  const toggleShared = async (subscriptionId: string, currentShared: string) => {
    try {
      const newShared = Number(currentShared) > 0 ? "0" : "1"
      await blink.db.subscriptions.update(subscriptionId, { isShared: newShared })
      
      // Update local state optimistically
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, isShared: newShared }
            : sub
        )
      )
      
      toast({
        title: "Updated",
        description: `Subscription ${Number(newShared) > 0 ? 'shared' : 'made personal'}`,
      })
    } catch (error) {
      console.error('Failed to toggle shared:', error)
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive"
      })
    }
  }

  const sendWhatsAppReminder = (subscription: Subscription) => {
    const message = `Hey! Just a friendly reminder that ${subscription.name} ($${subscription.amount}) is due soon. Your share would be $${(subscription.amount / 2).toFixed(2)}. Thanks! 💙`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    toast({
      title: "WhatsApp opened",
      description: "Reminder message ready to send!",
    })
  }

  const calculateTotals = () => {
    const personalTotal = subscriptions
      .filter(sub => Number(sub.isShared) === 0)
      .reduce((sum, sub) => sum + sub.amount, 0)
    
    const sharedTotal = subscriptions
      .filter(sub => Number(sub.isShared) > 0)
      .reduce((sum, sub) => sum + (sub.amount / 2), 0) // Assuming 50/50 split for now
    
    return { personalTotal, sharedTotal, total: personalTotal + sharedTotal }
  }

  const { personalTotal, sharedTotal, total } = calculateTotals()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilDue = (dateString: string) => {
    const dueDate = new Date(dateString)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">Bill Buddy</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              <CurrencySelector />
              
              <Link to="/add">
                <Button size="sm" className="hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subscription
                </Button>
              </Link>
              
              <Link to="/buddies">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                  <Users className="h-4 w-4 mr-2" />
                  Buddies
                </Button>
              </Link>
              
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Stats */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.displayName || user.email}!
          </h2>
          <p className="text-muted-foreground">
            Here's your subscription overview for this month.
          </p>
        </div>

        {/* Monthly Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatAmount(total)}</div>
              <p className="text-xs text-muted-foreground">
                {subscriptions.length} active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatAmount(personalTotal)}</div>
              <p className="text-xs text-muted-foreground">
                Your personal subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared (Your Part)</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{formatAmount(sharedTotal)}</div>
              <p className="text-xs text-muted-foreground">
                Split with buddies
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your Subscriptions</h3>
            {subscriptions.length === 0 && (
              <Link to="/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Subscription
                </Button>
              </Link>
            )}
          </div>

          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start tracking your subscriptions like Netflix, Spotify, and more.
                </p>
                <Link to="/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subscription
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((subscription) => {
                const daysUntilDue = getDaysUntilDue(subscription.nextDueDate)
                const isShared = Number(subscription.isShared) > 0
                
                return (
                  <Card key={subscription.id} className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group border-l-4 border-l-gray-200 hover:border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">{subscription.name}</h4>
                              {isShared && (
                                <Badge variant="secondary" className="bg-accent/10 text-accent animate-pulse">
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Shared
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 group-hover:text-primary transition-colors" />
                                {formatAmount(subscription.amount)} / {subscription.billingCycle}
                                {isShared && (
                                  <span className="ml-1 text-accent font-medium">
                                    ({formatAmount(subscription.amount / 2)} your share)
                                  </span>
                                )}
                              </span>
                              
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 group-hover:text-primary transition-colors" />
                                Due {formatDate(subscription.nextDueDate)}
                                {daysUntilDue <= 3 && daysUntilDue >= 0 && (
                                  <Badge variant="destructive" className="ml-2 animate-bounce">
                                    {daysUntilDue === 0 ? 'Due Today' : `${daysUntilDue} days`}
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Shared Toggle */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Shared</span>
                            <Switch
                              checked={isShared}
                              onCheckedChange={() => toggleShared(subscription.id, subscription.isShared)}
                              className="data-[state=checked]:bg-accent"
                            />
                          </div>

                          {/* WhatsApp Nudge Button */}
                          {isShared && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendWhatsAppReminder(subscription)}
                              className="text-accent hover:text-accent hover:bg-accent/10 hover:scale-110 transition-all duration-200"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Nudge
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard