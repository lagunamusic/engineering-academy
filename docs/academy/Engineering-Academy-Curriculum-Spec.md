# Engineering Academy — Curriculum Specification

> Documento de produto. Mora em `docs/academy/`, fora do Prometheus OS.
> O OS define a filosofia (imutável). Este documento define o currículo (vivo).
> Toda decisão aqui tem que continuar alinhada aos princípios do OS: competência sobre consumo, build before explain, evidência destrava progresso, a IA aumenta autonomia.

---

## Parte A — Arquitetura

### A escada de maturidade (não de tecnologia)

A Academy é dividida em 4 ciclos por **maturidade do Builder**, não por linguagem nem framework.

```
CYCLE I    Engineering Foundations    pensar como engenheiro (pré-código)
CYCLE II   Software Engineering       construir software de verdade
CYCLE III  Modern Engineering         sistemas em produção e escala
CYCLE IV   AI Engineering             construir com e sobre IA
+ Graduation Project                  um software inteiro, do zero ao deploy
```

### Capability-first híbrido (a inovação, com a trava honesta)

A organização por **capability** (Debugging treinado em Python, JS, Linux e Docker ao mesmo tempo, porque o que se desenvolve é o debugging, não a linguagem) é o diferencial central da Academy.

Mas ela tem uma trava: **capability-first puro quebra pro iniciante absoluto.** Quem nunca programou não consegue praticar "Debugging em 5 tecnologias" no dia 1 porque não conhece nenhuma ainda. Por isso:

- **Cycle I (Foundations) é sequenciado por conceito.** Escada, um degrau de cada vez.
- **A partir do Cycle II, a capability vira a lente organizadora.** Aí o Builder já tem contexto pra aplicar uma capacidade em vários lugares ao mesmo tempo.

O destino é o mesmo (formar Builder por capacidade). O começo precisa de andaime.

### Mastery Gates (unlock por evidência)

Entre ciclos existe um **Mastery Gate**. Ninguém avança por tempo gasto nem por aula concluída. Avança quando a **evidência** mostra que a capacidade foi demonstrada de forma independente. Os 4 níveis de maestria (do OS) valem em toda capability:

1. **Awareness** — entende o conceito.
2. **Assisted Practice** — executa com ajuda.
3. **Independent Execution** — executa sozinho.
4. **Mastery** — aplica em situação nova e ensina outro.

**Regra de corte:** pra destravar o próximo módulo, o Builder precisa atingir no mínimo **Independent Execution** nas capabilities-alvo daquele módulo. Abaixo disso, não avança: recebe **reforço dirigido** (ver Parte C, mecânica 3).

---

## Parte B — Template de Módulo (os 18 componentes)

Todo módulo, do 01 ao último, segue esta estrutura fixa. É isso que faz a Academy parecer universidade, não curso. O que muda é o conteúdo; a forma é sempre esta.

| # | Componente | O que é |
|---|-----------|---------|
| 1 | **Purpose** | Por que este módulo existe, em uma frase. A capacidade que ele forma. |
| 2 | **Learning Outcomes** | O que o Builder consegue FAZER ao final (verbos de ação, não "entender"). |
| 3 | **Capabilities** | As capabilities-alvo (do Capability Map) e o nível de maestria esperado. |
| 4 | **Knowledge** | O mínimo de teoria necessário, introduzido só quando o build pede. |
| 5 | **Exercises** | Aquecimentos curtos, baixo risco, pra criar familiaridade. |
| 6 | **Mini Missions** | Desafios pequenos e reais que constroem a capacidade por partes. |
| 7 | **Boss Mission** | O desafio integrador do módulo. Entregável de verdade. |
| 8 | **Evaluation** | A rubrica fechada que decide o nível de maestria por evidência. (🔴) |
| 9 | **Portfolio Evidence** | O que do módulo vira prova permanente no portfólio. |
| 10 | **AI Prompts** | O comportamento real do AI Guide em cada fase do módulo. (🔴) |
| 11 | **Reflection** | As perguntas que transformam a experiência em entendimento. |
| 12 | **Reading** | Leitura de apoio (curada, não obrigatória pra avançar). |
| 13 | **Videos** | Vídeo de apoio (curado, opcional). |
| 14 | **Optional Challenges** | Desafios extras pra quem quer mais. |
| 15 | **Stretch Goals** | O degrau de Mastery: aplicar em contexto novo ou ensinar. |
| 16 | **Common Mistakes** | Os erros típicos do módulo (alimentam o detector de leaks). |
| 17 | **Mastery Checklist** | O que o Builder confere pra saber que dominou. |

### As três mecânicas 🔴 que todo módulo herda

Definidas uma vez aqui, válidas em todos os módulos.

**🔴 Mecânica 1 — Rubrica de avaliação real (componente 8).**
Cada capability-alvo tem uma rubrica fechada com critérios observáveis nos 4 níveis de maestria, mais um **checklist de evidência** que a IA aplica no entregável. Sem rubrica fechada, "medir capacidade" é slogan. A rubrica é o que torna a avaliação objetiva e repetível.

**🔴 Mecânica 2 — Feedback vira gap + próxima ação (componente 10).**
Toda avaliação termina no mesmo contrato de saída, nunca numa nota solta:
- **O que foi bem** (específico, não "bom trabalho").
- **O gap que está travando** (a UMA capability abaixo do corte).
- **A próxima micro-missão exata** que fecha esse gap.
Feedback que não aponta o próximo passo deixa o Builder no escuro.

**🔴 Mecânica 3 — Detector de leak + reforço dirigido (componentes 16 + 10).**
A IA registra o **tipo de erro** que o Builder comete (tags em Common Mistakes) num log pessoal. Erro que se repete entre módulos dispara uma **missão de reforço dirigida** que ataca exatamente aquele leak. Capacidade cresce fechando fraqueza, não somando aula. (É o sistema de leaks do poker, aplicado a engenharia.)

---

## Parte C — Módulo 01, preenchido até o osso

### CYCLE I · Module 01 — Introduction to Engineering

> **Decisão de design (importante):** o Módulo 01 do teu rascunho começava por conceito (o que é engenharia, systems thinking, mental models) e terminava num projeto. Inverti. O Builder **constrói primeiro** e os conceitos são extraídos do que ele fez. Isso é o "build before explain" do OS aplicado ao próprio módulo de abertura. Engenharia se aprende decidindo e quebrando, não ouvindo definição de engenharia.
>
> **Nota de acessibilidade:** Módulo 01 é **pré-código**. Nada de instalar nada, nada de sintaxe. O Builder pensa e expressa em passos precisos (pseudocódigo em linguagem natural). Isso remove a barreira de setup e foca na capacidade que importa aqui: decompor e raciocinar. A sintaxe entra no Módulo 02.

---

#### 1. Purpose
Fazer alguém que nunca programou pensar como engenheiro: pegar um problema bagunçado do mundo real, quebrar em partes precisas, reduzir ao que importa, e descobrir onde a própria solução quebra. Forma a capacidade-raiz de toda engenharia: **decomposição de problemas**.

#### 2. Learning Outcomes
Ao final, o Builder consegue:
- Pegar um problema vago e separar em entradas, regras e saída.
- Reduzir um problema às poucas regras que de fato importam (first principles).
- Expressar uma solução como um algoritmo preciso, passo a passo, que outra pessoa (ou máquina) seguiria sem dúvida.
- Encontrar sozinho os casos onde a própria solução dá resposta errada (systems thinking).

#### 3. Capabilities (alvo + nível esperado)
- **Problem Decomposition** → Independent Execution (corte do módulo)
- **First-principles reasoning** → Assisted Practice
- **Systems thinking** → Awareness
- *(todas do Domain 1 — Engineering Mindset do Capability Map)*

#### 4. Knowledge (só o que o build pede, introduzido depois da mão na massa)
- **Algoritmo:** uma sequência de passos precisos e sem ambiguidade que leva de uma entrada a uma saída.
- **Decomposição:** separar um problema em entrada (o que entra), regras (o que decide), saída (o que sai).
- **First principles:** quais regras são essenciais e quais dá pra jogar fora sem mudar o resultado.
- **Edge case:** a entrada incomum que faz uma solução razoável dar uma resposta burra.

#### 5. Exercises (aquecimento, baixo risco)
- E1: Descreva "fazer um café" como passos que um robô seguiria. Onde seu passo é ambíguo demais pro robô entender?
- E2: Pegue a regra "se está de manhã, tome café". Ache uma situação real onde ela falha.

#### 6. Mini Missions
- **MM1 — Vira regra.** Pegue uma decisão que você toma no automático (que roupa vestir, que caminho fazer) e escreva como uma regra precisa que uma máquina seguiria.
- **MM2 — Quebra a própria regra.** Ache a UMA situação onde sua regra do MM1 dá uma resposta idiota. Conserte a regra. Veja se a correção criou um novo buraco.
- **MM3 — Separa as partes.** Pegue um problema um pouco maior ("vale a pena pedir delivery ou cozinhar hoje?") e separe explicitamente em entradas, regras e saída.

#### 7. Boss Mission
**Construa um "motor de decisão" para um problema real e bagunçado que você escolher.**
Exemplo: "devo ir de bike ou de ônibus pro trabalho?" Entradas possíveis: está chovendo, tempo disponível, distância, disposição. O Builder precisa:
1. **Decompor** o problema em entradas, regras e saída.
2. **Reduzir** às regras que realmente importam (jogar fora as que não mudam o resultado) e justificar o corte.
3. **Expressar** como um algoritmo preciso, passo a passo, em linguagem natural.
4. **Testar** contra pelo menos 2 edge cases que ele mesmo descobrir, e mostrar como o motor se comporta neles.

Entregável: o motor escrito como passos precisos + a lista de edge cases testados + uma frase explicando qual regra ele cortou e por quê.

#### 8. Evaluation 🔴 (rubrica fechada — capability: Problem Decomposition)

| Nível | Critério observável no entregável |
|-------|-----------------------------------|
| **Awareness** | Percebe que o problema tem partes, mas mistura entrada com regra, ou esquece entradas óbvias. Algoritmo tem buracos que travam quem fosse seguir. |
| **Assisted Practice** | Com cutucada do AI Guide, separa entrada/regra/saída. Acha edge case só quando provocado. |
| **Independent Execution** *(corte do módulo)* | Sem ajuda: separa entrada/regra/saída de forma limpa, algoritmo é seguível sem dúvida, e acha **2+ edge cases sozinho**. |
| **Mastery** | Tudo do nível acima + justifica quais regras cortou e por quê (first principles), antecipa o trade-off de tratar vs ignorar cada edge case, e o algoritmo é claro o bastante pra ensinar outro. |

**Checklist de evidência (o que a IA confere no entregável):**
- [ ] Entradas, regras e saída estão separadas e nomeadas (não emboladas).
- [ ] O algoritmo é seguível por um estranho sem perguntar nada.
- [ ] Pelo menos 2 edge cases foram achados pelo próprio Builder.
- [ ] Há uma justificativa de qual regra foi cortada e por quê.
- [ ] Para Mastery: o trade-off de cada edge case está explicado.

**Corte pra destravar o Módulo 02:** atingir **Independent Execution**. Abaixo disso, não avança, vai pra reforço dirigido.

#### 9. Portfolio Evidence
O motor de decisão entra no portfólio como **primeira prova de capacidade**: "decompôs um problema real e achou onde sua própria solução quebrava". É a primeira peça do portfólio vivo.

#### 10. AI Prompts 🔴 (o comportamento real do AI Guide neste módulo)

> Estes são os prompts/posturas que eu (AI Guide) sigo de verdade quando você roda o módulo. Não são teoria.

- **Onboarding (primeira vitória, primeiros minutos):**
  "Não vou te explicar o que é engenharia. Vou te fazer fazer. Me dá uma decisão que você toma no automático todo dia. Qualquer uma." → conduz o MM1 até ele ter uma regra precisa e sentir "eu acabei de pensar como engenheiro".
- **Mentoria durante (mentor, não solver):**
  Nunca dá a resposta. Pergunta: "o que acontece com sua regra se [situação incomum]?" / "isso é uma entrada ou uma regra?" / "essa regra muda o resultado? se não, por que ela tá aí?". Deixa o Builder achar o buraco.
- **Avaliação (aplica a rubrica do componente 8):**
  Roda o checklist de evidência contra o entregável, crava o nível de maestria, e nunca devolve nota seca.
- **Feedback (contrato da Mecânica 2):**
  Sempre nesta forma: (a) o que foi bem, específico; (b) o gap que trava (a UMA capability abaixo do corte); (c) a próxima micro-missão exata que fecha o gap.
- **Log de leak (Mecânica 3):**
  Registra a tag de erro recorrente (ver Common Mistakes) no log do Builder, pra disparar reforço dirigido se repetir nos próximos módulos.

#### 11. Reflection
- Qual parte do problema você nem tinha percebido que existia até quebrar em partes?
- Seu primeiro algoritmo dava conta de tudo, ou você descobriu buracos? O que isso te diz sobre "solução pronta"?
- Onde mais na sua vida você resolve coisa no automático que daria pra decompor assim?

#### 12. Reading
A curar (não inventar título nem link). Tópicos certos pra buscar: decomposição de problemas, pensamento por first principles, o que é um algoritmo em linguagem acessível pra leigo. *(marcar como TODO de curadoria, sem citar fonte falsa.)*

#### 13. Videos
A curar. Tópico: "o que é um algoritmo" explicado pra quem nunca programou. *(TODO de curadoria.)*

#### 14. Optional Challenges
- Refaça o motor de decisão para um problema da sua área (Laguna, Glou, mídia paga) e veja se a decomposição muda.
- Dê seu algoritmo pra outra pessoa seguir ao pé da letra e veja onde ela trava. Cada trava é uma ambiguidade que você não viu.

#### 15. Stretch Goals (degrau de Mastery)
- Explique seu motor de decisão pra alguém que nunca programou, em 2 minutos, e faça a pessoa entender. Ensinar é a prova final de Mastery.

#### 16. Common Mistakes (tags pro detector de leak)
- `confunde-entrada-com-regra` — trata um dado como se fosse uma decisão.
- `esquece-edge-case` — só pensa no caminho feliz.
- `over-engineering` — cria regra pra caso que nunca acontece.
- `ambiguidade` — passo que um estranho não conseguiria seguir sem perguntar.
- `nao-corta-regra` — mantém regra que não muda o resultado (não aplicou first principles).

#### 17. Mastery Checklist
- [ ] Consigo pegar um problema vago e separar entrada, regra e saída sem ajuda.
- [ ] Meu algoritmo é seguível por um estranho sem ele perguntar nada.
- [ ] Acho sozinho onde minha solução quebra.
- [ ] Sei dizer qual regra é essencial e qual dá pra jogar fora.
- [ ] Consigo explicar meu raciocínio pra alguém que nunca programou.

---

## Próximos módulos (só o esqueleto, a fábrica vem depois)

Não preenchemos os outros agora de propósito (profundidade antes de escala). O Cycle I segue: Module 02 Computational Thinking, Module 03 Programming Fundamentals, Module 04 Git, Module 05 Clean Code, fechando no **Boss Project I: build your first application**. Cada um herda o template de 18 componentes e as três mecânicas 🔴 deste documento.

A fábrica dos ~200 módulos só começa depois que o Módulo 01 se provar no Builder 1.
