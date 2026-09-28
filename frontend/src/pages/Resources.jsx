import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import Layout from "../components/Layout";
import ResourceCard from "../components/ResourceCard";
import Modal from "../components/Modal";
import { apiRequest } from "../services/api";

const empty={title:"",url:"",description:"",type:"website",categoryId:""};

export default function Resources() {
  const [params,setParams]=useSearchParams();
  const [resources,setResources]=useState([]),[categories,setCategories]=useState([]),[pagination,setPagination]=useState(null);
  const [query,setQuery]=useState(""),[type,setType]=useState(""),[category,setCategory]=useState(""),[page,setPage]=useState(1);
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[modal,setModal]=useState(false),[editing,setEditing]=useState(null),[form,setForm]=useState(empty);

  async function load() {
    setBusy(true); setError("");
    try {
      const qs=new URLSearchParams();
      if(query)qs.set("search",query); if(type)qs.set("type",type); if(category)qs.set("category",category);
      qs.set("page",String(page));
      const [r,c]=await Promise.all([apiRequest(`/resources?${qs}`),apiRequest("/categories")]);
      const resourceData=r.data||r;
      setResources(resourceData.resources||[]); setPagination(resourceData.pagination||null);
      setCategories(c.categories||c.data?.categories||c.data||[]);
    } catch(e){setError(e.message);setPagination(null)} finally{setBusy(false)}
  }
  useEffect(()=>{load()},[query,type,category,page]);
  useEffect(()=>{if(params.get("add")==="1"){openAdd();params.delete("add");setParams(params)}},[]);
  function openAdd(){setEditing(null);setForm(empty);setModal(true)}
  function openEdit(r){setEditing(r);setForm({title:r.title||"",url:r.url||"",description:r.description||"",type:r.type||"website",categoryId:r.category_id||r.category?.id||""});setModal(true)}
  async function save(e){
    e.preventDefault();setError("");
    try {
      const body={...form,categoryId:form.categoryId||null};
      if(editing) await apiRequest(`/resources/${editing.id}`,{method:"PUT",body:JSON.stringify(body)});
      else await apiRequest("/resources",{method:"POST",body:JSON.stringify(body)});
      setModal(false);load();
    }catch(err){setError(err.message)}
  }
  async function remove(r){
    if(!confirm(`Delete "${r.title}"?`))return;
    try{await apiRequest(`/resources/${r.id}`,{method:"DELETE"});load()}catch(e){setError(e.message)}
  }
  const filtered=useMemo(()=>resources,[resources]);
  return <Layout><div className="page">
    <div className="page-head"><div><span className="eyebrow">LIBRARY</span><h1>Resources</h1><p className="muted">Everything you've chosen to keep.</p></div><button className="primary-btn small" onClick={openAdd}><Plus size={17}/> Add resource</button></div>
    {error&&<div className="alert">{error}</div>}
    <div className="toolbar">
      <div className="searchbox"><Search size={18}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Search your resources..."/>{query&&<button onClick={()=>{setQuery("");setPage(1)}}><X size={16}/></button>}</div>
      <div className="filter"><SlidersHorizontal size={17}/><select value={type} onChange={e=>{setType(e.target.value);setPage(1)}}><option value="">All types</option><option value="documentation">Documentation</option><option value="article">Article</option><option value="video">Video</option><option value="course">Course</option><option value="website">Website</option><option value="other">Other</option></select></div>
      <div className="filter"><select value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}}><option value="">All categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
    </div>
    {busy?<div className="empty-card"><div className="loader"/><p>Loading resources...</p></div>:filtered.length?<div className="resource-grid">{filtered.map(r=><ResourceCard key={r.id} resource={r} onEdit={openEdit} onDelete={remove}/>)}</div>:<div className="empty-card"><BookOpenIcon/><h3>No resources found</h3><p>Try another search or add a new resource.</p><button className="primary-btn small" onClick={openAdd}><Plus size={16}/> Add resource</button></div>}
    {pagination?.totalPages>1&&<div className="pagination"><span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} resources</span><div><button className="outline-btn" disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</button><button className="outline-btn" disabled={page>=pagination.totalPages} onClick={()=>setPage(page+1)}>Next</button></div></div>}
    {modal&&<Modal title={editing?"Edit resource":"Add a resource"} onClose={()=>setModal(false)}><form className="modal-form" onSubmit={save}>
      <label>Title<input required minLength="3" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Java Collections Guide"/></label>
      <label>URL<input required type="url" value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://..."/></label>
      <div className="two-col"><label>Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{["documentation","article","video","course","website","other"].map(x=><option key={x}>{x}</option>)}</select></label><label>Category<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}><option value="">No category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
      <label>Description<textarea maxLength="1000" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What makes this resource useful?"/></label>
      <div className="modal-actions"><button type="button" className="outline-btn" onClick={()=>setModal(false)}>Cancel</button><button className="primary-btn">{editing?"Save changes":"Add resource"}</button></div>
    </form></Modal>}
  </div></Layout>
}
function BookOpenIcon(){return <div className="large-icon">📚</div>}