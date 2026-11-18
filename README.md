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
- Patrimônio acumulado do mês selecionado, somando saldo bancário, dinheiro guardado e reserva da moto sem duplicar transferências internas.
- Saldo bancário calculado com o saldo inicial e lançamentos a partir da data de referência.
- Fechamento histórico por mês, com aviso quando a referência do saldo ou o histórico do dinheiro guardado não permitem um cálculo confiável.
- Histórico datado do dinheiro guardado para calcular totais de períodos anteriores sem presumir valores.
- Edição de lançamentos sem duplicar registros, além da exclusão.
- Contas a pagar não recorrentes, fixas mensais e parceladas; só viram despesa quando marcadas como pagas. O resumo mensal mostra o total previsto, quanto já foi pago e o saldo em aberto. Ao cancelar uma conta fixa, é possível cancelar somente o mês selecionado ou esse mês e os seguintes; ocorrências anteriores e pagamentos registrados são preservados.
- Edição de contas pagas sincronizada com a despesa registrada; excluir uma conta paga também remove a despesa vinculada.
- Edição de um lançamento vinculado mantém a conta sincronizada; excluir seu pagamento devolve a conta ao estado pendente para evitar uma conta marcada como paga sem despesa.
- Edição de uma ocorrência fixa ou de toda a série futura, cancelamento sem apagar pagamentos e parcelas com vencimentos e pagamentos independentes.
- Parcelas com distribuição de centavos para que a soma corresponda exatamente ao valor total da compra.
- Transferências datadas entre conta bancária, dinheiro guardado e reserva da moto; aparecem no histórico, não contam como ganhos/gastos e mantêm o patrimônio total.
- Reserva da moto com saldo e histórico próprios, meta mensal de contribuição de 5%, depósitos/retiradas entre saldos e registro de manutenção pago diretamente pela reserva.
- Contas a pagar podem ser marcadas como pagas pela conta bancária ou pela reserva da moto, mantendo a origem do dinheiro registrada.
- Manutenções pagas pela reserva da moto continuam no histórico de despesas, mas reduzem apenas a caixinha; saldo negativo exige confirmação explícita.
- Controles independentes para ocultar valores financeiros.
- Resumo mensal de ganhos e gastos, com o dinheiro guardado mantido separado do saldo bancário.
- Comparação visual do mês selecionado com o anterior e diferença percentual.
- Comparação de patrimônio acumulado entre períodos e média de crescimento baseada em fechamentos mensais confiáveis.
- Médias dos meses anteriores disponíveis (sem incluir o mês atual) e alertas de tendência.
- Limite mensal de gastos opcional e editável.
- Orçamento mensal dividido em 45% para contas essenciais, 20% para gastos livres, 30% para guardar e 5% para a reserva da moto, calculado sobre a renda recebida.
- Cada grupo mostra valores planejados, utilizados, comprometidos e disponíveis; o fechamento resume receitas, despesas, economia efetivamente reservada e variação patrimonial.
- Projeção do próximo mês nas mesmas quatro divisões, considerando receitas previstas, despesas cadastradas, contas pendentes e saldo bancário atual sem misturá-lo ao dinheiro guardado.
- Indicador de saúde financeira de 0 a 100, com classificação, recomendação e aviso quando os dados não permitem avaliar todos os critérios. A reserva da moto considera o saldo real, as contribuições do mês e o saldo após manutenções. A avaliação usa o mês atual, mesmo durante a consulta de outros períodos.
- Classificação padrão configurável para categorias de despesa (incluindo categorias personalizadas) e ajuste individual em cada lançamento. Alimentação e gasolina podem ser divididas entre grupos conforme o contexto.
- Categorias personalizadas de receita e despesa, com biblioteca de ícones local pesquisável e classificação financeira integrada ao planejamento.
- Gerenciamento de categorias com edição, arquivamento do histórico ou reclassificação confirmada de lançamentos, contas e recorrências.
- Navegação entre meses anteriores e próximos.
- Lista de lançamentos com edição de valor, tipo, categoria, data e observação, além da exclusão.
- Histórico de lançamentos e transferências com rolagem própria para até seis registros visíveis.
- Metas financeiras com versões mensais persistentes de nome e valor desejado, progresso automático pelo patrimônio do mês selecionado e controle independente para ocultar os valores.
- Gráfico de barras por categoria (proporção dos gastos do mês).
- Backup em arquivo JSON e restauração. A opção “Analisar com ChatGPT” baixa os mesmos dados financeiros, acrescenta o mês de referência e os percentuais do orçamento, e mantém compatibilidade com a restauração; o arquivo não é enviado automaticamente a nenhum serviço.
- Interface responsiva, tema claro lilás e funcionamento offline após primeiro carregamento.

## Importante sobre os dados

Os dados ficam no armazenamento local do navegador (`localStorage`) deste aparelho e deste navegador. Lançamentos e dinheiro guardado existentes são preservados; saldo inicial, data de referência, contas, transferências, histórico e preferências também ficam salvos. A nova reserva da moto começa sem valores registrados e só aumenta ou diminui por transferências e manutenções lançadas. Transferências podem ser editadas ou excluídas e são aplicadas aos fechamentos conforme a data registrada, sem alterar ganhos, gastos ou patrimônio total. O app confere o saldo disponível antes de cada operação e impede uma edição ou exclusão que deixaria uma transferência posterior sem cobertura. Transferências retroativas exigem que os históricos dos saldos envolvidos permitam validar a movimentação na data informada. Em dados antigos sem data de referência confirmada, o saldo atual continua calculado como antes, mas fechamentos históricos ficam indisponíveis até confirmar essa data. O histórico de dinheiro guardado começa na data registrada; totais anteriores sem registro são indicados como indisponíveis. Se os dados salvos estiverem ilegíveis, o app mostra um aviso e preserva o conteúdo original em uma chave local de recuperação. Limpar os dados do navegador pode apagá-los. Faça backup regularmente pelo botão no topo. Backups antigos continuam podendo ser restaurados. Para usar em mais de um aparelho com sincronização automática, será necessário adicionar uma conta e um banco de dados na nuvem em uma próxima versão.

O visual usa tema claro lilás, com fundo em gradiente e sem imagem de fundo.

## Estrutura

- `index.html`: telas e estrutura.
- `styles.css`: visual e responsividade.
- `app.js`: cálculos e armazenamento.
- `manifest.webmanifest`: configuração instalável.
- `sw.js`: cache para funcionamento offline.
- `icons/icon.svg`: ícone do app.

O orçamento mensal é calculado diretamente com os ganhos registrados no mês. A distribuição 45%/20%/30%/5% soma 100%, inclusive com arredondamento em centavos. Para períodos futuros, a renda registrada para o mês é usada quando disponível; caso contrário, a projeção usa os três meses completos mais recentes e fica identificada como provisória se o histórico for insuficiente. Despesas futuras registradas e contas não pagas reduzem o disponível do grupo correspondente. O saldo bancário real, o dinheiro guardado, a reserva da moto e os valores comprometidos são apresentados separadamente; o app não realiza transferências nem movimentações automáticas.

Transferências antigas entre banco e dinheiro guardado continuam válidas. As novas transferências identificam origem e destino entre as três carteiras; manutenção paga pela reserva é registrada como despesa normal, mas debitada somente da carteira da moto. Uma retirada ou manutenção que gere saldo negativo na reserva requer confirmação.

O fechamento considera como economia efetiva somente a variação real registrada no dinheiro guardado; a meta de 30% é apenas uma meta, não um valor automaticamente poupado. O crescimento ou a redução patrimonial é calculado pela diferença entre os fechamentos confiáveis de saldo bancário e dinheiro guardado. Quando os históricos não cobrem o início e o fim do mês, a variação patrimonial é indicada como indisponível em vez de presumida.

O indicador de saúde financeira pondera contas essenciais (20%), gastos livres (15%), meta de guardar (20%), reserva da moto (10%), variação patrimonial (15%) e cobertura das contas cadastradas para o próximo mês (20%). A nota da moto considera as contribuições efetivamente transferidas no mês e o saldo atual da caixinha em relação à meta mensal de 5%; manutenções reduzem o saldo e ficam discriminadas. Critérios sem dados confiáveis ficam fora da média e são identificados como avaliação parcial; com menos de 50% dos pesos avaliáveis, a pontuação fica indisponível. Avaliações parciais também limitam a classificação. A cobertura futura usa a renda registrada ou uma projeção confiável; sem isso, só é avaliada quando o saldo bancário atual, sozinho, já cobre as contas cadastradas. Contas essenciais vencidas, falta relevante de recursos para compromissos próximos, reduções patrimoniais significativas e desvios expressivos da meta de economia ou dos limites livres e da moto impedem notas excelentes.

Categorias personalizadas e a classificação padrão das categorias ficam no mesmo `localStorage` e são incluídas automaticamente em backups. A classificação padrão afeta novos lançamentos; os grupos já salvos em lançamentos existentes permanecem preservados. Cada despesa também permite escolher um grupo individualmente, por exemplo para separar gasolina de trabalho de outro uso ou alimentação essencial de lazer. Ao renomear uma categoria em uso, o nome anterior é mantido como categoria arquivada para preservar relatórios históricos. Ao excluir uma categoria usada, é possível mantê-la arquivada ou reclassificar seus registros para outra categoria; valores e datas dos registros não são alterados. Ícones usam caracteres Unicode incluídos no aplicativo, sem dependências externas.
