
import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Layers, PieChart as PieChartIcon, Tag } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

interface DashboardTabProps {
  allOrders: any[] | undefined;
  allSouvenirs: any[] | undefined;
  allUsers: any[] | undefined;
}

const COLORS = ['#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

export const DashboardTab: React.FC<DashboardTabProps> = ({ allOrders, allSouvenirs, allUsers }) => {
  const analytics = useMemo(() => {
    if (!allOrders || !allSouvenirs || !allUsers) return null;

    const successfulOrders = allOrders.filter(o => o.status !== 'CANCELLED');
    const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const approvedUsersCount = allUsers.filter(u => u.status === 'APPROVED').length;
    const inventoryValue = allSouvenirs.reduce((sum, s) => sum + (s.price * s.stock), 0);

    const timelineMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      timelineMap[dateStr] = 0;
    }

    successfulOrders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (timelineMap[dateStr] !== undefined) {
        timelineMap[dateStr] += o.totalPrice;
      }
    });

    const revenueTimeline = Object.entries(timelineMap).map(([date, amount]) => ({ date, amount }));

    const statusCounts = {
      'Pending': allOrders.filter(o => o.status === 'PENDING_WHATSAPP').length,
      'Completed': allOrders.filter(o => o.status === 'COMPLETED').length,
      'Cancelled': allOrders.filter(o => o.status === 'CANCELLED').length,
    };
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const catMap: Record<string, number> = {};
    allSouvenirs.forEach(s => {
      catMap[s.category] = (catMap[s.category] || 0) + 1;
    });
    const categoryData = Object.entries(catMap).map(([name, count]) => ({ name, count }));

    return {
      totalRevenue,
      totalOrders: allOrders.length,
      approvedUsersCount,
      inventoryValue,
      revenueTimeline,
      statusData,
      categoryData
    };
  }, [allOrders, allSouvenirs, allUsers]);

  if (!analytics) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-rose-50 shadow-sm space-y-4 group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Revenue</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-slate-900">GH₵{analytics.totalRevenue.toLocaleString()}</h3>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-rose-50 shadow-sm space-y-4 group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900">{analytics.totalOrders}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-rose-50 shadow-sm space-y-4 group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Customers</p>
            <h3 className="text-2xl font-black text-slate-900">{analytics.approvedUsersCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-rose-50 shadow-sm space-y-4 group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Value</p>
            <h3 className="text-2xl font-black text-slate-900">GH₵{analytics.inventoryValue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-rose-50 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-rose-500" /> Revenue Growth
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase">Last 30 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueTimeline}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-rose-50 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <PieChartIcon size={20} className="text-rose-500" /> Order Status
            </h3>
          </div>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={analytics.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-rose-50 shadow-sm space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Tag size={20} className="text-rose-500" /> Category Popularity
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#fff1f2' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {analytics.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
