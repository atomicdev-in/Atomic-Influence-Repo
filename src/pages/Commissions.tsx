import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Filter, 
  Download, 
  Search,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Wallet,
  TrendingUp,
  X
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition, staggerContainer, fadeInUp } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Commissions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("commissions");

  // Commission data
  const commissions = [
    {
      id: 1,
      campaign: "Summer Skincare Collection",
      brand: "GlowSkin Co.",
      amount: "$456.00",
      status: "processing",
      date: "Jan 12, 2026",
      type: "Affiliate",
      platform: "Instagram",
    },
    {
      id: 2,
      campaign: "Smart Home Essentials",
      brand: "TechFlow",
      amount: "$678.00",
      status: "pending",
      date: "Jan 8, 2026",
      type: "Sponsored",
      platform: "YouTube",
    },
    {
      id: 3,
      campaign: "Streetwear Spring Drop",
      brand: "Urban Threads",
      amount: "$100.00",
      status: "ready",
      date: "Jan 5, 2026",
      type: "Affiliate",
      platform: "TikTok",
    },
    {
      id: 4,
      campaign: "Eco Fashion Collection",
      brand: "GreenStyle",
      amount: "$320.00",
      status: "completed",
      date: "Dec 28, 2025",
      type: "Sponsored",
      platform: "Instagram",
    },
    {
      id: 5,
      campaign: "Premium Headphones Review",
      brand: "AudioMax",
      amount: "$550.00",
      status: "completed",
      date: "Dec 20, 2025",
      type: "Review",
      platform: "YouTube",
    },
    {
      id: 6,
      campaign: "Fitness App Launch",
      brand: "FitLife Pro",
      amount: "$280.00",
      status: "completed",
      date: "Dec 15, 2025",
      type: "Affiliate",
      platform: "Instagram",
    },
  ];

  // Payment history
  const paymentHistory = [
    {
      id: 1,
      description: "Payout - December 2025",
      amount: "$1,245.80",
      date: "Dec 15, 2025",
      status: "completed",
      method: "Bank Transfer",
      reference: "PAY-2025-1215-001",
    },
    {
      id: 2,
      description: "Payout - November 2025",
      amount: "$987.60",
      date: "Nov 15, 2025",
      status: "completed",
      method: "Bank Transfer",
      reference: "PAY-2025-1115-001",
    },
    {
      id: 3,
      description: "Payout - October 2025",
      amount: "$1,456.00",
      date: "Oct 15, 2025",
      status: "completed",
      method: "PayPal",
      reference: "PAY-2025-1015-001",
    },
    {
      id: 4,
      description: "Payout - September 2025",
      amount: "$823.00",
      date: "Sep 15, 2025",
      status: "completed",
      method: "Bank Transfer",
      reference: "PAY-2025-0915-001",
    },
    {
      id: 5,
      description: "Payout - August 2025",
      amount: "$1,102.40",
      date: "Aug 15, 2025",
      status: "completed",
      method: "Bank Transfer",
      reference: "PAY-2025-0815-001",
    },
  ];

  // Stats
  const stats = [
    { label: "Total Earned", value: "$4,852.40", icon: DollarSign, color: "text-cyan", bgColor: "bg-cyan/20" },
    { label: "Pending", value: "$1,234.00", icon: Clock, color: "text-orange", bgColor: "bg-orange/20" },
    { label: "This Month", value: "$892.50", icon: TrendingUp, color: "text-pink", bgColor: "bg-pink/20" },
    { label: "Completed", value: "12", icon: CheckCircle, color: "text-success", bgColor: "bg-success/20" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/20 text-success border-success/30">Completed</Badge>;
      case "processing":
        return <Badge className="bg-cyan/20 text-cyan border-cyan/30">Processing</Badge>;
      case "pending":
        return <Badge className="bg-orange/20 text-orange border-orange/30">Pending</Badge>;
      case "ready":
        return <Badge className="bg-purple/20 text-purple border-purple/30">Ready</Badge>;
      default:
        return null;
    }
  };

  // Filter commissions
  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = searchQuery === "" || 
      commission.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = statusFilter !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <motion.div 
          className="p-6 lg:p-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <PageHeader
            title="Commissions & Payouts"
            subtitle="Track your earnings, pending commissions, and payment history."
            icon={Wallet}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="gradient-primary text-white">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </motion.div>
          </PageHeader>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            variants={fadeInUp}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="glass rounded-2xl p-5"
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto glass border border-white/10 p-1 mb-6">
              <TabsTrigger 
                value="commissions" 
                className="data-[state=active]:gradient-primary data-[state=active]:text-white rounded-lg px-6"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Commissions
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="data-[state=active]:gradient-primary data-[state=active]:text-white rounded-lg px-6"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment History
              </TabsTrigger>
            </TabsList>

            {/* Commissions Tab */}
            <TabsContent value="commissions" className="mt-0">
              {/* Filters */}
              <div className="glass rounded-2xl p-4 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search campaigns or brands..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] bg-white/5 border-white/10 rounded-xl">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-white/10">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Commission List */}
              <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Campaign</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Platform</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommissions.map((commission, index) => (
                        <motion.tr 
                          key={commission.id} 
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        >
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-foreground">{commission.campaign}</p>
                              <p className="text-sm text-muted-foreground">{commission.brand}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="secondary" className="bg-white/5 border-white/10">
                              {commission.type}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">{commission.platform}</td>
                          <td className="py-4 px-6 text-muted-foreground">{commission.date}</td>
                          <td className="py-4 px-6 text-right font-semibold text-cyan">{commission.amount}</td>
                          <td className="py-4 px-6 text-right">{getStatusBadge(commission.status)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCommissions.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No commissions found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                    <Button onClick={clearFilters} variant="outline" className="border-white/10">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-0">
              {/* Next Payout Card */}
              <motion.div 
                className="glass rounded-2xl p-6 mb-6 border border-primary/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-cyan" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Next Scheduled Payout</h3>
                      <p className="text-sm text-muted-foreground">January 15, 2026 • Bank Transfer (****4521)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-cyan">$1,234.00</span>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="gradient-primary text-white">
                        Request Early Payout
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Payment History Table */}
              <div className="glass rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="font-semibold text-foreground">Payment History</h3>
                  <p className="text-sm text-muted-foreground">All your past payouts and transactions</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Reference</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Method</th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => (
                        <motion.tr 
                          key={payment.id} 
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        >
                          <td className="py-4 px-6">
                            <span className="font-medium text-foreground">{payment.description}</span>
                          </td>
                          <td className="py-4 px-6">
                            <code className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                              {payment.reference}
                            </code>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">{payment.date}</td>
                          <td className="py-4 px-6 text-muted-foreground">{payment.method}</td>
                          <td className="py-4 px-6 text-right font-semibold text-success">{payment.amount}</td>
                          <td className="py-4 px-6 text-right">{getStatusBadge(payment.status)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Commissions;
