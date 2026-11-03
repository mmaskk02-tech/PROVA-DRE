import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const store = getStore({ name: "dre-inscricoes", consistency: "strong" });
const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const json = (statusCode, body) => new Response(JSON.stringify(body), { status: statusCode, headers });
const secret = () => process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
function sign(value) { return crypto.createHmac("sha256", secret()).update(value).digest("hex"); }
function makeToken() { const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url"); return payload + "." + sign(payload); }
function validToken(event) {
  const authorization = event.headers?.get
    ? event.headers.get("authorization")
    : event.headers?.authorization;
  const token = (authorization || "").replace(/^Bearer\s+/i, "");
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !secret()) return false;
  const expected = sign(payload);
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now(); } catch { return false; }
}
async function all() { return (await store.get("submissions", { type: "json" })) || []; }
async function save(items) { await store.setJSON("submissions", items); }
const examQuestions = [{"id":1,"question":"Durante uma investigação, policiais encontram elementos que indicam tráfico de drogas dentro de uma residência. Segundo a Constituição Federal, em qual situação a entrada sem mandado judicial pode ocorrer?","options":["Sempre que houver uma denúncia anônima.","Quando houver fundadas razões de flagrante delito, justificadas posteriormente, ou nas demais hipóteses constitucionais.","Sempre que o policial considerar a investigação urgente.","Quando um vizinho autorizar a entrada."],"correct":1},{"id":2,"question":"De acordo com a Lei 11.343/2006, qual elemento diferencia juridicamente o tráfico do porte para consumo pessoal?","options":["Exclusivamente a quantidade de droga apreendida.","Exclusivamente a existência de antecedentes criminais.","A análise das circunstâncias da conduta, natureza e quantidade da substância, local, condições da ação e demais elementos previstos em lei.","Apenas a confissão do suspeito."],"correct":2},{"id":3,"question":"O que caracteriza o crime de associação para o tráfico previsto no artigo 35 da Lei 11.343/2006?","options":["Duas pessoas estarem juntas no momento de uma abordagem.","Uma pessoa comprar drogas de outra pessoa.","A existência de qualquer conversa sobre drogas.","A associação de duas ou mais pessoas para praticar os crimes previstos na lei, observados os requisitos jurídicos aplicáveis."],"correct":3},{"id":4,"question":"Durante uma operação, um agente recolhe um celular que pode conter provas. Qual procedimento é fundamental para preservar a integridade da evidência digital?","options":["Documentar a apreensão, preservar o dispositivo e seguir procedimentos técnicos de aquisição e análise forense.","Abrir todas as conversas imediatamente.","Encaminhar o aparelho sem qualquer registro.","Compartilhar os arquivos com todos os integrantes da equipe."],"correct":0},{"id":5,"question":"Segundo o Código de Processo Penal, o que pode acontecer com uma prova obtida mediante violação de normas constitucionais ou legais?","options":["Será sempre aceita se ajudar na investigação.","Será automaticamente transformada em prova testemunhal.","Poderá ser considerada ilícita e inadmissível no processo, conforme o artigo 157.","Poderá ser utilizada livremente se o suspeito for reincidente."],"correct":2},{"id":6,"question":"Qual é a finalidade principal da cadeia de custódia prevista nos artigos 158-A e seguintes do CPP?","options":["Determinar a pena do investigado.","Controlar e documentar a história cronológica do vestígio, desde o reconhecimento até o descarte.","Definir qual policial será responsável pela ocorrência.","Substituir o laudo pericial."],"correct":1},{"id":7,"question":"Uma investigação identifica que uma organização criminosa atua em mais de um estado e possui conexões internacionais com o tráfico de drogas. Qual instituição possui atribuições constitucionais para prevenir e reprimir o tráfico ilícito de entorpecentes, sem prejuízo da atuação de outros órgãos?","options":["Exclusivamente a Polícia Militar.","Exclusivamente a Guarda Municipal.","Apenas os órgãos administrativos estaduais.","Polícia Federal, dentro das atribuições previstas no artigo 144 da Constituição."],"correct":3},{"id":8,"question":"Qual é a diferença entre indício e prova no contexto de uma investigação criminal?","options":["Indício é uma circunstância conhecida e provada que permite inferir outra circunstância; prova é o conjunto de elementos utilizados para demonstrar fatos relevantes.","São termos absolutamente idênticos.","Indício sempre significa culpa comprovada.","Prova é apenas aquilo que o suspeito confessa."],"correct":0},{"id":9,"question":"Um agente recebe uma informação anônima sobre possível tráfico em determinado endereço. Qual é a conduta investigativa mais adequada?","options":["Prender imediatamente todos os moradores.","Invadir o imóvel para confirmar a denúncia.","Tratar a denúncia como informação inicial e buscar elementos independentes de confirmação, respeitando os limites legais.","Divulgar o endereço em grupos públicos."],"correct":2},{"id":10,"question":"Em uma investigação, um policial altera deliberadamente o conteúdo de um relatório para prejudicar um investigado. Qual princípio ou dever funcional é diretamente comprometido?","options":["Hierarquia exclusivamente.","Legalidade, probidade e imparcialidade.","Eficiência administrativa exclusivamente.","Publicidade irrestrita."],"correct":1},{"id":11,"question":"Qual é a função da perícia criminal em uma investigação de tráfico?","options":["Determinar sozinha a condenação do investigado.","Substituir todas as diligências policiais.","Decidir se o suspeito deve ser preso preventivamente.","Produzir conhecimento técnico-científico sobre vestígios relevantes para esclarecer os fatos."],"correct":3},{"id":12,"question":"Em relação à busca domiciliar durante o dia, quando existe mandado judicial, qual alternativa está correta?","options":["A busca deve observar as condições constitucionais e legais, incluindo a regra de cumprimento durante o dia.","O mandado permite entrada a qualquer hora, sem restrições.","O mandado dispensa qualquer formalidade.","O policial pode estender a busca a qualquer imóvel vizinho."],"correct":0},{"id":13,"question":"Qual é a finalidade da investigação patrimonial em uma operação contra uma organização criminosa ligada ao tráfico?","options":["Apenas identificar os veículos utilizados pelos agentes.","Substituir a investigação criminal por uma auditoria particular.","Identificar bens, valores e fluxos financeiros possivelmente relacionados às atividades ilícitas.","Descobrir exclusivamente a renda dos familiares dos investigados."],"correct":2},{"id":14,"question":"Qual situação pode configurar abuso de autoridade, conforme a legislação brasileira?","options":["Toda abordagem policial, independentemente das circunstâncias.","A prática de conduta prevista na Lei 13.869/2019, com os requisitos legais específicos, incluindo a finalidade exigida pela lei.","Qualquer investigação que não resulte em condenação.","Toda prisão que posteriormente seja revogada."],"correct":1},{"id":15,"question":"Durante uma operação, um suspeito tenta destruir provas. Qual deve ser a prioridade da equipe?","options":["Agir sem planejamento e sem comunicação.","Ignorar a destruição para evitar burocracia.","Alterar o local para facilitar a perícia.","Preservar a segurança das pessoas, impedir a destruição dos vestígios dentro dos limites legais e documentar os procedimentos."],"correct":3},{"id":16,"question":"Qual é a diferença entre prisão em flagrante e prisão preventiva?","options":["A prisão em flagrante ocorre nas hipóteses legais de flagrância; a preventiva depende de decisão judicial e dos requisitos previstos no CPP.","Não existe diferença.","A prisão preventiva pode ser decretada livremente por qualquer policial.","A prisão em flagrante exige sempre condenação anterior."],"correct":0},{"id":17,"question":"Uma equipe realiza uma apreensão de substância suspeita. Qual é a importância do laudo toxicológico definitivo?","options":["Determinar automaticamente a culpa de todos os presentes.","Substituir o registro da apreensão.","Confirmar tecnicamente a natureza da substância, contribuindo para a comprovação da materialidade delitiva.","Definir a quantidade de anos da pena sem decisão judicial."],"correct":2},{"id":18,"question":"Qual lei brasileira institui o Sistema Nacional de Políticas Públicas sobre Drogas e define crimes relacionados a drogas?","options":["Lei 8.069/1990.","Lei 11.343/2006.","Lei 10.826/2003.","Lei 9.605/1998."],"correct":1},{"id":19,"question":"O que significa cadeia de custódia?","options":["Lista de policiais de uma delegacia.","Transporte de presos entre cidades.","Tempo de serviço de um agente.","Controle e documentação do histórico de um vestígio."],"correct":3},{"id":20,"question":"Qual é a diferença entre porte para consumo pessoal e tráfico de drogas?","options":["A distinção depende da análise das circunstâncias previstas na legislação, não apenas de um único critério.","Todo usuário é automaticamente considerado traficante.","Somente a quantidade determina o enquadramento.","A diferença depende exclusivamente da declaração do suspeito."],"correct":0}];
async function allExams() { return (await store.get("exams", { type: "json" })) || []; }
async function saveExams(items) { await store.setJSON("exams", items); }

export default async (request) => {
  if (request.method !== "POST") return json(405, { error: "Método não permitido." });
  let body; try { body = await request.json(); } catch { return json(400, { error: "Requisição inválida." }); }
  const action = body.action;
  if (action === "exam-questions") {
    return json(200, { questions: examQuestions.map(({id, question, options}) => ({id, question, options})) });
  }
  if (action === "exam-submit") {
    const d = body.data || {};
    const name = clean(d.name), discordName = clean(d.discordName), gameId = clean(d.gameId);
    if (!name || !discordName || !gameId) return json(400, { error: "Preencha nome, nome no Discord e ID no jogo." });
    if (!Array.isArray(d.answers) || d.answers.length !== examQuestions.length || d.answers.some((v, i) => !Number.isInteger(v) || v < 0 || v > 3)) return json(400, { error: "Responda às 20 questões antes de enviar a prova." });
    const correctAnswers = examQuestions.map(q => q.correct);
    const score = d.answers.reduce((sum, answer, i) => sum + (answer === correctAnswers[i] ? 1 : 0), 0);
    const exams = await allExams();
    const exam = { id: "PROVA-" + crypto.randomBytes(3).toString("hex").toUpperCase(), name, discordName, gameId, answers: d.answers, correctAnswers, score, total: examQuestions.length, createdAt: new Date().toISOString() };
    exams.unshift(exam); await saveExams(exams);
    return json(201, { ok: true, id: exam.id, message: "Prova enviada com sucesso." });
  }
  if (action === "login") {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) return json(503, { error: "Configure ADMIN_PASSWORD nas variáveis de ambiente do Netlify." });
    const supplied = String(body.password || "");
    const a = Buffer.from(supplied), b = Buffer.from(password);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return json(401, { error: "Senha incorreta." });
    return json(200, { token: makeToken() });
  }
  if (!validToken(request)) return json(401, { error: "Sessão inválida ou expirada. Entre novamente." });
  if (action === "exam-list") return json(200, { exams: await allExams() });
  if (action === "list") return json(200, { items: await all() });
  if (action === "status") {
    const allowed = ["Pendente", "Em análise", "Aceita", "Reprovada"];
    if (!allowed.includes(body.status)) return json(400, { error: "Status inválido." });
    const items = await all(), item = items.find(x => x.id === body.id);
    if (!item) return json(404, { error: "Inscrição não encontrada." });
    const previous = item.status; item.status = body.status; item.updatedAt = new Date().toISOString();
    await save(items);
    if (body.status === "Aceita" && previous !== "Aceita") await notifyDiscord(item);
    return json(200, { ok: true, item });
  }
  if (action === "register") {
    const d = body.data || {};
    const required = ["firstName","lastName","city","rg","phone","discordName","discordTag"];
    if (required.some(k => !String(d[k] || "").trim())) return json(400, { error: "Preencha todos os campos obrigatórios." });
    if (!/^\d{6}$/.test(String(d.rg)) || !/^\d{3}-\d{3}$/.test(String(d.phone))) return json(400, { error: "O RG deve ter seis números sem hífen e o telefone deve ter o formato 000-000." });
    if (d.consent !== true) return json(400, { error: "Confirme a declaração antes de enviar." });
    const items = await all();
    if (items.some(x => x.discordId && d.discordId && x.discordId === d.discordId && !["Reprovada"].includes(x.status))) return json(409, { error: "Já existe uma inscrição ativa com este ID do Discord." });
    const id = "DRE-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const item = { id, firstName: clean(d.firstName), lastName: clean(d.lastName), city: clean(d.city), rg: d.rg, phone: d.phone, discordName: clean(d.discordName), discordTag: clean(d.discordTag), discordId: String(d.discordId || "").replace(/\D/g,"").slice(0,22), status: "Pendente", createdAt: new Date().toISOString() };
    items.unshift(item); await save(items);
    return json(201, { ok: true, id, status: item.status });
  }
  return json(400, { error: "Ação desconhecida." });
};
function clean(v) { return String(v || "").trim().replace(/[<>]/g, "").slice(0, 100); }
async function notifyDiscord(item) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  const mention = /^\d{17,20}$/.test(item.discordId) ? `<@${item.discordId}>` : item.discordTag;
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `✅ **Inscrição aceita — DRE / Nova Capital RP**\nCandidato: **${item.firstName} ${item.lastName}**\nDiscord: ${mention}\nProtocolo: \`${item.id}\`\nO candidato foi aprovado na etapa de inscrição e deve acompanhar as orientações da equipe para os próximos passos.` , allowed_mentions: { parse: [], users: /^\d{17,20}$/.test(item.discordId) ? [item.discordId] : [] } }) });
  } catch (e) { console.error("Falha ao notificar Discord:", e); }
}
