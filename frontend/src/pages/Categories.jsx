import { useEffect, useState } from "react";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { apiRequest } from "../services/api";

export default function Categories(){
  const [items,setItems]=useState([]),[name,setName]=useState(""),[color,setColor]=useState("#6366f1"),[modal,setModal]=useState(false),[error,setError]=useState("");
  async function load(){try{const d=await apiRequest("/categories");setItems(d.categories||d.data?.categories||d.data||[])}catch(e){setError(e.message)}}
  useEffect(()=>{load()},[]);
  async function save(e){e.preventDefault();try{await apiRequest("/categories",{method:"POST",body:JSON.stringify({name,color})});setModal(false);setName("");load()}catch(e){setError(e.message)}}
  async function remove(id){if(!confirm("Delete this category?"))return;try{await apiRequest(`/categories/${id}`,{method:"DELETE"});load()}catch(e){setError(e.message)}}
  return <Layout><div className="page"><div className="page-head"><div><span className="eyebrow">ORGANIZATION</span><h1>Categories</h1><p className="muted">Create a simple system for your saved resources.</p></div><button className="primary-btn small" onClick={()=>setModal(true)}><Plus size={17}/> New category</button></div>
  {error&&<div className="alert">{error}</div>}
  {items.length?<div className="category-grid">{items.map(c=><div className="category-card" key={c.id}><div className="category-color" style={{background:c.color||"#6366f1"}}><FolderKanban/></div><div><h3>{c.name}</h3><span>Category</span></div><button className="icon-btn danger" onClick={()=>remove(c.id)}><Trash2 size={17}/></button></div>)}</div>:<div className="empty-card"><FolderKanban size={28}/><h3>No categories yet</h3><p>Create categories like Java, DSA, Web Development or AI.</p><button className="primary-btn small" onClick={()=>setModal(true)}><Plus size={16}/> Create category</button></div>}
  {modal&&<Modal title="Create category" onClose={()=>setModal(false)}><form className="modal-form" onSubmit={save}><label>Name<input required minLength="2" maxLength="60" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Java"/></label><label>Color<input type="color" value={color} onChange={e=>setColor(e.target.value)} className="color-input"/></label><div className="modal-actions"><button type="button" className="outline-btn" onClick={()=>setModal(false)}>Cancel</button><button className="primary-btn">Create category</button></div></form></Modal>}</div></Layout>
}