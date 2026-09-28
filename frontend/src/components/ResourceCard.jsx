import { ExternalLink, Pencil, Trash2, FileText, Video, Globe, GraduationCap, Newspaper, Link2 } from "lucide-react";

const icons = { documentation: FileText, article: Newspaper, video: Video, course: GraduationCap, website: Globe, other: Link2 };

export default function ResourceCard({ resource, onEdit, onDelete }) {
  const Icon = icons[resource.type] || Link2;
  const categoryName = resource.category_name || resource.category?.name;
  return (
    <article className="resource-card">
      <div className="resource-icon"><Icon size={20}/></div>
      <div className="resource-main">
        <div className="resource-top">
          <span className="type-pill">{resource.type || "resource"}</span>
          {categoryName && <span className="category-pill">{categoryName}</span>}
        </div>
        <h3>{resource.title}</h3>
        {resource.description && <p>{resource.description}</p>}
        <div className="resource-actions">
          <a className="primary-link" href={resource.url} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open</a>
          <button className="text-btn" onClick={() => onEdit(resource)}><Pencil size={15}/> Edit</button>
          <button className="danger-text" onClick={() => onDelete(resource)}><Trash2 size={15}/> Delete</button>
        </div>
      </div>
    </article>
  );
}