import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";

const questions = [
  { question: "Posso adicionar a Bella ao meu servidor?", answer: "A Bella é uma bot privada, dedicada à plataforma e à comunidade de Talisson Souza. Ela não possui um convite público para outros servidores." },
  { question: "Como começo uma conversa com ela?", answer: "No servidor, mencione a Bella, chame por “Bella, ...” ou responda a uma mensagem dela. Por padrão, as conversas públicas pedem uma menção para que ela não interrompa o chat." },
  { question: "O que acontece quando abro um ticket?", answer: "O atendimento acontece em uma thread privada, com você e a equipe configurada. A Bella organiza a categoria e a prioridade, ajuda com dúvidas e encaminha os assuntos que precisam da equipe. Ao encerrar, prepara um resumo." },
  { question: "Qualquer pessoa pode usar os painéis administrativos?", answer: "Não. As ações administrativas dependem das permissões e dos cargos autorizados. O modo executivo é exclusivo de Talisson; pedidos de outros usuários não recebem esse acesso. As tentativas são auditadas." },
  { question: "O backup salva as conversas do servidor?", answer: "Não. O backup é estrutural: guarda cargos, canais, permissões, AutoMod e painéis autorizados da Bella. A restauração apresenta uma prévia, pede confirmação em duas etapas e cria um snapshot antes de aplicar as mudanças." },
  { question: "Como funciona o aprendizado de inglês?", answer: "O aluno inicia uma thread privada, informa seu objetivo e pode fazer um nivelamento de A1 a C2. O módulo reúne plano de estudos, quizzes, conversação, entrevistas e correção de textos, com XP, níveis e conquistas para acompanhar a evolução." },
  { question: "As informações dos parceiros ficam públicas?", answer: "Os recursos de evolução, funil, simulação de ganhos e kit personalizado respondem de forma privada para cada parceiro. As simulações são estimativas, não promessas de pagamento. Os relatórios administrativos seguem os acessos configurados." },
  { question: "A presença da Bella muda sozinha?", answer: "Pode mudar conforme uma agenda configurável. Por padrão, no fuso de São Paulo, ela fica ausente das 21h às 07h e em não perturbe das 07h às 21h. A administração também pode escolher um modo personalizado, dinâmico ou streamer." },
];

export function FaqAccordion() {
  const [openItem, setOpenItem] = useState("");
  const reduced = useReducedMotion();
  return (
    <section className="bella-faq content-width" id="duvidas" aria-labelledby="faq-title">
      <div className="faq-heading"><span className="eyebrow">Uma conversa antes de ir</span><h2 className="section-title" id="faq-title">Pode perguntar.<br /><em>Ela explica.</em></h2><p>Algumas respostas para conhecer melhor o universo da Bella.</p><span className="faq-note">Você pergunta. Bella responde.</span></div>
      <Accordion.Root className="faq-conversation" type="single" collapsible value={openItem} onValueChange={setOpenItem}>
        {questions.map((item, index) => (
          <Accordion.Item className="faq-item" value={String(index)} key={item.question}>
            <Accordion.Header className="faq-question-heading"><Accordion.Trigger className="faq-trigger"><span className="faq-question">{item.question}</span><span className="faq-toggle"><Plus className="faq-plus" aria-hidden="true" /><Minus className="faq-minus" aria-hidden="true" /></span></Accordion.Trigger></Accordion.Header>
            <Accordion.Content asChild forceMount><motion.div className="faq-content" initial={false} animate={openItem === String(index) ? "open" : "collapsed"} variants={{ open: { opacity: 1, height: "auto" }, collapsed: { opacity: 0, height: 0 } }} transition={{ duration: reduced ? 0 : .4 }} aria-hidden={openItem !== String(index)} inert={openItem !== String(index)}><div className="faq-answer"><p>{item.answer}</p></div></motion.div></Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
