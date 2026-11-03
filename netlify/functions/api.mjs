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
const examQuestions = [{"id": 1, "question": "Qual é a principal função da DRE?", "options": ["Investigar crimes de trânsito.", "Combater e investigar o tráfico de drogas.", "Fiscalizar o comércio de alimentos.", "Realizar apenas patrulhamento ostensivo."], "correct": 1}, {"id": 2, "question": "O que significa a sigla DRE?", "options": ["Departamento Regional Especial.", "Divisão de Repressão Especial.", "Delegacia de Repressão a Entorpecentes.", "Departamento de Recursos Estratégicos."], "correct": 2}, {"id": 3, "question": "Qual é a principal função de uma investigação policial?", "options": ["Encontrar culpados sem provas.", "Reunir provas e informações sobre possíveis crimes.", "Prender qualquer pessoa suspeita.", "Evitar o registro de ocorrências."], "correct": 1}, {"id": 4, "question": "O que é tráfico de drogas?", "options": ["Comprar medicamentos em farmácias.", "Comercializar ou distribuir drogas ilegalmente.", "Transportar produtos autorizados.", "Portar documentos falsos."], "correct": 1}, {"id": 5, "question": "No Brasil, qual lei trata dos crimes relacionados a drogas?", "options": ["Lei nº 8.078/1990.", "Lei nº 11.343/2006.", "Lei nº 9.099/1995.", "Lei nº 12.527/2011."], "correct": 1}, {"id": 6, "question": "O que significa agir dentro da legalidade durante uma operação?", "options": ["Fazer tudo que o policial considerar necessário.", "Respeitar as leis e os procedimentos legais.", "Ignorar ordens superiores.", "Agir sem prestar contas."], "correct": 1}, {"id": 7, "question": "Qual é a importância de preservar o local de um crime?", "options": ["Evitar que provas sejam alteradas ou destruídas.", "Impedir a chegada de testemunhas.", "Facilitar a saída dos suspeitos.", "Encerrar a investigação rapidamente."], "correct": 0}, {"id": 8, "question": "O que é uma evidência em uma investigação?", "options": ["Uma opinião pessoal.", "Um elemento que pode ajudar a esclarecer os fatos.", "Um boato divulgado na cidade.", "Uma acusação sem fundamento."], "correct": 1}, {"id": 9, "question": "Qual deve ser a postura de um agente da DRE durante uma abordagem?", "options": ["Agir com arrogância.", "Desrespeitar os direitos do abordado.", "Manter a calma, a profissionalidade e seguir os procedimentos.", "Utilizar força em todas as situações."], "correct": 2}, {"id": 10, "question": "O que é flagrante delito?", "options": ["Quando alguém é encontrado em situação prevista em lei como flagrante de um crime.", "Quando alguém é investigado por um crime antigo.", "Quando uma pessoa recebe uma denúncia anônima.", "Quando um policial faz uma suspeita sem provas."], "correct": 0}, {"id": 11, "question": "Por que o sigilo é importante em uma investigação?", "options": ["Para esconder erros dos agentes.", "Para proteger informações e não comprometer a investigação.", "Para impedir qualquer fiscalização.", "Para evitar que a ocorrência seja registrada."], "correct": 1}, {"id": 12, "question": "O que significa cadeia de custódia?", "options": ["O registro e controle do caminho percorrido por uma evidência.", "A lista de policiais de uma delegacia.", "O transporte de presos entre cidades.", "O tempo de serviço de um agente."], "correct": 0}, {"id": 13, "question": "Qual atitude demonstra trabalho em equipe?", "options": ["Ignorar os colegas durante uma operação.", "Agir sozinho para receber reconhecimento.", "Manter comunicação e colaborar com a equipe.", "Desobedecer ao planejamento da operação."], "correct": 2}, {"id": 14, "question": "O que um agente deve fazer ao encontrar uma possível irregularidade durante uma investigação?", "options": ["Ignorar a situação.", "Resolver tudo por conta própria, sem registro.", "Comunicar a equipe responsável e seguir os procedimentos.", "Divulgar informações nas redes sociais."], "correct": 2}, {"id": 15, "question": "Qual é a diferença entre usuário e traficante na legislação brasileira?", "options": ["Não existe diferença legal.", "A lei considera as circunstâncias do caso para distinguir porte para consumo pessoal e tráfico.", "Todo usuário é automaticamente traficante.", "A quantidade é o único critério utilizado."], "correct": 1}, {"id": 16, "question": "Em uma operação, um policial recebe uma ordem manifestamente ilegal. O que deve fazer?", "options": ["Cumprir sem questionar.", "Não executar a ordem ilegal e comunicar a situação pelos meios adequados.", "Abandonar a equipe sem avisar.", "Fingir que não ouviu."], "correct": 1}, {"id": 17, "question": "O que é uma denúncia?", "options": ["Uma comunicação sobre possível ocorrência de um fato criminoso.", "Uma condenação judicial.", "Uma autorização para prender alguém.", "Uma prova definitiva de culpa."], "correct": 0}, {"id": 18, "question": "Qual é a importância do relatório policial?", "options": ["Registrar os fatos, procedimentos e informações relevantes da ocorrência.", "Substituir todas as provas.", "Apresentar opiniões pessoais sem fundamento.", "Evitar que superiores tenham conhecimento da operação."], "correct": 0}, {"id": 19, "question": "Se um agente perceber que um colega está agindo de maneira abusiva, qual deve ser sua atitude?", "options": ["Apoiar o colega independentemente da situação.", "Ignorar o ocorrido.", "Intervir de maneira segura, quando possível, e comunicar a conduta pelos canais adequados.", "Divulgar o caso publicamente antes de apurar os fatos."], "correct": 2}, {"id": 20, "question": "Por que você deseja fazer parte da DRE e o que acredita que pode contribuir para a equipe?", "options": ["Porque quero colaborar com disciplina, responsabilidade e trabalho em equipe.", "Porque quero ter autoridade para fazer o que quiser.", "Porque quero ignorar regras e procedimentos.", "Porque quero agir sozinho e não prestar contas."], "correct": 0}];
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
