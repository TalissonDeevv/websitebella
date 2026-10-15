import type { ReactNode } from "react";

export interface NumberedItem { id?: string; title: ReactNode; content: ReactNode; }
export function NumberedCards({ items, headingLevel = 3 }: { items: NumberedItem[]; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <div className="numbered-grid">{items.map((item, index) => <article className="numbered-card" id={item.id} key={item.id ?? index}>
    <span className="numbered-card-index">{String(index + 1).padStart(2, "0")}</span>
    <div className="numbered-card-copy"><Heading>{item.title}</Heading><div className="numbered-card-description">{item.content}</div></div>
  </article>)}</div>;
}
