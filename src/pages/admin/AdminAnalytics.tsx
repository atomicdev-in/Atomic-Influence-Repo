import { useMemo } from "react";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminDashboardStats, useAdminAuditLogs } from "@/hooks/useAdminData";
import { useAuditLogStats } from "@/hooks/useSystemIntegrity";
import { DashboardSkeleton } from "@/components/ui/page-skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Megaphone,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChartIcon,
  LineChartIcon
} from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AdminAnalytics() {
  const { data: stats, isLoading: statsLoading, refetch } = useAdminDashboardStats();
  const { data: auditStats, isLoading: auditLoading } = useAuditLogStats();

  const isLoading = statsLoading || auditLoading;

  // Mock data for charts - in production, this would come from the database
  const platformGrowthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    return months.slice(0, currentMonth + 1).map((month, i) => ({
      month,
      creators: Math.floor(10 + (i * 15) + Math.random() * 20),
      brands: Math.floor(5 + (i * 8) + Math.random() * 10),
      campaigns: Math.floor(3 + (i * 5) + Math.random() * 8),
    }));
  }, []);

  const userDistributionData = useMemo(() => [
    { name: 'Creators', value: stats?.totalCreators || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Brands', value: stats?.totalBrands || 0, color: 'hsl(var(--chart-2))' },
    { name: 'Admins', value: 1, color: 'hsl(var(--chart-3))' },
  ], [stats]);

  const campaignStatusData = useMemo(() => [
    { name: 'Active', value: stats?.activeCampaigns || 0, color: 'hsl(142 76% 36%)' },
    { name: 'Draft', value: Math.max(0, (stats?.totalCampaigns || 0) - (stats?.activeCampaigns || 0) - 2), color: 'hsl(var(--chart-4))' },
    { name: 'Completed', value: 2, color: 'hsl(var(--chart-5))' },
  ], [stats]);

  const activityData = useMemo(() => {
    if (!auditStats?.dailyData) return [];
    return auditStats.dailyData.slice(-14).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actions: item.count
    }));
  }, [auditStats]);

  const categoryData = useMemo(() => {
    if (!auditStats?.categoryCounts) return [];
    return Object.entries(auditStats.categoryCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }));
  }, [auditStats]);

  if (isLoading) {
    return <AdminDashboardLayout><DashboardSkeleton /></AdminDashboardLayout>;
  }

  // Calculate growth percentages (mock data)
  const creatorGrowth = 12.5;
  const brandGrowth = 8.3;
  const campaignGrowth = 15.2;
  const engagementGrowth = -2.1;

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    growth: number; 
    icon: React.ElementType;
    color: string;
  }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge 
            variant="outline" 
            className={growth >= 0 ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"}
          >
            {growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {Math.abs(growth)}%
          </Badge>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminDashboardLayout title="Analytics" onRefresh={async () => { await refetch(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Platform Analytics" 
              subtitle="Growth metrics, trends, and performance insights"
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                title="Total Creators" 
                value={stats?.totalCreators || 0} 
                growth={creatorGrowth}
                icon={Users}
                color="bg-blue-500/10 text-blue-400"
              />
              <StatCard 
                title="Total Brands" 
                value={stats?.totalBrands || 0} 
                growth={brandGrowth}
                icon={Building2}
                color="bg-purple-500/10 text-purple-400"
              />
              <StatCard 
                title="Total Campaigns" 
                value={stats?.totalCampaigns || 0} 
                growth={campaignGrowth}
                icon={Megaphone}
                color="bg-green-500/10 text-green-400"
              />
              <StatCard 
                title="Audit Actions (30d)" 
                value={auditStats?.totalLast30Days || 0} 
                growth={engagementGrowth}
                icon={Activity}
                color="bg-amber-500/10 text-amber-400"
              />
            </div>

            <Tabs defaultValue="growth" className="space-y-6">
              <TabsList className="bg-card/50 border border-white/10">
                <TabsTrigger value="growth" className="data-[state=active]:bg-primary/20">
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  Growth Trends
                </TabsTrigger>
                <TabsTrigger value="distribution" className="data-[state=active]:bg-primary/20">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Distribution
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-primary/20">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* Growth Trends Tab */}
              <TabsContent value="growth" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle>Platform Growth</CardTitle>
                    <CardDescription>Monthly growth trends for creators, brands, and campaigns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={platformGrowthData}>
                          <defs>
                            <linearGradient id="colorCreators" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorBrands" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorCampaigns" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                          <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                          <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="creators" 
                            stroke="hsl(var(--chart-1))" 
                            fillOpacity={1} 
                            fill="url(#colorCreators)" 
                            name="Creators"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="brands" 
                            stroke="hsl(var(--chart-2))" 
                            fillOpacity={1} 
                            fill="url(#colorBrands)"
                            name="Brands"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="campaigns" 
                            stroke="hsl(var(--chart-3))" 
                            fillOpacity={1} 
                            fill="url(#colorCampaigns)"
                            name="Campaigns"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Distribution Tab */}
              <TabsContent value="distribution" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle>User Distribution</CardTitle>
                      <CardDescription>Breakdown of platform users by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={userDistributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {userDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle>Campaign Status</CardTitle>
                      <CardDescription>Current state of all campaigns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={campaignStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {campaignStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle>Daily Activity</CardTitle>
                      <CardDescription>Audit log activity over the past 14 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                            <XAxis dataKey="date" className="text-muted-foreground" tick={{ fontSize: 10 }} />
                            <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                            <Bar dataKey="actions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle>Activity Categories</CardTitle>
                      <CardDescription>Distribution of audit log categories (30 days)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                            <XAxis type="number" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" className="text-muted-foreground" tick={{ fontSize: 10 }} width={100} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                            <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Survey Engagement */}
            <Card className="bg-card/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle>Survey Engagement</CardTitle>
                <CardDescription>Survey completion and response metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-lg bg-muted/10">
                    <p className="text-3xl font-bold text-primary">{stats?.totalSurveys || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Active Surveys</p>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/10">
                    <p className="text-3xl font-bold text-green-500">{stats?.totalSurveyResponses || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Responses</p>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/10">
                    <p className="text-3xl font-bold text-amber-500">
                      {stats?.totalSurveys && stats.totalSurveys > 0 
                        ? Math.round((stats.totalSurveyResponses || 0) / stats.totalSurveys) 
                        : 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Avg. Responses/Survey</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
}
