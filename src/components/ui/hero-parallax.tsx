import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

const panels = [
  { id: "tickets", title: "Central de Tickets", category: "Atendimento", summary: "Cada pedido encontra seu lugar. A Bella recebe a pessoa em uma conversa privada, organiza o assunto e aproxima a equipe quando é preciso.", details: ["Atendimentos em threads privadas, com categoria e prioridade.", "Painel editável, opções de abertura e horários configuráveis.", "Encaminhamento para a equipe e resumo ao encerrar."] },
  { id: "ingles", title: "Aprenda Inglês", category: "Aprendizado", summary: "Uma jornada de inglês voltada à tecnologia, com espaço para praticar, errar e acompanhar a própria evolução.", details: ["Teste de nivelamento e plano alinhado ao objetivo do aluno.", "Conversação, entrevistas, quizzes e correção de textos.", "XP, sequência de estudos, ranking e conquistas."] },
  { id: "parceiros", title: "Programa de Parceiros", category: "Parcerias", summary: "Da primeira indicação ao resultado: uma área dedicada para acompanhar oportunidades, materiais e a evolução de cada parceiro.", details: ["Inscrições e gestão pelo painel administrativo.", "Indicações, links individuais e histórico de resultados.", "Relatórios, evolução e simulações privadas de ganhos."] },
  { id: "cartas", title: "Painel de Cartas", category: "Comunicação", summary: "Mensagens individuais para acompanhamentos, retornos de propostas e contatos pontuais em nome de Talisson.", details: ["Escolha do destinatário e edição do texto pelo painel.", "Envio por mensagem direta com confirmação.", "Registro de envios e alternativa quando a DM está fechada."] },
  { id: "nicknames", title: "Monitor de Nicknames", category: "Moderação", summary: "Regras de nomes organizadas em um só lugar, com verificação automática de mudanças e exceções para a comunidade.", details: ["Termos bloqueados, nomes permitidos e exceções por pessoa ou cargo.", "Verificação dos membros atuais e registro em logs.", "Normalização de caracteres e correção de nomes fora das regras."] },
  { id: "alteracoes", title: "Alterações Críticas", category: "Segurança", summary: "Um olhar atento às mudanças sensíveis do servidor, para que a administração saiba o que aconteceu e onde precisa agir.", details: ["Acompanha permissões, canais administrativos, AutoMod e webhooks.", "Eventos registrados e alertas para casos altos e críticos.", "O detector avisa; não desfaz alterações automaticamente."] },
  { id: "backups", title: "Central de Backups", category: "Continuidade", summary: "Uma fotografia da estrutura do servidor, com versões salvas e uma restauração que começa pela revisão dos recursos.", details: ["Preserva cargos, canais, permissões, AutoMod e painéis autorizados.", "Prévia de conflitos, confirmação em duas etapas e snapshot prévio.", "Não inclui conversas comuns; a restauração pode ser parcial."] },
  { id: "presenca", title: "Central de Presença", category: "Presença", summary: "O jeito de estar por perto também é configurável. A central organiza o estado, a atividade e a agenda da Bella.", details: ["Agenda diária com horários e fuso configuráveis.", "Modos de presença personalizada, dinâmica e streamer.", "As configurações persistem após reinicializações."] },
  { id: "sorteios", title: "Bella Giveaways", category: "Comunidade", summary: "Do rascunho ao resultado, a administração acompanha cada sorteio pelo painel, com requisitos e participantes organizados.", details: ["Conteúdo, imagem, requisitos e publicação pelo painel.", "Agendamento, recorrência e reutilização de edições anteriores.", "Múltiplos vencedores, histórico e novo sorteio de resultados."] },
];

export function HeroParallax() {
  const root = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<typeof panels[number] | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end start"] });
  const spring = { stiffness: 300, damping: 30, bounce: 100 };
  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), spring);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), spring);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, .2], [15, 0]), spring);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, .2], [20, 0]), spring);
  const translateY = useSpring(useTransform(scrollYProgress, [0, .2], [-700, 500]), spring);
  const opacity = useSpring(useTransform(scrollYProgress, [0, .2], [.2, 1]), spring);
  const rows = [panels.slice(0, 3), panels.slice(3, 6), panels.slice(6, 9)];
  return (
    <section className="panel-showcase" id="paineis" aria-labelledby="panels-title" ref={root}>
      <div className="panel-parallax-heading content-width"><span className="eyebrow">Bella, em ação</span><h2 className="section-title" id="panels-title">O cuidado ganha <em>forma.</em></h2><p className="panels-intro">Explore os painéis reais da Bella. Clique em uma imagem para conhecer o que acontece por trás dela.</p></div>
      <Dialog.Root open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <motion.div className="panel-parallax-scene" style={reduced ? undefined : { rotateX, rotateZ, y: translateY, opacity }}>
          {rows.map((row, rowIndex) => (
            <div className={`panel-parallax-row ${rowIndex % 2 === 0 ? "panel-row-reverse" : ""}`} key={rowIndex}>
              {row.map(panel => (
                <motion.div className="panel-parallax-card" key={panel.id} style={reduced ? undefined : { x: rowIndex % 2 === 0 ? translateX : translateXReverse }} whileHover={reduced ? undefined : { y: -20 }}>
                  <Dialog.Trigger asChild><button className="panel-parallax-button" type="button" aria-label={`Conhecer ${panel.title}`} onClick={() => setSelected(panel)}>
                    <img src={`/images/paineis/${panel.id}.png`} alt={`Painel ${panel.title} no Discord`} loading="lazy" width="560" height="540" />
                    <span className="panel-parallax-scrim" aria-hidden="true" />
                    <span className="panel-parallax-caption">{panel.title}<ArrowUpRight aria-hidden="true" /></span>
                  </button></Dialog.Trigger>
                </motion.div>
              ))}
            </div>
          ))}
        </motion.div>
        <div className="panel-quick-access content-width"><span>Explore cada painel</span><div>{panels.map(panel => <Dialog.Trigger asChild key={panel.id}><button type="button" onClick={() => setSelected(panel)}>{panel.title}<ArrowUpRight aria-hidden="true" /></button></Dialog.Trigger>)}</div></div>
        <Dialog.Portal>
          <Dialog.Overlay className="panel-dialog-overlay" />
          <Dialog.Content className="panel-dialog-content">
            {selected && <><span className="eyebrow">{selected.category}</span><Dialog.Title className="panel-dialog-title">{selected.title}</Dialog.Title><Dialog.Description className="panel-dialog-description">{selected.summary}</Dialog.Description><ul>{selected.details.map(detail => <li key={detail}>{detail}</li>)}</ul><img className="panel-dialog-image" src={`/images/paineis/${selected.id}.png`} alt={`Captura completa de ${selected.title}`} /><a className="panel-enlarge" href={`/images/paineis/${selected.id}.png`} target="_blank" rel="noopener noreferrer">Ver imagem ampliada <ArrowUpRight aria-hidden="true" /></a><p className="panel-context">Captura de uma configuração do servidor; os estados mostrados podem mudar.</p></>}
            <Dialog.Close className="panel-dialog-close" aria-label="Fechar resumo"><X aria-hidden="true" /></Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
