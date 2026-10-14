export interface BellaSystem {
  id: string;
  title: string;
  kind: "public" | "admin";
  summary: string;
  details: string[];
}

export const systems: BellaSystem[] = [
  { id: "achadinhos-publico", title: "Achadinhos do Dev", kind: "public", summary: "Uma vitrine para quem gosta de tecnologia: produtos e oportunidades para o setup, o trabalho e o dia a dia.", details: ["Produtos organizados em um painel com seleção de detalhes.", "Periféricos, acessórios e itens para o espaço de trabalho.", "Opção de receber avisos de novos achados."] },
  { id: "ingles-publico", title: "Aprenda Inglês com Bella", kind: "public", summary: "Aprendizado no próprio ritmo, com foco no inglês que aparece na tecnologia e na vida profissional.", details: ["Teste de nivelamento de A1 a C2 e prática de Tech English.", "Quizzes, conversação, entrevistas e missões de estudo.", "Perfil, XP, sequência, conquistas e ranking."] },
  { id: "atendimento-publico", title: "Atendimento e suporte", kind: "public", summary: "Um espaço para dúvidas, solicitações, denúncias e propostas que precisam de acompanhamento individual.", details: ["Atendimento em uma thread privada com a equipe configurada.", "A Bella recebe, organiza o contexto e orienta a solicitação.", "Opções de atendimento geral, orçamento e denúncia."] },
  { id: "parceiros", title: "Programa de Parceiros", kind: "admin", summary: "A administração acompanha inscrições, configura a área dos parceiros e organiza o programa em um só painel.", details: ["Criação, prévia e atualização do painel público.", "Inscrições, parceiros aprovados, relatórios e métricas.", "Configuração de canais e acessos relacionados ao programa."] },
  { id: "tickets", title: "Central Administrativa de Tickets", kind: "admin", summary: "O atendimento é organizado por um painel fixo, com edição do visual e controle de funcionamento.", details: ["Editor, prévia e publicação do painel de atendimento.", "Horários, pausa, reabertura e opções de abertura.", "Consulta de tickets, métricas e configuração da equipe."] },
  { id: "ingles", title: "Central Administrativa de Inglês", kind: "admin", summary: "A gestão do aprendizado reúne o painel dos alunos, o conteúdo e as consultas de progresso.", details: ["Publicação, edição de texto e configuração do visual.", "Pausa ou reabertura do acesso ao módulo.", "Ranking, palavra do dia e métricas rápidas."] },
  { id: "nicknames", title: "Monitoramento de Nicknames", kind: "admin", summary: "As regras de nomes ficam centralizadas, com mudanças verificadas automaticamente e exceções configuráveis.", details: ["Termos bloqueados e nomes permitidos.", "Exceções por usuário ou cargo.", "Verificação dos membros e registro dos resultados."] },
  { id: "achadinhos", title: "Central de Achadinhos do Dev", kind: "admin", summary: "A curadoria da vitrine tem seu próprio painel para organizar produtos e controlar a publicação.", details: ["Cadastro, edição, remoção e consulta de produtos.", "Publicação e atualização do painel público.", "Configuração do visual, avisos e cargos responsáveis."] },
  { id: "cartas", title: "Painel de Cartas", kind: "admin", summary: "Mensagens individuais para acompanhamentos, retornos de proposta e contatos pontuais em nome de Talisson.", details: ["Seleção do destinatário e edição da mensagem.", "Registros de envio e alternativa quando a DM está fechada.", "Controles para pausar e reabrir o sistema."] },
];
