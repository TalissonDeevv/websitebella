import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { PublicCommand } from "@/lib/public-platform";

export function CommandsCatalog({ commands }: { commands: PublicCommand[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(
    () =>
      [...new Set(commands.map((command) => command.category))].sort((left, right) =>
        left.localeCompare(right),
      ),
    [commands],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return commands.filter(
      (command) =>
        (category === "all" || command.category === category) &&
        (!normalized ||
          command.name.toLocaleLowerCase("pt-BR").includes(normalized) ||
          command.description.toLocaleLowerCase("pt-BR").includes(normalized)),
    );
  }, [category, commands, query]);

  if (!commands.length) {
    return <EmptyCatalog />;
  }
  return (
    <div>
      <div className="command-tools">
        <label className="command-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Buscar comandos</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar no catálogo público"
          />
        </label>
        <label className="command-category">
          <span className="sr-only">Filtrar por categoria</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="command-list" aria-live="polite">
          {filtered.map((command) => (
            <article className="command-item" key={command.name}>
              <div>
                <span>{command.category}</span>
                <h3>{command.name}</h3>
                <p>{command.description}</p>
              </div>
              <dl>
                <div>
                  <dt>Permissões</dt>
                  <dd>{command.permissions}</dd>
                </div>
                <div>
                  <dt>Disponibilidade</dt>
                  <dd>{command.availability}</dd>
                </div>
                {command.restrictions && (
                  <div>
                    <dt>Observação</dt>
                    <dd>{command.restrictions}</dd>
                  </div>
                )}
              </dl>
              {command.examples.length > 0 && <code>{command.examples[0]}</code>}
            </article>
          ))}
        </div>
      ) : (
        <div className="observatory-empty">
          <span>Nenhum resultado</span>
          <p>Tente outro termo ou remova o filtro de categoria.</p>
        </div>
      )}
    </div>
  );
}

function EmptyCatalog() {
  return (
    <div className="observatory-empty">
      <span>Catálogo aguardando sincronização</span>
      <p>Somente comandos explicitamente autorizados para divulgação aparecerão aqui.</p>
    </div>
  );
}
