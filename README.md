# Meu Controle Financeiro

Aplicativo para anotar ganhos, gastos por categoria, saldo bancário e dinheiro guardado.

## Rodar no VS Code

1. Extraia o ZIP em uma pasta.
2. Abra a pasta `meu-controle-financeiro` no VS Code.
3. Instale a extensão **Live Server** (Ritwick Dey), caso ainda não tenha.
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.
5. O aplicativo abrirá no navegador.

> Para instalar como aplicativo no Android, o site precisa estar publicado em uma hospedagem com HTTPS. O Live Server serve para testar no computador e na rede local, mas não publica o app na internet.

## Instalar no Android depois de publicar

1. Abra o endereço HTTPS do aplicativo no Chrome do celular.
2. Toque no menu ⋮.
3. Escolha **Instalar aplicativo** ou **Adicionar à tela inicial**.

## O que já está pronto

- Registro de ganhos e gastos com data, categoria e observação opcional.
- Categorias de despesas: alimentação, gasolina, contas, moradia, mercado, saúde, lazer, compras, transporte e outros.
- Patrimônio acumulado do mês selecionado, calculado com o saldo inicial, todos os lançamentos até o período e o histórico datado do dinheiro guardado.
- Saldo bancário calculado com o saldo inicial e lançamentos a partir da data de referência.
- Fechamento histórico por mês, com aviso quando a referência do saldo ou o histórico do dinheiro guardado não permitem um cálculo confiável.
- Histórico datado do dinheiro guardado para calcular totais de períodos anteriores sem presumir valores.
- Edição de lançamentos sem duplicar registros, além da exclusão.
- Contas a pagar não recorrentes, fixas mensais e parceladas; só viram despesa quando marcadas como pagas.
- Edição de contas pagas sincronizada com a despesa registrada; excluir uma conta paga também remove a despesa vinculada.
- Edição de um lançamento vinculado mantém a conta sincronizada; excluir seu pagamento devolve a conta ao estado pendente para evitar uma conta marcada como paga sem despesa.
- Edição de uma ocorrência fixa ou de toda a série futura, cancelamento sem apagar pagamentos e parcelas com vencimentos e pagamentos independentes.
- Parcelas com distribuição de centavos para que a soma corresponda exatamente ao valor total da compra.
- Transferências datadas entre saldo bancário e dinheiro guardado; elas aparecem no histórico, não contam como ganhos/gastos e mantêm o patrimônio total.
- Controles independentes para ocultar valores financeiros.
- Resumo mensal de ganhos e gastos, com o dinheiro guardado mantido separado do saldo bancário.
- Comparação visual do mês selecionado com o anterior e diferença percentual.
- Comparação de patrimônio acumulado entre períodos e média de crescimento baseada em fechamentos mensais confiáveis.
- Médias dos meses anteriores disponíveis (sem incluir o mês atual) e alertas de tendência.
- Limite mensal de gastos opcional e editável.
- Orçamento Inteligente mensal, com limites recomendados e ajustes manuais independentes por mês.
- Planejamento Financeiro do Próximo Mês, com projeção de renda, contas, gasolina, economia, gastos não essenciais, segurança e resultado patrimonial.
- Comparação entre plano e resultado real: economia transferida, despesas não essenciais, contas pagas, saldo bancário e evolução do patrimônio.
- Classificação dos gastos como fixos, variáveis necessários ou não essenciais; gasolina e contas fixas não consomem o orçamento não essencial.
- Categorias personalizadas de receita e despesa, com biblioteca de ícones local pesquisável e classificação financeira integrada ao planejamento.
- Gerenciamento de categorias com edição, arquivamento do histórico ou reclassificação confirmada de lançamentos, contas e recorrências.
- Sugestões iniciais por categoria: contas/moradia como fixos; gasolina/mercado/saúde/transporte como necessários; demais categorias como não essenciais. A classificação pode ser alterada em cada lançamento.
- Recomendação conservadora de 10% do saldo livre planejado, usando saldo bancário de abertura, contas previstas, médias de despesas necessárias/gasolina e reserva de segurança definida por mês.
- Progresso de gastos não essenciais, valor restante, percentual utilizado, dias no mês e aviso ao ultrapassar o limite.
- Navegação entre meses anteriores e próximos.
- Lista de lançamentos com edição de valor, tipo, categoria, data e observação, além da exclusão.
- Histórico de lançamentos e transferências com rolagem própria para até seis registros visíveis.
- Metas financeiras com versões mensais persistentes de nome e valor desejado, progresso automático pelo patrimônio do mês selecionado e controle independente para ocultar os valores.
- Gráfico de barras por categoria (proporção dos gastos do mês).
- Backup em arquivo JSON e restauração.
- Interface responsiva, tema claro lilás e funcionamento offline após primeiro carregamento.

## Importante sobre os dados

Os dados ficam no armazenamento local do navegador (`localStorage`) deste aparelho e deste navegador. Lançamentos e dinheiro guardado existentes são preservados; saldo inicial, data de referência, contas, transferências, histórico e preferências também ficam salvos. Transferências podem ser editadas ou excluídas e são aplicadas aos fechamentos conforme a data registrada, sem alterar ganhos, gastos ou patrimônio total. O app confere o saldo disponível antes de cada operação e impede uma edição ou exclusão que deixaria uma transferência posterior sem cobertura. Transferências retroativas exigem saldo inicial e histórico do dinheiro guardado conhecidos para a data. Em dados antigos sem data de referência confirmada, o saldo atual continua calculado como antes, mas fechamentos históricos ficam indisponíveis até confirmar essa data. O histórico de dinheiro guardado começa na data registrada; totais anteriores sem registro são indicados como indisponíveis. Se os dados salvos estiverem ilegíveis, o app mostra um aviso e preserva o conteúdo original em uma chave local de recuperação. Limpar os dados do navegador pode apagá-los. Faça backup regularmente pelo botão no topo. Backups antigos continuam podendo ser restaurados. Para usar em mais de um aparelho com sincronização automática, será necessário adicionar uma conta e um banco de dados na nuvem em uma próxima versão.

O visual usa um tema escuro com fundo em gradiente, sem imagem de fundo.

## Estrutura

- `index.html`: telas e estrutura.
- `styles.css`: visual e responsividade.
- `app.js`: cálculos e armazenamento.
- `manifest.webmanifest`: configuração instalável.
- `sw.js`: cache para funcionamento offline.
- `icons/icon.svg`: ícone do app.

O Orçamento Inteligente é calculado e salvo por mês. O dinheiro livre planejado é o saldo bancário no início do mês, mais entradas recorrentes confiáveis registradas, menos contas previstas, essenciais estimados, gasolina estimada e a reserva de segurança definida para aquele mês. A recomendação é 10% somente do resultado positivo; o saldo guardado não entra nessa base. O aplicativo ainda não cadastra entradas futuras recorrentes, então não presume ganhos incertos nem soma novamente ganhos já incluídos no saldo. Para meses futuros, o saldo bancário de hoje é apenas uma referência provisória; o orçamento é recalculado quando o mês começa. Orçamentos do mês atual e de meses futuros acompanham alterações relevantes nos dados, enquanto meses anteriores mantêm seus registros. A reserva de segurança pode ser ajustada no diálogo do orçamento. O limite manual é independente, vale somente para o mês escolhido e não apaga o cálculo recomendado. Orçamentos de fórmulas anteriores são atualizados quando o respectivo mês é aberto, preservando o ajuste manual. Médias com menos de três meses disponíveis são identificadas como provisórias; sem dados essenciais, de gasolina ou saldo bancário confiável, o limite recomendado fica em R$ 0,00 até haver dados suficientes, mas ainda pode ser ajustado manualmente.

O Planejamento Financeiro é salvo separadamente para cada mês. Usa os três meses completos mais recentes disponíveis para estimar a renda, a média diária registrada e a tendência; aplica 25% da variação mensal observada, com ajuste limitado a 10% da média. Com histórico insuficiente, usa provisoriamente a referência informada de R$ 3.000,00 e mostra a faixa de R$ 2.500,00 a R$ 3.500,00. A gasolina considera apenas meses com lançamentos dessa categoria e é identificada como provisória quando faltam dados. O cálculo reserva primeiro as contas e necessidades observadas, usando 55% da renda como referência mínima para essenciais, depois até 10% para segurança, até 25% para guardar e até 10% para gastos não essenciais. Essas proporções diminuem quando os recursos não cobrem as reservas. A renda estimada é uma projeção, nunca é adicionada ao saldo bancário atual; dinheiro guardado não é usado para financiar despesas. Planos futuros podem ser atualizados enquanto forem projeções; o plano do mês em andamento e os fechamentos anteriores ficam preservados. Meses antigos sem um plano salvo são identificados como reconstruídos com os dados atualmente disponíveis. Transferências para o saldo guardado são exibidas separadamente e não contam como renda, gasto ou crescimento patrimonial.

Categorias personalizadas são gravadas no mesmo `localStorage` e incluídas automaticamente em backups. As categorias padrão não podem ser duplicadas; as personalizadas têm nome, tipo, ícone local e classificação. Alterar a classificação afeta novas sugestões, sem reescrever a classificação já salva nos lançamentos. Categorias de despesa com nome relacionado a gasolina/combustível/abastecimento ou com o ícone de combustível entram na estimativa de gasolina quando classificadas como essenciais variáveis. Ao renomear uma categoria em uso, o nome anterior é mantido como categoria arquivada para preservar relatórios históricos. Ao excluir uma categoria usada, é possível mantê-la arquivada ou reclassificar seus registros para outra categoria; valores e datas dos registros não são alterados. Ícones usam caracteres Unicode incluídos no aplicativo, sem dependências externas.
