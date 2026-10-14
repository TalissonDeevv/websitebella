import type { ComponentProps } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function MaskLine({ className, orientation, ...props }: ComponentProps<"div"> & { orientation: "horizontal" | "vertical" }) {
  return <div aria-hidden="true" className={cn("creator-line", `creator-line-${orientation}`, className)} {...props} />;
}

export function CreatorCredit() {
  return <section className="creator-section content-width" id="criador" aria-label="Criador da Bella">
    <figure className="creator-credit">
      <div className="creator-photo">
        <MaskLine className="creator-line-left" orientation="vertical" />
        <MaskLine className="creator-line-right" orientation="vertical" />
        <MaskLine className="creator-line-top" orientation="horizontal" />
        <MaskLine className="creator-line-bottom" orientation="horizontal" />
        <Avatar className="creator-avatar">
          <AvatarImage src="/images/talisson-souza.jpeg" alt="Talisson Souza, criador da Bella Nyelle" draggable={false} loading="lazy" />
          <AvatarFallback>TS</AvatarFallback>
        </Avatar>
      </div>
      <figcaption className="creator-caption">
        <p><strong>Bella Nyelle</strong> foi criada por <strong>Talisson Souza</strong>, para cuidar da sua rotina, da plataforma e da comunidade.</p>
        <div className="creator-signature"><span>Talisson Souza</span><small>Criador da Bella Nyelle</small></div>
        <a href="https://www.talissonsouza.com.br" target="_blank" rel="noopener noreferrer">talissonsouza.com.br <ArrowUpRight aria-hidden="true" /></a>
      </figcaption>
    </figure>
  </section>;
}
