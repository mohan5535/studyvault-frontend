import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, FolderKanban, Plus, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [resources,setResources]=useState([]); const [resourceTotal,setResourceTotal]=useState(0); const [categories,setCategories]=useState([]);
  const [error,setError]=useState("");
  useEffect(()=>{Promise.all([apiRequest("/resources"),apiRequest("/categories")]).then(([r,c])=>{
    const resourceData=r.data||r;
    setResources(resourceData.resources||[]); setResourceTotal(resourceData.pagination?.total??resourceData.resources?.length??0); setCategories(c.categories||c.data?.categories||c.data||[]);
  }).catch(e=>setError(e.message))},[]);
  return <Layout><div className="page">
    <div className="page-head"><div><span className="eyebrow">OVERVIEW</span><h1>Your learning hub</h1><p className="muted">A quick view of everything you've saved.</p></div><Link className="primary-btn small" to="/resources?add=1"><Plus size={17}/> Add resource</Link></div>
    {error && <div className="alert">{error}</div>}
    <div className="stat-grid">
      <div className="stat-card"><div className="stat-icon"><BookOpen/></div><span>Resources</span><strong>{resourceTotal}</strong><small>Saved in your vault</small></div>
      <div className="stat-card"><div className="stat-icon purple"><FolderKanban/></div><span>Categories</span><strong>{categories.length}</strong><small>Your organization system</small></div>
      <div className="stat-card wide-stat"><div className="stat-icon green"><Sparkles/></div><span>Workspace</span><strong>Ready</strong><small>Search, filter and manage your resources</small></div>
    </div>
    <div className="section-head"><div><h2>Recent resources</h2><p className="muted">Your latest saved learning links.</p></div><Link to="/resources" className="outline-btn">View all <ArrowUpRight size={16}/></Link></div>
    {resources.slice(0,4).length ? <div className="dashboard-list">{resources.slice(0,4).map(r=><div className="recent-row" key={r.id}><div className="recent-icon"><BookOpen size={17}/></div><div><b>{r.title}</b><span>{r.type || "resource"} {(r.category_name || r.category?.name) ? `· ${r.category_name || r.category.name}` : ""}</span></div><a href={r.url} target="_blank" rel="noreferrer"><ArrowUpRight size={17}/></a></div>)}</div> :
      <div className="empty-card"><Search size={26}/><h3>Your vault is empty</h3><p>Start by saving your first useful resource.</p><Link className="primary-btn small" to="/resources?add=1">Add first resource</Link></div>}
  </div></Layout>;
}