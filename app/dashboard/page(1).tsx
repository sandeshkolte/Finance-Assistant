// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
// import { formatCategory } from "@/lib/formatCategory";
// import SyncButton from "@/components/SyncButton";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { getSubscriptionStatus } from "@/lib/subscriptionStatus";

// export default function DashboardPage() {
//     const [data, setData] = useState<any>(null);
// const [search, setSearch] = useState("");
// const [sort, setSort] = useState<"date" | "amount">("date");
// const [page, setPage] = useState(1);
// const pageSize = 15;

//   useEffect(() => {
//     fetch("/api/dashboard")
//       .then(res => res.json())
//       .then(setData);
//   }, []);

//   useEffect(()=>{
//   setPage(1);
// },[search]);

//   if (!data) return <div className="p-6">Loading dashboard...</div>;

//   const totalSpent = data.transactions.reduce((a: number, t: any) => a + t.amount, 0);

//   const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

// const filtered = data.transactions.filter((t:any)=>
//   t.merchant.toLowerCase().includes(search.toLowerCase())
// );

// const sorted = [...filtered].sort((a,b)=>{
//   if(sort==="amount") return b.amount - a.amount;
//   return new Date(b.date).getTime() - new Date(a.date).getTime();
// });

// const totalPages = Math.ceil(sorted.length / pageSize);

// const paginated = sorted.slice(
//   (page - 1) * pageSize,
//   page * pageSize
// );

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className=" justify-between flex items-center">
//         <span className="text-3xl font-bold">

//         Financial Dashboard 
//         </span>
//         <SyncButton />
// </h1>

//       {/* SUMMARY CARDS */}
//       <div className="grid md:grid-cols-3 gap-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Total Transactions 
                
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="text-2xl font-bold">
//             {data.transactions.length}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Total Spent</CardTitle>
//           </CardHeader>
//           <CardContent className="text-2xl font-bold">
//             ${totalSpent.toFixed(2)}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Categories</CardTitle>
//           </CardHeader>
//           <CardContent className="text-2xl font-bold">
//             {data.categoryBreakdown.length}
//           </CardContent>
//         </Card>
//       </div>

//       {/* CHARTS */}
//       <div className="grid lg:grid-cols-3 gap-6">

//         {/* PIE CHART */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Spending by Category</CardTitle>
//           </CardHeader>
//           <CardContent className="h-80">
//             <ResponsiveContainer>
//               <PieChart>
//                 <Pie
//                   data={data.categoryBreakdown}
//                   dataKey="value"
//                   nameKey="name"
//                   outerRadius={120}
//                 >
//                   {data.categoryBreakdown.map((_: any, i: number) => (
//                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* BAR CHART */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Monthly Spending</CardTitle>
//           </CardHeader>
//           <CardContent className="h-80">
//             <ResponsiveContainer>
//               <BarChart data={data.monthlySummary}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="expense" />
//                 <Bar dataKey="income" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

// <Card>
//   <CardHeader>
//     <CardTitle>Insights</CardTitle>
//   </CardHeader>

//   <CardContent className="space-y-2">

//     {data.insights?.map((msg:string,i:number)=>(
//       <div
//         key={i}
//         className="p-3 rounded-lg bg-muted text-sm"
//       >
//         {msg}
//       </div>
//     ))}

//   </CardContent>
// </Card>

//       </div>

//  <div className="grid md:grid-cols-2 gap-4">


// <Card>
//   <CardHeader>
//     <CardTitle>Projected Spending</CardTitle>
//   </CardHeader>
//   <CardContent className="text-2xl font-bold">
//     ${data.burn.projected}
//   </CardContent>
// </Card>

// <Card>
//   <CardHeader>
//     <CardTitle>Net Worth</CardTitle>
//   </CardHeader>
//   <CardContent className="text-2xl font-bold">
//     ${data.netWorth}
//   </CardContent>
// </Card>
//  </div>

//       {/* TRANSACTIONS TABLE */}
// <div className="grid md:grid-cols-3 gap-4">

// <Card className="col-span-2">
//   <CardHeader>
//     <CardTitle>Recent Transactions</CardTitle>
//   </CardHeader>

//   <CardContent>
//     {/* SEARCH + SORT CONTROLS */}
//     <div className="flex flex-col md:flex-row gap-3 mb-4">

//       {/* SEARCH */}
//       <Input
//         placeholder="Search merchant..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="md:w-72"
//       />

//       {/* SORT BUTTONS */}
//       <div className="flex gap-2">
//         <Button
//           variant="outline"
//           onClick={() => setSort("date")}
//         >
//           Sort by Date
//         </Button>

//         <Button
//           variant="outline"
//           onClick={() => setSort("amount")}
//         >
//           Sort by Amount
//         </Button>
//       </div>
//     </div>

//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Merchant</TableHead>
//           <TableHead>Category</TableHead>
//           <TableHead>Date</TableHead>
//           <TableHead className="text-right">Amount</TableHead>
//         </TableRow>
//       </TableHeader>

//       <TableBody>
//         {paginated.map((t: any) => (
//           <TableRow key={t.id}>
//             <TableCell>{t.merchant}</TableCell>
//             <TableCell className="capitalize">{t.category}</TableCell>
//             <TableCell>
//               {new Date(t.date).toLocaleDateString()}
//             </TableCell>
//             <TableCell className="text-right font-medium">
//               ${t.amount}
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//     <div className="flex justify-between items-center mt-4">

//   <span className="text-sm text-muted-foreground">
//     Page {page} of {totalPages || 1}
//   </span>

//   <div className="flex gap-2">

//     <Button
//       variant="outline"
//       disabled={page===1}
//       onClick={()=>setPage(p=>p-1)}
//     >
//       Previous
//     </Button>

//     <Button
//       variant="outline"
//       disabled={page===totalPages || totalPages===0}
//       onClick={()=>setPage(p=>p+1)}
//     >
//       Next
//     </Button>

//   </div>
// </div>
//   </CardContent>
// </Card>

// <Card>
//   <CardHeader>
//     <CardTitle className="text-muted-foreground" >SUBSCRIPTIONS</CardTitle>
//   </CardHeader>

//   <CardContent className="space-y-4">

//     {data.subscriptions.length === 0 && (
//       <p className="text-sm text-muted-foreground">
//         No subscriptions detected
//       </p>
//     )}

// <div className="max-h-150 overflow-y-auto pr-2 space-y-3">
//     {data.subscriptions.map((s:any)=>{

//       // fake status logic (can replace with real later)
//      const status = getSubscriptionStatus(new Date(s.nextBilling));

//       const badgeStyle =
//   status==="paid"
//     ? "bg-green-100 text-green-700"
//     : status==="due"
//     ? "bg-orange-100 text-orange-700"
//     : "bg-red-100 text-red-700";

//       return (
//         <div
//           key={s.merchant}
//           className="flex  items-center justify-between p-3 rounded-xl border hover:bg-muted/40 transition"
//         >

//           {/* LEFT */}
//           <div className="flex items-center gap-3">

//             {/* ICON */}
//             <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg">
//               💳
//             </div>

//             {/* TEXT */}
//             <div>
//               <p className="font-medium">{s.merchant}</p>
//               <p className="text-sm text-muted-foreground">
//                 ${s.amount}/month
//               </p>
//             </div>

//           </div>

//           {/* RIGHT */}
//           <div className="flex items-center gap-3">

//             {/* STATUS BADGE */}
//             <span className={`px-3 py-1 text-xs rounded-full ${badgeStyle}`}>
//               {status === "paid" && "Paid"}
//               {status === "due" && "Due"}
//               {status === "overdue" && "Overdue"}
//               {/* {status === "unpaid" && "Unpaid"} */}
//             </span>

//             {/* MENU DOTS */}
//             <span className="text-muted-foreground text-lg">⋯</span>

//           </div>
//         </div>
//       );
//     })}
// </div>
//   </CardContent>
// </Card>
// </div>


//     </div>
//   );
// }
