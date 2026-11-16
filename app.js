const $ = id => document.getElementById(id);
const STORAGE_KEY = "meu-controle-financeiro-v1";
const expenseCategories = ["Alimentação","Gasolina","Contas","Moradia","Mercado","Saúde","Lazer","Compras","Transporte","Outros"];
const incomeCategories = ["Trabalho","Entregas","Serviços","Venda","Presente","Outros"];
const expenseGroups = ["fixed","necessary","nonessential"];
const expenseGroupLabels = {fixed:"Gasto fixo",necessary:"Variável necessário",nonessential:"Não essencial"};
const icons = {"Alimentação":"🍽️","Gasolina":"⛽","Contas":"🧾","Moradia":"🏠","Mercado":"🛒","Saúde":"💊","Lazer":"🎮","Compras":"🛍️","Transporte":"🚌","Outros":"📌","Trabalho":"💼","Entregas":"🛵","Serviços":"🧰","Venda":"💰","Presente":"🎁"};
const iconLibrary=[
  {icon:"🍽️",name:"prato refeição restaurante",topic:"Alimentação"},
  {icon:"🍔",name:"hambúrguer lanche",topic:"Alimentação"},
  {icon:"🥗",name:"salada comida",topic:"Alimentação"},
  {icon:"🍕",name:"pizza",topic:"Alimentação"},
  {icon:"🥪",name:"sanduíche",topic:"Alimentação"},
  {icon:"🏠",name:"casa moradia",topic:"Casa"},
  {icon:"🛋️",name:"sofá móveis",topic:"Casa"},
  {icon:"🧹",name:"limpeza",topic:"Casa"},
  {icon:"🪴",name:"planta jardim",topic:"Casa"},
  {icon:"🧾",name:"conta boleto",topic:"Contas"},
  {icon:"💡",name:"luz energia",topic:"Contas"},
  {icon:"💧",name:"água",topic:"Contas"},
  {icon:"📶",name:"internet wi-fi",topic:"Contas"},
  {icon:"🚌",name:"ônibus",topic:"Transporte"},
  {icon:"🚗",name:"carro",topic:"Transporte"},
  {icon:"🚲",name:"bicicleta",topic:"Transporte"},
  {icon:"🚆",name:"trem metrô",topic:"Transporte"},
  {icon:"🏍️",name:"moto motocicleta",topic:"Motocicleta"},
  {icon:"🛵",name:"scooter entrega",topic:"Motocicleta"},
  {icon:"⛽",name:"gasolina combustível",topic:"Motocicleta"},
  {icon:"🔧",name:"ferramenta manutenção",topic:"Motocicleta"},
  {icon:"💼",name:"maleta emprego",topic:"Trabalho"},
  {icon:"🧰",name:"ferramentas serviço",topic:"Trabalho"},
  {icon:"📦",name:"caixa entrega",topic:"Trabalho"},
  {icon:"💊",name:"remédio farmácia",topic:"Saúde"},
  {icon:"🏥",name:"hospital clínica",topic:"Saúde"},
  {icon:"🩺",name:"médico",topic:"Saúde"},
  {icon:"🛒",name:"carrinho mercado compras",topic:"Compras"},
  {icon:"🛍️",name:"sacolas loja",topic:"Compras"},
  {icon:"👕",name:"roupa",topic:"Compras"},
  {icon:"🎮",name:"videogame jogos",topic:"Lazer"},
  {icon:"🎬",name:"cinema filme",topic:"Lazer"},
  {icon:"🎵",name:"música",topic:"Lazer"},
  {icon:"⚽",name:"futebol esporte",topic:"Lazer"},
  {icon:"💻",name:"computador notebook",topic:"Tecnologia"},
  {icon:"📱",name:"celular telefone",topic:"Tecnologia"},
  {icon:"🎧",name:"fone áudio",topic:"Tecnologia"},
  {icon:"📚",name:"livros leitura",topic:"Educação"},
  {icon:"🎓",name:"formatura curso",topic:"Educação"},
  {icon:"✏️",name:"lápis material",topic:"Educação"},
  {icon:"💰",name:"dinheiro moedas",topic:"Dinheiro"},
  {icon:"📌",name:"marcador outros",topic:"Dinheiro"},
  {icon:"💵",name:"dinheiro cédulas",topic:"Dinheiro"},
  {icon:"🏦",name:"banco",topic:"Dinheiro"},
  {icon:"💳",name:"cartão",topic:"Dinheiro"},
  {icon:"📈",name:"gráfico investimento",topic:"Dinheiro"}
];
const money = value => Number(value || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const todayISO = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const monthKey = date => date.slice(0,7);
let storageWarning = "";
let state = null;
let selectedMonth = monthKey(todayISO());
let pendingDelete = null;
let editEntryId = null;
let editTransferId = null;
let editBillId = null;
let pendingBillPaymentId = null;
let pendingBillDeleteId = null;
let pendingBillCancelSeriesId = null;
let pendingBillCancelMonth = null;
let editGoalId = null;
let pendingGoalDeleteId = null;
let editCategoryId = null;
let pendingCategoryDeleteId = null;
let selectedCategoryIcon = "📌";
let categoryReturnToEntry = false;
state = loadState();

function loadState(){
  let parsed,raw=null;
  try {
    raw=localStorage.getItem(STORAGE_KEY);
    parsed=raw===null?null:JSON.parse(raw);
  } catch(error) {
    const recoveryError=preserveInvalidStorage(raw);
    storageWarning=`Não foi possível ler os dados financeiros salvos. ${recoveryError||"O conteúdo original foi preservado em uma cópia local; restaure um backup válido para continuar."}`;
  }
  if(raw!==null&&(!parsed||!Array.isArray(parsed.entries))&&!storageWarning){
    const recoveryError=preserveInvalidStorage(raw);
    storageWarning=`Os dados salvos não têm um formato reconhecido. ${recoveryError||"O conteúdo original foi preservado em uma cópia local; restaure um backup válido para continuar."}`;
  }
  if(parsed&&Array.isArray(parsed.entries)){
    const normalized=normalizeState(parsed);
    const needsMigration=!isValidISODate(parsed.balanceReferenceDate)||typeof parsed.balanceReferenceConfirmed!=="boolean"
      ||!Array.isArray(parsed.savingsHistory)||!Array.isArray(parsed.bills)
      ||!Array.isArray(parsed.transfers)
      ||!Array.isArray(parsed.billSeries)
      ||!Array.isArray(parsed.goals)
      ||!Array.isArray(parsed.customCategories)
      ||!parsed.smartBudgets||typeof parsed.smartBudgets!=="object"||Array.isArray(parsed.smartBudgets)
      ||!parsed.financialPlans||typeof parsed.financialPlans!=="object"||Array.isArray(parsed.financialPlans)
      ||(Array.isArray(parsed.entries)&&parsed.entries.some(entry=>entry&&entry.type==="expense"&&!expenseGroups.includes(entry.expenseGroup)))
      ||(Array.isArray(parsed.goals)&&parsed.goals.some(goal=>!goal||!Array.isArray(goal.versions)||Object.prototype.hasOwnProperty.call(goal,"currentAmount")))
      ||(Array.isArray(parsed.bills)&&parsed.bills.some(bill=>bill&&bill.recurringMonthly&&(!bill.seriesId||!bill.occurrenceKey)))
      ||(Array.isArray(parsed.savingsHistory)&&parsed.savingsHistory.some(item=>!item||!Number.isFinite(Number(item.recordedAt))||!item.includedTransfers||typeof item.includedTransfers!=="object"))
      ||!parsed.hiddenValues||typeof parsed.hiddenValues!=="object";
    if(needsMigration)localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized));
    return normalized;
  }
  return normalizeState({entries:[],savings:0,initialBalance:0,monthlyLimit:null});
}
function preserveInvalidStorage(raw){
  try{
    const recoveryKey=`${STORAGE_KEY}-recovery`;
    if(localStorage.getItem(recoveryKey)===null)localStorage.setItem(recoveryKey,raw);
    return "";
  }catch(error){
    return `Não foi possível criar a cópia local de recuperação (${error.message}).`;
  }
}
function isValidISODate(value){
  if(typeof value!=="string"||! /^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [year,month,day]=value.split("-").map(Number),date=new Date(Date.UTC(year,month-1,day));
  return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day;
}
function isValidMonthKey(value){
  return typeof value==="string"&&/^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}
function categoryNameKey(name){
  return String(name||"").trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
}
function normalizeCustomCategories(categories){
  const names=new Set([...expenseCategories,...incomeCategories].map(categoryNameKey)),ids=new Set(),normalized=[];
  if(!Array.isArray(categories))return normalized;
  categories.forEach(category=>{
    if(!category||typeof category!=="object"||!["income","expense"].includes(category.type))return;
    const name=String(category.name||"").trim().slice(0,40),key=categoryNameKey(name);
    if(!name||names.has(key))return;
    const id=category.id===undefined?makeId():String(category.id);
    if(!id||ids.has(id))return;
    const icon=iconLibrary.some(item=>item.icon===category.icon)?category.icon:"📌";
    const expenseGroup=category.type==="expense"&&expenseGroups.includes(category.expenseGroup)
      ?category.expenseGroup:category.type==="expense"?"nonessential":null;
    normalized.push({id,name,type:category.type,icon,expenseGroup,active:category.active!==false,archived:Boolean(category.archived)});
    names.add(key);ids.add(id);
  });
  return normalized;
}
function defaultExpenseGroup(category,customCategories=state?state.customCategories:[]){
  const custom=customCategories.find(item=>item.type==="expense"&&item.name===category);
  if(custom)return custom.expenseGroup;
  if(["Contas","Moradia"].includes(category))return "fixed";
  if(["Gasolina","Mercado","Saúde","Transporte"].includes(category))return "necessary";
  return "nonessential";
}
function categoryIcon(name){
  const custom=state&&state.customCategories.find(item=>item.name===name);
  return custom?custom.icon:icons[name]||"📌";
}
function isGasolineCategory(name){
  const normalized=categoryNameKey(name);
  return normalized.includes("gasolina")||normalized.includes("combustivel")
    ||normalized.includes("abastecimento")||normalized.includes("fuel")
    ||state.customCategories.some(item=>item.type==="expense"&&item.name===name&&item.icon==="⛽");
}
function categoriesForType(type,selectedName=""){
  const builtins=(type==="income"?incomeCategories:expenseCategories).map(name=>({name,icon:icons[name]||"📌"}));
  const custom=state.customCategories.filter(item=>item.type===type&&(item.active||item.name===selectedName));
  const list=[...builtins,...custom.map(item=>({name:item.name,icon:item.icon}))];
  if(selectedName&&!list.some(item=>item.name===selectedName)){
    const archived=state.customCategories.find(item=>item.type===type&&item.name===selectedName);
    if(archived)list.push({name:archived.name,icon:archived.icon});
  }
  return list;
}
function categoryReferences(category){
  const entries=state.entries.filter(entry=>entry.type===category.type&&entry.category===category.name);
  const bills=category.type==="expense"?state.bills.filter(bill=>bill.category===category.name):[];
  const series=category.type==="expense"?state.billSeries.filter(item=>item.category===category.name):[];
  return {entries,bills,series,total:entries.length+bills.length+series.length};
}
function categoryNameExists(name,excludeId=null){
  const key=categoryNameKey(name);
  return [...expenseCategories,...incomeCategories].some(item=>categoryNameKey(item)===key)
    ||state.customCategories.some(item=>item.id!==excludeId&&categoryNameKey(item.name)===key);
}
function normalizeState(data){
  const customCategories=normalizeCustomCategories(data.customCategories);
  const entries=data.entries.map(entry=>{
    if(!entry||typeof entry!=="object")return entry;
    return {...entry,expenseGroup:entry.type==="expense"
      ?expenseGroups.includes(entry.expenseGroup)?entry.expenseGroup:defaultExpenseGroup(entry.category,customCategories)
      :null};
  });
  const savings=Number.isFinite(Number(data.savings))&&Number(data.savings)>=0?Number(data.savings):0;
  const earliestEntry=entries.map(entry=>entry&&entry.date).filter(isValidISODate).sort()[0];
  const hasBalanceDate=isValidISODate(data.balanceReferenceDate);
  const balanceReferenceDate=hasBalanceDate?data.balanceReferenceDate:(earliestEntry||todayISO());
  const transferIds=new Set(),transfers=[];
  if(Array.isArray(data.transfers))data.transfers.forEach(item=>{
    const id=item&&item.id!==undefined?String(item.id):"";
    const amount=Number(item&&item.amount);
    if(!id||transferIds.has(id)||!["save","withdraw"].includes(item.direction)||!isValidISODate(item.date)||!Number.isFinite(amount)||amount<=0)return;
    transferIds.add(id);
    transfers.push({id,direction:item.direction,amount:Math.round(amount*100)/100,date:item.date,description:String(item.description||""),createdAt:Number.isFinite(Number(item.createdAt))?Number(item.createdAt):0});
  });
  const savingsHistory=Array.isArray(data.savingsHistory)
    ?data.savingsHistory.filter(item=>item&&isValidISODate(item.date)&&Number.isFinite(Number(item.amount))&&Number(item.amount)>=0).map(item=>({
      date:item.date,amount:Math.round(Number(item.amount)*100)/100,
      recordedAt:Number.isFinite(Number(item.recordedAt))?Number(item.recordedAt):0,
      includedTransfers:item.includedTransfers&&typeof item.includedTransfers==="object"&&!Array.isArray(item.includedTransfers)
        ?Object.fromEntries(Object.entries(item.includedTransfers).filter(([id,value])=>id&&Number.isFinite(Number(value))).map(([id,value])=>[id,Number(value)]))
        :{}
    }))
    :[{date:todayISO(),amount:savings,recordedAt:0,includedTransfers:{}}];
  if(!savingsHistory.length)savingsHistory.push({date:todayISO(),amount:savings,recordedAt:0,includedTransfers:{}});
  const latestSavings=savingsHistory.filter(item=>item.date<=todayISO()).sort((a,b)=>a.date.localeCompare(b.date)||a.recordedAt-b.recordedAt).pop();
  const goalIds=new Set(),goals=[];
  if(Array.isArray(data.goals))data.goals.forEach(goal=>{
    if(!goal||typeof goal!=="object")return;
    const id=goal&&goal.id!==undefined?String(goal.id):makeId();
    if(!id||goalIds.has(id))return;
    const versionsByMonth=new Map();
    if(Array.isArray(goal.versions))goal.versions.forEach(version=>{
      if(!version||!(version.month===null||isValidMonthKey(version.month)))return;
      const name=String(version.name||"").trim(),targetAmount=Number(version.targetAmount);
      if(!name||!Number.isFinite(targetAmount)||targetAmount<=0)return;
      const month=version.month===null?null:version.month;
      versionsByMonth.set(month===null?"":month,{month,name,targetAmount:roundMoney(targetAmount)});
    });
    let versions=[...versionsByMonth.values()].sort((a,b)=>{
      if(a.month===null)return b.month===null?0:-1;
      if(b.month===null)return 1;
      return a.month.localeCompare(b.month);
    });
    const legacyName=String(goal.name||"").trim(),legacyTarget=Number(goal.targetAmount);
    if(!versions.length&&legacyName&&Number.isFinite(legacyTarget)&&legacyTarget>0)
      versions=[{month:null,name:legacyName,targetAmount:roundMoney(legacyTarget)}];
    if(!versions.length)return;
    goalIds.add(id);
    goals.push({id,versions});
  });
  const bills=(Array.isArray(data.bills)?data.bills:[]).filter(bill=>bill&&typeof bill==="object").map(bill=>{
    const id=bill.id===undefined?makeId():String(bill.id);
    const legacyFixed=Boolean(bill.recurringMonthly);
    const seriesId=bill.seriesId!==undefined&&bill.seriesId!==null?String(bill.seriesId):(legacyFixed?String(bill.recurringGroupId||id):null);
    const seriesKind=["fixed","installment"].includes(bill.seriesKind)?bill.seriesKind:(legacyFixed?"fixed":null);
    const occurrenceKey=bill.occurrenceKey||(
      seriesKind==="fixed"&&isValidISODate(bill.dueDate)?monthKey(bill.dueDate)
      :seriesKind==="installment"?String(bill.installmentNumber||"")
      :null
    );
    return {
      ...bill,id,amount:Number(bill.amount)||0,
      seriesId,seriesKind,occurrenceKey,
      recurringMonthly:seriesKind==="fixed"||legacyFixed,
      recurringGroupId:seriesKind==="fixed"?String(bill.recurringGroupId||seriesId):bill.recurringGroupId||null,
      recurringDay:seriesKind==="fixed"?Number(bill.recurringDay)||Number((bill.dueDate||"").slice(8,10))||1:null,
      status:bill.status||"pending"
    };
  });
  entries.forEach(entry=>{
    if(!entry||entry.type!=="expense")return;
    const linkedBill=bills.find(bill=>String(bill.id)===String(entry.sourceBillId)
      ||String(bill.paymentEntryId)===String(entry.id));
    if(linkedBill&&linkedBill.seriesKind==="fixed")entry.expenseGroup="fixed";
  });
  const billSeries=Array.isArray(data.billSeries)?data.billSeries.filter(series=>series&&series.id&&["fixed","installment"].includes(series.kind)).map(series=>({
    ...series,id:String(series.id),active:series.active!==false,
    frequency:["monthly","biweekly","weekly"].includes(series.frequency)?series.frequency:"monthly",
    dueDay:Number(series.dueDay)||1,
    installmentCount:Math.max(1,Number(series.installmentCount)||1)
  })):[];
  const smartBudgets={};
  if(data.smartBudgets&&typeof data.smartBudgets==="object"&&!Array.isArray(data.smartBudgets)){
    Object.entries(data.smartBudgets).forEach(([month,budget])=>{
      if(!isValidMonthKey(month)||!budget||typeof budget!=="object")return;
      const recommended=Number(budget.recommended);
      if(!Number.isFinite(recommended)||recommended<0)return;
      const manual=budget.manualLimit===null||budget.manualLimit===undefined||budget.manualLimit===""
        ?null:Number(budget.manualLimit);
      if(manual!==null&&(!Number.isFinite(manual)||manual<0))return;
      smartBudgets[month]={
        recommended:roundMoney(recommended),
        manualLimit:manual===null?null:roundMoney(manual),
        safetyReserve:Number.isFinite(Number(budget.safetyReserve))&&Number(budget.safetyReserve)>=0
          ?roundMoney(budget.safetyReserve):0,
        formulaVersion:Number(budget.formulaVersion)||1,
        provisional:Boolean(budget.provisional),
        calculatedAt:isValidISODate(budget.calculatedAt)?budget.calculatedAt:null,
        basis:budget.basis&&typeof budget.basis==="object"&&!Array.isArray(budget.basis)?budget.basis:null
      };
    });
  }
  const financialPlans={};
  if(data.financialPlans&&typeof data.financialPlans==="object"&&!Array.isArray(data.financialPlans)){
    const storedAmount=(value,allowNegative=false)=>{
      const amount=Number(value);
      return Number.isFinite(amount)&&(allowNegative||amount>=0)?roundMoney(amount):0;
    };
    Object.entries(data.financialPlans).forEach(([month,plan])=>{
      if(!isValidMonthKey(month)||!plan||typeof plan!=="object"
        ||!plan.inputs||typeof plan.inputs!=="object"
        ||!plan.recommendations||typeof plan.recommendations!=="object")return;
      const input=plan.inputs,recommendation=plan.recommendations;
      const nullableAmount=value=>value===null||value===undefined||value===""?null:storedAmount(value);
      financialPlans[month]={
        version:1,
        status:["projection","final","reconstructed"].includes(plan.status)?plan.status:"reconstructed",
        capturedAt:isValidISODate(plan.capturedAt)?plan.capturedAt:null,
        inputs:{
          openingBank:nullableAmount(input.openingBank),
          openingSavings:nullableAmount(input.openingSavings),
          incomeEstimate:storedAmount(input.incomeEstimate),
          incomeMethod:["history","reference"].includes(input.incomeMethod)?input.incomeMethod:"reference",
          incomeHistoryMonths:Array.isArray(input.incomeHistoryMonths)?input.incomeHistoryMonths.filter(isValidMonthKey).slice(-3):[],
          earningDays:storedAmount(input.earningDays),
          dailyIncomeAverage:storedAmount(input.dailyIncomeAverage),
          averageEarningDays:storedAmount(input.averageEarningDays),
          incomeTrend:["increasing","decreasing","stable","unknown"].includes(input.incomeTrend)?input.incomeTrend:"unknown",
          incomeTrendAdjustment:storedAmount(input.incomeTrendAdjustment,true),
          historyCount:storedAmount(input.historyCount),
          essentialMonths:storedAmount(input.essentialMonths),
          gasAverage:storedAmount(input.gasAverage),
          gasMonths:storedAmount(input.gasMonths),
          averageFixed:storedAmount(input.averageFixed),
          fixedBills:storedAmount(input.fixedBills),
          averageNecessary:storedAmount(input.averageNecessary),
          provisional:Boolean(input.provisional),
          futureOpeningBalance:Boolean(input.futureOpeningBalance)
        },
        recommendations:{
          resources:storedAmount(recommendation.resources),
          fixedReserve:storedAmount(recommendation.fixedReserve),
          necessaryReserve:storedAmount(recommendation.necessaryReserve),
          gasolineReserve:storedAmount(recommendation.gasolineReserve),
          essentialReserve:storedAmount(recommendation.essentialReserve),
          safetyReserve:storedAmount(recommendation.safetyReserve),
          savingsRecommended:storedAmount(recommendation.savingsRecommended),
          nonessentialLimit:storedAmount(recommendation.nonessentialLimit),
          expectedBankEnd:nullableAmount(recommendation.expectedBankEnd),
          expectedSavingsEnd:nullableAmount(recommendation.expectedSavingsEnd),
          expectedPatrimonyGrowth:storedAmount(recommendation.expectedPatrimonyGrowth,true),
          expectedPatrimonyEnd:nullableAmount(recommendation.expectedPatrimonyEnd),
          unallocatedRemainder:storedAmount(recommendation.unallocatedRemainder)
        }
      };
    });
  }
  const seriesIds=new Set(billSeries.map(series=>series.id));
  bills.forEach(bill=>{
    if(!bill.seriesId||seriesIds.has(String(bill.seriesId)))return;
    const id=String(bill.seriesId),group=bills.filter(item=>String(item.seriesId)===id).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
    const first=group[0],last=group[group.length-1];
    if(bill.seriesKind==="fixed"){
      const dueDay=first.recurringDay||Number(first.dueDate.slice(8,10));
      const scheduleAfter=monthKey(last.dueDate)>monthKey(todayISO())?monthKey(last.dueDate):monthKey(todayISO());
      billSeries.push({
        id,kind:"fixed",name:first.name,amount:first.amount,category:first.category,
        description:first.description||"",startDate:dateForMonthDay(monthAfter(scheduleAfter,1),dueDay),
        dueDay,frequency:"monthly",active:true
      });
    }else if(bill.seriesKind==="installment"){
      billSeries.push({
        id,kind:"installment",name:first.name,totalAmount:group.reduce((sum,item)=>sum+item.amount,0),
        category:first.category,description:first.description||"",firstDueDate:first.dueDate,
        installmentCount:first.installmentCount||group.length,frequency:first.frequency||"monthly",active:true
      });
    }
    seriesIds.add(id);
  });
  const normalized={
    entries,
    savings:latestSavings?latestSavings.amount:savings,
    savingsHistory,
    transfers,
    bills,
    billSeries,
    goals,
    customCategories,
    smartBudgets,
    financialPlans,
    initialBalance:Number.isFinite(Number(data.initialBalance))?Number(data.initialBalance):0,
    balanceReferenceDate,
    balanceReferenceConfirmed:hasBalanceDate&&data.balanceReferenceConfirmed!==false,
    monthlyLimit:data.monthlyLimit===null||data.monthlyLimit===undefined?null:(Number(data.monthlyLimit)>=0?Number(data.monthlyLimit):null),
    hiddenValues:data.hiddenValues&&typeof data.hiddenValues==="object"&&!Array.isArray(data.hiddenValues)
      ?Object.fromEntries(Object.entries(data.hiddenValues).map(([key,value])=>[key,Boolean(value)]))
      :{}
  };
  const currentSavings=savingsAt(todayISO(),normalized);
  if(currentSavings!==null)normalized.savings=currentSavings;
  return normalized;
}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function makeId(){return crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());}
function monthEntries(){return state.entries.filter(e=>monthKey(e.date)===selectedMonth);}
function monthTotals(key){
  const entries=state.entries.filter(e=>monthKey(e.date)===key);
  return {
    income:entries.filter(e=>e.type==="income").reduce((sum,e)=>sum+(Number(e.amount)||0),0),
    expense:entries.filter(e=>e.type==="expense").reduce((sum,e)=>sum+(Number(e.amount)||0),0),
    expenses:entries.filter(e=>e.type==="expense").length
  };
}
function formatMonth(key){const [y,m]=key.split("-").map(Number);return new Date(y,m-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});}
function previousMonth(key){const [y,m]=key.split("-").map(Number);const d=new Date(y,m-2,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;}
function endOfMonth(key){
  const [year,month]=key.split("-").map(Number);
  return `${year}-${String(month).padStart(2,"0")}-${String(new Date(year,month,0).getDate()).padStart(2,"0")}`;
}
function formatISODate(date){return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");}
function roundMoney(value){return Math.round((Number(value)||0)*100)/100;}
function transferBankDelta(transfer){return transfer.direction==="save"?-Number(transfer.amount):Number(transfer.amount);}
function transferSavingsDelta(transfer){return transfer.direction==="save"?Number(transfer.amount):-Number(transfer.amount);}
function eventBefore(date,createdAt,targetDate,targetCreatedAt){
  return date<targetDate||(date===targetDate&&(Number(createdAt)||0)<targetCreatedAt);
}
function nextRecordTime(){
  const times=[
    ...state.entries.map(item=>Number(item.createdAt)||0),
    ...state.transfers.map(item=>Number(item.createdAt)||0),
    ...state.savingsHistory.map(item=>Number(item.recordedAt)||0)
  ];
  return Math.max(Date.now(),...times.map(time=>time+1));
}
function accountBalanceAt(cutoffDate,transferList=state.transfers){
  if(cutoffDate<state.balanceReferenceDate)return null;
  const entriesTotal=state.entries.reduce((sum,entry)=>{
    if(!isValidISODate(entry.date)||entry.date<state.balanceReferenceDate||entry.date>cutoffDate)return sum;
    return sum+(entry.type==="income"?1:entry.type==="expense"?-1:0)*(Number(entry.amount)||0);
  },0);
  const transferTotal=transferList.filter(transfer=>transfer.date>=state.balanceReferenceDate&&transfer.date<=cutoffDate)
    .reduce((sum,transfer)=>sum+transferBankDelta(transfer),0);
  return roundMoney(state.initialBalance+entriesTotal+transferTotal);
}
function accountBalanceBeforeTransfer(date,createdAt,transferList=state.transfers,excludeId=null){
  if(date<state.balanceReferenceDate)return null;
  let balance=state.initialBalance;
  state.entries.forEach(entry=>{
    if(entry.date>=state.balanceReferenceDate&&eventBefore(entry.date,entry.createdAt,date,createdAt))
      balance+=(entry.type==="income"?1:entry.type==="expense"?-1:0)*(Number(entry.amount)||0);
  });
  transferList.forEach(transfer=>{
    if(String(transfer.id)!==String(excludeId)&&eventBefore(transfer.date,transfer.createdAt,date,createdAt))
      balance+=transferBankDelta(transfer);
  });
  return roundMoney(balance);
}
function savingsAt(date,source=state){
  const snapshots=source.savingsHistory.filter(item=>item.date<=date).sort((a,b)=>a.date.localeCompare(b.date)||a.recordedAt-b.recordedAt);
  if(!snapshots.length)return null;
  const snapshot=snapshots[snapshots.length-1];
  const transferTotal=source.transfers.filter(transfer=>transfer.date<=date).reduce((sum,transfer)=>sum+transferSavingsDelta(transfer),0);
  const includedTotal=Object.values(snapshot.includedTransfers||{}).reduce((sum,amount)=>sum+(Number(amount)||0),0);
  return roundMoney(snapshot.amount+transferTotal-includedTotal);
}
function combinePatrimony(bank,saved){
  return bank===null||saved===null?null:roundMoney(bank+saved);
}
function patrimonyAtDate(date){
  return combinePatrimony(accountBalanceAt(date),savingsAt(date));
}
function savingsBalanceBeforeTransfer(date,createdAt,transferList=state.transfers,excludeId=null,history=state.savingsHistory){
  const snapshots=history.filter(item=>eventBefore(item.date,item.recordedAt,date,createdAt))
    .sort((a,b)=>a.date.localeCompare(b.date)||a.recordedAt-b.recordedAt);
  if(!snapshots.length)return null;
  const snapshot=snapshots[snapshots.length-1],included=snapshot.includedTransfers||{};
  let balance=snapshot.amount-Object.values(included).reduce((sum,amount)=>sum+(Number(amount)||0),0);
  transferList.forEach(transfer=>{
    if(String(transfer.id)!==String(excludeId)&&eventBefore(transfer.date,transfer.createdAt,date,createdAt))
      balance+=transferSavingsDelta(transfer);
  });
  return roundMoney(balance);
}
function transferSequenceError(transfers,history=state.savingsHistory){
  const ordered=transfers.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt-b.createdAt);
  for(const transfer of ordered){
    const bank=accountBalanceBeforeTransfer(transfer.date,transfer.createdAt,transfers,transfer.id);
    const saved=savingsBalanceBeforeTransfer(transfer.date,transfer.createdAt,transfers,transfer.id,history);
    if(bank===null)return `Não é possível validar a transferência de ${formatISODate(transfer.date)}: a data é anterior à referência do saldo bancário.`;
    if(saved===null)return `Não há histórico do dinheiro guardado até ${formatISODate(transfer.date)} para validar a transferência.`;
    if(transfer.direction==="save"&&bank<transfer.amount)
      return `Saldo bancário insuficiente em ${formatISODate(transfer.date)}. Disponível: ${money(bank)}.`;
    if(transfer.direction==="withdraw"&&saved<transfer.amount)
      return `Dinheiro guardado insuficiente em ${formatISODate(transfer.date)}. Disponível: ${money(saved)}.`;
  }
  return "";
}
function displayMoney(key,value){
  if(state.hiddenValues[key])return "R$ ****";
  return value===null?"Indisponível":money(value);
}
function eyeIcon(hidden){
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>${hidden?'<path class="eye-slash" d="m4 4 16 16"/>':""}</svg>`;
}
function eyeButton(key,label){
  const hidden=Boolean(state.hiddenValues[key]);
  return `<button class="eye-toggle${hidden?" is-hidden":""}" type="button" data-eye="${escapeHTML(key)}" aria-label="${hidden?"Mostrar":"Ocultar"} ${escapeHTML(label)}" aria-pressed="${hidden}" title="${hidden?"Mostrar":"Ocultar"} ${escapeHTML(label)}">${eyeIcon(hidden)}</button>`;
}
function historicalAverages(){
  const currentMonth=monthKey(todayISO());
  const availableMonths=[...new Set(state.entries.map(e=>monthKey(e.date)).filter(key=>key<currentMonth))].sort();
  if(!availableMonths.length)return {count:0,income:0,expense:0};
  const totals=availableMonths.map(monthTotals);
  return {
    count:totals.length,
    income:totals.reduce((sum,t)=>sum+t.income,0)/totals.length,
    expense:totals.reduce((sum,t)=>sum+t.expense,0)/totals.length
  };
}
function budgetHistoryMonths(month){
  const latestCompleteMonth=previousMonth(monthKey(todayISO()));
  const monthBeforeBudget=previousMonth(month);
  const throughMonth=monthBeforeBudget<latestCompleteMonth?monthBeforeBudget:latestCompleteMonth;
  return [...new Set(state.entries
    .filter(entry=>entry&&isValidISODate(entry.date)&&monthKey(entry.date)<=throughMonth)
    .map(entry=>monthKey(entry.date)))].sort().slice(-3);
}
function monthlyExpenseTotal(month,predicate){
  return roundMoney(state.entries.filter(entry=>entry&&entry.type==="expense"&&monthKey(entry.date)===month&&predicate(entry))
    .reduce((sum,entry)=>sum+(Number(entry.amount)||0),0));
}
function calculateSmartBudget(month,safetyReserve=0){
  const historyMonths=budgetHistoryMonths(month);
  const historyCount=historyMonths.length;
  const linkedBillEntries=new Set(state.bills.map(bill=>billPaymentEntry(bill)).filter(Boolean).map(entry=>String(entry.id)));
  const averageFixed=historyCount
    ?historyMonths.reduce((sum,key)=>sum+monthlyExpenseTotal(key,entry=>entry.expenseGroup==="fixed"
      &&!entry.sourceBillId&&!linkedBillEntries.has(String(entry.id))),0)/historyCount
    :0;
  const essentialMonths=historyMonths.filter(key=>monthlyExpenseTotal(key,entry=>entry.expenseGroup==="necessary"&&!isGasolineCategory(entry.category))>0);
  const averageNecessary=historyCount
    ?historyMonths.reduce((sum,key)=>sum+monthlyExpenseTotal(key,entry=>entry.expenseGroup==="necessary"&&!isGasolineCategory(entry.category)),0)/historyCount
    :0;
  const fuelMonths=historyMonths.filter(key=>monthlyExpenseTotal(key,entry=>isGasolineCategory(entry.category)
    &&(expenseGroups.includes(entry.expenseGroup)?entry.expenseGroup:defaultExpenseGroup(entry.category))==="necessary")>0);
  const gasAverage=fuelMonths.length
    ?fuelMonths.reduce((sum,key)=>sum+monthlyExpenseTotal(key,entry=>isGasolineCategory(entry.category)
      &&(expenseGroups.includes(entry.expenseGroup)?entry.expenseGroup:defaultExpenseGroup(entry.category))==="necessary"),0)/fuelMonths.length
    :0;
  const monthStart=`${month}-01`,monthEnd=endOfMonth(month);
  const billCommitments=roundMoney(state.bills
    .filter(bill=>{
      if(bill.cancelled||bill.dueDate>monthEnd)return false;
      const payment=billPaymentEntry(bill),paidDate=bill.paidAt||(payment&&payment.date);
      return !paidDate||paidDate>=monthStart;
    })
    .reduce((sum,bill)=>sum+(Number(bill.amount)||0),0));
  const fixedEstimate=roundMoney(averageFixed+billCommitments);
  const essentialEstimate=roundMoney(averageNecessary+gasAverage);
  const configuredSafetyReserve=roundMoney(Math.max(0,Number(safetyReserve)||0));
  const currentMonth=monthKey(todayISO()),futureMonth=month>currentMonth;
  const balanceDate=futureMonth?todayISO():endOfMonth(previousMonth(month));
  const balanceReliable=state.balanceReferenceConfirmed&&balanceDate>=state.balanceReferenceDate;
  const openingBank=balanceReliable?accountBalanceAt(balanceDate):null;
  const openingSavings=savingsAt(balanceDate);
  const reliableRecurringIncome=0;
  const costHistoryAvailable=essentialMonths.length>0&&fuelMonths.length>0;
  const freeMoney=openingBank===null||!costHistoryAvailable?null:roundMoney(openingBank+reliableRecurringIncome
    -fixedEstimate-averageNecessary-gasAverage-configuredSafetyReserve);
  const recommended=freeMoney===null?0:roundMoney(Math.max(0,freeMoney)*0.1);
  const provisional=futureMonth||historyCount<3||essentialMonths.length<3||fuelMonths.length<3||openingBank===null;
  return {
    recommended,safetyReserve:configuredSafetyReserve,formulaVersion:3,provisional,calculatedAt:todayISO(),
    basis:{
      historyCount,essentialMonths:essentialMonths.length,fuelMonths:fuelMonths.length,
      reliableRecurringIncome,averageFixed:roundMoney(averageFixed),billCommitments,
      averageNecessary:roundMoney(averageNecessary),gasAverage,fixedEstimate,
      essentialEstimate,openingBank:openingBank===null?null:roundMoney(openingBank),
      openingSavings:openingSavings===null?null:roundMoney(openingSavings),
      safetyReserve:configuredSafetyReserve,freeMoney,provisional,futureMonth
    }
  };
}
function ensureSmartBudget(month){
  const existing=state.smartBudgets[month];
  const currentMonth=monthKey(todayISO());
  const projectionReached=existing&&existing.formulaVersion===3&&existing.basis&&existing.basis.futureMonth
    &&month<=currentMonth;
  if(existing&&existing.formulaVersion===3&&month<currentMonth&&!projectionReached)return existing;
  const safetyReserve=existing?existing.safetyReserve:0;
  const calculated=calculateSmartBudget(month,safetyReserve);
  if(existing&&existing.formulaVersion===3
    &&existing.recommended===calculated.recommended
    &&existing.provisional===calculated.provisional
    &&JSON.stringify(existing.basis)===JSON.stringify(calculated.basis))return existing;
  state.smartBudgets[month]={...calculated,manualLimit:existing?existing.manualLimit:null};
  saveState();
  return state.smartBudgets[month];
}
function renderSmartBudget(){
  const budget=ensureSmartBudget(selectedMonth),basis=budget.basis||{};
  const hidden=Boolean(state.hiddenValues.smartBudgetValues);
  const spent=monthlyExpenseTotal(selectedMonth,entry=>(expenseGroups.includes(entry.expenseGroup)
    ?entry.expenseGroup:defaultExpenseGroup(entry.category))==="nonessential");
  const limit=budget.manualLimit===null?budget.recommended:budget.manualLimit;
  const freeMoney=basis.freeMoney;
  const remaining=Math.max(0,roundMoney(limit-spent));
  const percentage=limit>0?spent/limit*100:spent>0?100:0;
  const over=spent>limit;
  const currentMonth=monthKey(todayISO());
  const daysInMonth=new Date(Number(selectedMonth.slice(0,4)),Number(selectedMonth.slice(5,7)),0).getDate();
  const daysRemaining=selectedMonth<currentMonth?null:selectedMonth>currentMonth?daysInMonth:daysInMonth-Number(todayISO().slice(8,10))+1;
  $("smartBudgetRecommended").textContent=hidden?"R$ ****":money(budget.recommended);
  $("smartBudgetLimit").textContent=hidden?"R$ ****":money(limit);
  $("smartBudgetFreeMoney").textContent=hidden?"R$ ****":freeMoney===null?"Indisponível":money(freeMoney);
  $("smartBudgetRate").textContent=hidden?"**%":"10%";
  $("smartBudgetSpent").textContent=hidden?"R$ ****":money(spent);
  $("smartBudgetRemaining").textContent=hidden?"R$ ****":money(remaining);
  $("smartBudgetPercent").textContent=hidden?"***%":`${percentage.toLocaleString("pt-BR",{maximumFractionDigits:1})}%`;
  $("smartBudgetDays").textContent=daysRemaining===null?"Mês encerrado":`${daysRemaining} ${daysRemaining===1?"dia":"dias"} ${selectedMonth===currentMonth?"restantes":"no mês"}`;
  $("smartBudgetExceeded").textContent=over?(hidden?"Orçamento ultrapassado":`Excedido em ${money(spent-limit)}.`):"";
  $("smartBudgetBar").style.width=hidden?"0%":`${Math.min(100,percentage)}%`;
  $("smartBudgetBar").classList.toggle("over-budget",over);
  $("smartBudgetBar").removeAttribute("aria-valuenow");
  if(!hidden)$("smartBudgetBar").setAttribute("aria-valuenow",String(Math.min(100,percentage)));
  $("smartBudgetBar").setAttribute("aria-valuetext",hidden?"Valores ocultos":`${percentage.toLocaleString("pt-BR",{maximumFractionDigits:1})}% utilizado`);
  $("smartBudgetStartBalance").textContent=hidden?"R$ ****":basis.openingBank===null?"Indisponível":money(basis.openingBank);
  $("smartBudgetStartBalanceLabel").textContent=basis.futureMonth?"Saldo bancário de hoje (projeção)":"Saldo bancário na abertura";
  $("smartBudgetPlannedIncome").textContent=hidden?"R$ ****":money(Number(basis.reliableRecurringIncome)||0);
  $("smartBudgetFixedCosts").textContent=hidden?"R$ ****":money(Number(basis.fixedEstimate)||0);
  $("smartBudgetEssentialCosts").textContent=hidden?"R$ ****":money(Number(basis.averageNecessary)||0);
  $("smartBudgetGasCosts").textContent=hidden?"R$ ****":money(Number(basis.gasAverage)||0);
  $("smartBudgetSafetyReserve").textContent=hidden?"R$ ****":money(budget.safetyReserve);
  $("smartBudgetSavingsExcluded").textContent=hidden?"R$ ****":basis.openingSavings===null
    ?"Histórico indisponível · fora do cálculo":`${money(basis.openingSavings)} · fora do cálculo`;
  const status=$("smartBudgetStatus");
  status.className="smart-budget-status";
  if(over){status.classList.add("warning");status.textContent="Você ultrapassou o limite recomendado deste mês.";}
  else if(freeMoney===null){status.classList.add("neutral");status.textContent="Limite provisório de R$ 0,00: faltam dados confiáveis de saldo ou despesas essenciais para estimar o dinheiro livre.";}
  else if(basis.futureMonth){status.classList.add("neutral");status.textContent="Projeção provisória para mês futuro; o saldo atual é apenas uma referência.";}
  else if(limit===0){status.classList.add("neutral");status.textContent="Nenhum valor livre recomendado; preserve o saldo para os compromissos e reservas.";}
  else if(percentage>=80){status.classList.add("warning");status.textContent="Atenção: boa parte do orçamento já foi utilizada.";}
  else{status.classList.add("positive");status.textContent="Orçamento sob controle.";}
  const historyCount=Number(basis.historyCount)||0,fuelCount=Number(basis.fuelMonths)||0;
  const balanceNote=basis.openingBank===null
    ?" Confirme a data do saldo inicial para validar a disponibilidade."
    :!Number(basis.essentialMonths)?" Cadastre despesas essenciais para estimar esse custo."
      :!Number(basis.fuelMonths)?" Cadastre gastos de gasolina para estimar esse custo.":"";
  $("smartBudgetEstimateNote").textContent=budget.provisional
    ?`Estimativa provisória${basis.futureMonth?" · mês futuro usando o saldo de hoje como referência":""} · ${historyCount} ${historyCount===1?"mês":"meses"} de histórico, ${Number(basis.essentialMonths)||0} ${Number(basis.essentialMonths)===1?"mês":"meses"} com despesas essenciais e ${fuelCount} ${fuelCount===1?"mês":"meses"} com dados de gasolina.${balanceNote}`
    :`Recomendação baseada em ${historyCount} ${historyCount===1?"mês":"meses"} e ${fuelCount} ${fuelCount===1?"mês":"meses"} com dados de gasolina.`;
  $("smartBudgetCalculation").textContent="Dinheiro livre = saldo bancário na abertura + entradas recorrentes confiáveis − contas previstas − média de essenciais − média de gasolina − reserva de segurança. Limite = 10% do dinheiro livre positivo. O app ainda não cadastra entradas futuras recorrentes, então não presume ganhos incertos. Dinheiro guardado fica fora do cálculo; somente resgates já refletidos no saldo bancário contam.";
  $("editSmartBudget").textContent=budget.manualLimit===null?"Ajustar limite":"Limite ajustado";
}
function calculateFinancialPlan(month){
  const currentMonth=monthKey(todayISO()),historyMonths=budgetHistoryMonths(month);
  const incomeByMonth=historyMonths.map(key=>({
    month:key,
    income:monthTotals(key).income,
    days:new Set(state.entries.filter(entry=>entry.type==="income"&&monthKey(entry.date)===key).map(entry=>entry.date)).size
  }));
  const historyCount=incomeByMonth.length;
  const totalHistoricalIncome=incomeByMonth.reduce((sum,item)=>sum+item.income,0);
  const earningDays=incomeByMonth.reduce((sum,item)=>sum+item.days,0);
  const averageEarningDays=historyCount?earningDays/historyCount:0;
  const dailyIncomeAverage=earningDays?totalHistoricalIncome/earningDays:0;
  const averageIncome=historyCount>=3
    ?(earningDays?dailyIncomeAverage*averageEarningDays:totalHistoricalIncome/historyCount)
    :0;
  const monthlyTrend=historyCount>1
    ?(incomeByMonth[historyCount-1].income-incomeByMonth[0].income)/(historyCount-1)
    :0;
  const trendAdjustment=historyCount>1
    ?Math.max(-averageIncome*.1,Math.min(averageIncome*.1,monthlyTrend*.25))
    :0;
  const incomeEstimate=roundMoney(Math.max(0,averageIncome+trendAdjustment));
  const trend=historyCount<2?"unknown":monthlyTrend>0?"increasing":monthlyTrend<0?"decreasing":"stable";
  const linkedBillEntries=new Set(state.bills.map(bill=>billPaymentEntry(bill)).filter(Boolean).map(entry=>String(entry.id)));
  const averageFixed=historyCount
    ?historyMonths.reduce((sum,key)=>sum+monthlyExpenseTotal(key,entry=>entry.expenseGroup==="fixed"
      &&!entry.sourceBillId&&!linkedBillEntries.has(String(entry.id))),0)/historyCount
    :0;
  const averageNecessary=historyCount
    ?historyMonths.reduce((sum,key)=>sum+monthlyExpenseTotal(key,entry=>entry.expenseGroup==="necessary"&&!isGasolineCategory(entry.category)),0)/historyCount
    :0;
  const essentialMonths=historyMonths.filter(key=>monthlyExpenseTotal(key,entry=>entry.expenseGroup==="fixed"
    ||entry.expenseGroup==="necessary"&&!isGasolineCategory(entry.category))>0).length;
  const fuelMonths=historyMonths.filter(key=>monthlyExpenseTotal(key,entry=>isGasolineCategory(entry.category)
    &&(expenseGroups.includes(entry.expenseGroup)?entry.expenseGroup:defaultExpenseGroup(entry.category))==="necessary")>0);
  const gasAverage=fuelMonths.length
    ?fuelMonths.reduce((sum,key)=>sum+monthlyExpenseTotal(key,entry=>isGasolineCategory(entry.category)
      &&(expenseGroups.includes(entry.expenseGroup)?entry.expenseGroup:defaultExpenseGroup(entry.category))==="necessary"),0)/fuelMonths.length
    :0;
  const monthStart=`${month}-01`,monthEnd=endOfMonth(month);
  const fixedBills=roundMoney(state.bills.filter(bill=>{
    if(bill.cancelled||bill.dueDate>monthEnd)return false;
    const payment=billPaymentEntry(bill),paidDate=bill.paidAt||(payment&&payment.date);
    return !paidDate||paidDate>=monthStart;
  }).reduce((sum,bill)=>sum+(Number(bill.amount)||0),0));
  const futureOpeningBalance=month>currentMonth;
  const balanceDate=futureOpeningBalance?todayISO():endOfMonth(previousMonth(month));
  const balanceReliable=state.balanceReferenceConfirmed&&balanceDate>=state.balanceReferenceDate;
  const openingBank=balanceReliable?accountBalanceAt(balanceDate):null;
  const openingSavings=savingsAt(balanceDate);
  const fixedReserve=roundMoney(averageFixed+fixedBills);
  const necessaryReserve=roundMoney(averageNecessary);
  const gasolineReserve=roundMoney(gasAverage);
  const estimatedEssentialCosts=roundMoney(fixedReserve+necessaryReserve+gasolineReserve);
  const essentialReserve=roundMoney(Math.max(estimatedEssentialCosts,incomeEstimate*.55));
  const resources=openingBank===null?0:roundMoney(Math.max(0,openingBank+incomeEstimate));
  const availableAfterEssentials=Math.max(0,resources-essentialReserve);
  const safetyReserve=roundMoney(Math.min(incomeEstimate*.1,availableAfterEssentials));
  const savingsBase=roundMoney(Math.min(incomeEstimate*.25,Math.max(0,availableAfterEssentials-safetyReserve)));
  const nonessentialLimit=roundMoney(Math.min(incomeEstimate*.1,Math.max(0,availableAfterEssentials-safetyReserve-savingsBase)));
  const remainingAfterTargets=Math.max(0,roundMoney(availableAfterEssentials-safetyReserve-savingsBase-nonessentialLimit));
  const additionalSavings=roundMoney(remainingAfterTargets*.5);
  const savingsRecommended=roundMoney(savingsBase+additionalSavings);
  const unallocatedRemainder=roundMoney(remainingAfterTargets-additionalSavings);
  const expectedBankEnd=openingBank===null?null:roundMoney(openingBank+incomeEstimate-essentialReserve-nonessentialLimit-savingsRecommended);
  const expectedSavingsEnd=openingSavings===null?null:roundMoney(openingSavings+savingsRecommended);
  const openingPatrimony=combinePatrimony(openingBank,openingSavings);
  const expectedPatrimonyGrowth=roundMoney(incomeEstimate-essentialReserve-nonessentialLimit);
  const expectedPatrimonyEnd=openingPatrimony===null?null:roundMoney(openingPatrimony+expectedPatrimonyGrowth);
  return {
    version:1,status:month>currentMonth?"projection":month===currentMonth?"final":"reconstructed",
    capturedAt:todayISO(),
    inputs:{
      openingBank:openingBank===null?null:roundMoney(openingBank),
      openingSavings:openingSavings===null?null:roundMoney(openingSavings),
      incomeEstimate,incomeMethod:historyCount>=3?"history":"reference",
      incomeHistoryMonths:historyMonths,earningDays,dailyIncomeAverage:roundMoney(dailyIncomeAverage),
      averageEarningDays:roundMoney(averageEarningDays),incomeTrend:trend,
      incomeTrendAdjustment:roundMoney(trendAdjustment),historyCount,essentialMonths,
      gasAverage:roundMoney(gasAverage),gasMonths:fuelMonths.length,
      averageFixed:roundMoney(averageFixed),fixedBills,
      averageNecessary:roundMoney(averageNecessary),
      provisional:historyCount<3||essentialMonths<3||fuelMonths.length<3||openingBank===null,
      futureOpeningBalance
    },
    recommendations:{
      resources,fixedReserve,necessaryReserve,gasolineReserve,essentialReserve,
      safetyReserve,savingsRecommended,nonessentialLimit,expectedBankEnd,
      expectedSavingsEnd,expectedPatrimonyGrowth,expectedPatrimonyEnd,unallocatedRemainder
    }
  };
}
function ensureFinancialPlan(month){
  const existing=state.financialPlans[month],currentMonth=monthKey(todayISO());
  if(existing&&existing.status!=="projection")return existing;
  const calculated=calculateFinancialPlan(month);
  if(existing&&month>currentMonth&&JSON.stringify(existing.inputs)===JSON.stringify(calculated.inputs)
    &&JSON.stringify(existing.recommendations)===JSON.stringify(calculated.recommendations))return existing;
  if(existing&&month===currentMonth&&existing.status==="final")return existing;
  state.financialPlans[month]=calculated;
  saveState();
  return calculated;
}
function financialPlanActuals(month){
  const currentMonth=monthKey(todayISO());
  if(month>currentMonth)return null;
  const endDate=month<currentMonth?endOfMonth(month):todayISO();
  const entries=state.entries.filter(entry=>monthKey(entry.date)===month);
  const expenses=entries.filter(entry=>entry.type==="expense");
  const groupTotal=group=>roundMoney(expenses.filter(entry=>(expenseGroups.includes(entry.expenseGroup)
    ?entry.expenseGroup:defaultExpenseGroup(entry.category))===group).reduce((sum,entry)=>sum+(Number(entry.amount)||0),0));
  const gasEntries=expenses.filter(entry=>isGasolineCategory(entry.category)
    &&(expenseGroups.includes(entry.expenseGroup)?entry.expenseGroup:defaultExpenseGroup(entry.category))==="necessary");
  const gas=roundMoney(gasEntries.reduce((sum,entry)=>sum+(Number(entry.amount)||0),0));
  const monthStart=`${month}-01`;
  const paidBills=roundMoney(state.bills.filter(bill=>{
    const payment=billPaymentEntry(bill),paidDate=bill.paidAt||(payment&&payment.date);
    return !bill.cancelled&&paidDate&&paidDate>=monthStart&&paidDate<=endDate;
  }).reduce((sum,bill)=>sum+(Number(bill.amount)||0),0));
  const transfers=state.transfers.filter(item=>monthKey(item.date)===month);
  const netSaved=roundMoney(transfers.reduce((sum,item)=>sum+(item.direction==="save"?1:-1)*Number(item.amount),0));
  const bankStart=accountBalanceAt(endOfMonth(previousMonth(month)));
  const savingsStart=savingsAt(endOfMonth(previousMonth(month)));
  const bankEnd=accountBalanceAt(endDate);
  const savingsEnd=savingsAt(endDate);
  return {
    income:roundMoney(entries.filter(entry=>entry.type==="income").reduce((sum,entry)=>sum+(Number(entry.amount)||0),0)),
    fixed:groupTotal("fixed"),necessary:roundMoney(groupTotal("necessary")-gas),gas,
    nonessential:groupTotal("nonessential"),paidBills,netSaved,bankStart,bankEnd,savingsStart,savingsEnd,
    patrimonyStart:combinePatrimony(bankStart,savingsStart),
    patrimonyEnd:combinePatrimony(bankEnd,savingsEnd),
    patrimonyGrowth:bankStart===null||savingsStart===null||bankEnd===null||savingsEnd===null
      ?null:roundMoney(combinePatrimony(bankEnd,savingsEnd)-combinePatrimony(bankStart,savingsStart)),
    partial:month===currentMonth
  };
}
function renderFinancialPlan(){
  const currentMonth=monthKey(todayISO());
  ensureFinancialPlan(currentMonth);
  const historical=selectedMonth<currentMonth;
  const targetMonth=historical||selectedMonth>currentMonth?selectedMonth:monthAfter(currentMonth,1);
  const plan=ensureFinancialPlan(targetMonth),selectedPlan=ensureFinancialPlan(selectedMonth);
  const result=financialPlanActuals(selectedMonth),hidden=Boolean(state.hiddenValues.financialPlanValues);
  const inputs=plan.inputs,recommendations=plan.recommendations;
  const selectedInputs=selectedPlan.inputs,selectedRecommendations=selectedPlan.recommendations;
  const display=value=>hidden?"R$ ****":value===null||value===undefined?"Indisponível":money(value);
  const text=(id,value)=>{const element=$(id);if(element)element.textContent=value;};
  text("financialPlanTitle",selectedMonth===currentMonth
    ?"Planejamento do Próximo Mês":`Planejamento de ${formatMonth(targetMonth)}`);
  text("financialPlanMonth",formatMonth(targetMonth));
  text("financialPlanIncome",display(inputs.incomeEstimate));
  text("financialPlanFixed",display(recommendations.fixedReserve));
  text("financialPlanGas",display(recommendations.gasolineReserve));
  text("financialPlanNecessary",display(recommendations.necessaryReserve));
  text("financialPlanEssential",display(recommendations.essentialReserve));
  text("financialPlanSavings",display(recommendations.savingsRecommended));
  text("financialPlanLeisure",display(recommendations.nonessentialLimit));
  text("financialPlanSafety",display(recommendations.safetyReserve));
  text("financialPlanBankEnd",display(recommendations.expectedBankEnd));
  text("financialPlanPatrimonyGrowth",display(recommendations.expectedPatrimonyGrowth));
  const trendLabel=inputs.incomeTrend==="increasing"?"tendência recente de alta"
    :inputs.incomeTrend==="decreasing"?"tendência recente de queda"
      :inputs.incomeTrend==="stable"?"renda estável nos meses observados":"sem tendência histórica disponível";
  const incomeBasis=hidden
    ?"Renda estimada com base no histórico; valores ocultos."
    :inputs.incomeMethod==="history"
    ?`Média de ${inputs.historyCount} ${inputs.historyCount===1?"mês completo disponível":"meses completos disponíveis"}; média diária registrada de ${money(inputs.dailyIncomeAverage)} em ${inputs.earningDays} dias com ganhos (média de ${inputs.averageEarningDays.toLocaleString("pt-BR",{maximumFractionDigits:1})} ${inputs.averageEarningDays===1?"dia":"dias"}/mês); ${trendLabel}.`
    :`Histórico insuficiente: renda estimada em ${money(inputs.incomeEstimate)} até haver três meses completos com dados.`;
  const provisionalNote=inputs.provisional
    ?` Estimativa provisória: ${inputs.historyCount<3?"histórico de renda incompleto; ":""}${inputs.essentialMonths<3?"histórico de despesas essenciais insuficiente; ":""}${inputs.gasMonths<3?"histórico de gasolina insuficiente; ":""}${inputs.openingBank===null?"saldo bancário de abertura indisponível. ":""}`
    :"";
  text("financialPlanIncomeBasis",incomeBasis+provisionalNote);
  text("financialPlanStatus",plan.status==="reconstructed"
    ?"Plano histórico reconstruído com os dados atuais; pode não refletir exatamente o que era conhecido naquela época."
    :plan.status==="projection"
      ?"Projeção para mês futuro; a renda estimada não foi somada ao saldo bancário atual."
      :"Recomendação mensal salva. Ganhos estimados são projeções, não dinheiro já recebido.");
  text("financialPlanCalculation","Referência: 25% para guardar, 55% para essenciais, até 10% para lazer e 10% para segurança. A reserva essencial usa o maior valor entre a média das despesas observadas e 55% da renda estimada; essenciais acima disso reduzem lazer e economia. As metas só usam saldo bancário e renda projetada; dinheiro guardado não financia gastos.");
  const actualLabel=result
    ?`${result.partial?"Acumulado até hoje":"Resultado real"} · ${formatMonth(selectedMonth)}`
    :`Resultado de ${formatMonth(selectedMonth)} (mês ainda não iniciado)`;
  text("financialPlanActualTitle",actualLabel);
  const actualValues=result?[
    ["Renda recebida",display(result.income)],
    ["Despesas essenciais",display(result.fixed+result.necessary+result.gas)],
    ["Gastos não essenciais",display(result.nonessential)],
    ["Transferência líquida para o saldo guardado",display(result.netSaved)],
    ["Saldo bancário no fechamento",display(result.bankEnd)],
    ["Crescimento real do patrimônio",display(result.patrimonyGrowth)]
  ]:[["Renda recebida","R$ 0,00"],["Despesas essenciais","R$ 0,00"],["Gastos não essenciais","R$ 0,00"],["Transferência líquida para o saldo guardado","R$ 0,00"],["Saldo bancário no fechamento","Indisponível"],["Crescimento real do patrimônio","Indisponível"]];
  $("financialPlanActuals").innerHTML=actualValues.map(([label,value])=>`<div><span>${escapeHTML(label)}</span><strong>${hidden?"R$ ****":escapeHTML(value)}</strong></div>`).join("");
  const nextPlan=calculateFinancialPlan(monthAfter(selectedMonth,1));
  const freeBankMargin=result&&result.bankEnd!==null
    ?Math.max(0,roundMoney(result.bankEnd-nextPlan.recommendations.fixedReserve
      -nextPlan.recommendations.necessaryReserve-nextPlan.recommendations.gasolineReserve))
    :null;
  const progressItems=[
    {label:"Meta de economia",target:selectedRecommendations.savingsRecommended,actual:result?result.netSaved:0,format:value=>`${display(value)} / ${display(selectedRecommendations.savingsRecommended)}`},
    {label:"Gastos não essenciais",target:selectedRecommendations.nonessentialLimit,actual:result?result.nonessential:0,format:value=>`${display(value)} / ${display(selectedRecommendations.nonessentialLimit)}`,overClass:true},
    {label:"Contas previstas pagas",target:selectedInputs.fixedBills,actual:result?result.paidBills:0,format:value=>`${display(value)} / ${display(selectedInputs.fixedBills)}`},
    {label:"Margem livre no banco após compromissos estimados",target:selectedRecommendations.safetyReserve,actual:freeBankMargin,format:value=>`${display(value)} / ${display(selectedRecommendations.safetyReserve)}`}
  ];
  $("financialPlanProgress").innerHTML=progressItems.map((item,index)=>{
    const actualValue=item.actual===null?0:item.actual;
    const value=Math.max(0,actualValue);
    const percentage=item.target>0?Math.min(100,value/item.target*100):value>0?100:0;
    const over=item.overClass&&item.actual>item.target;
    return `<div class="plan-progress-item"><div class="plan-progress-heading"><span>${escapeHTML(item.label)}</span><strong>${hidden?"R$ ****":escapeHTML(item.format(actualValue))}</strong></div><div class="comparison-track plan-progress-track" role="progressbar" aria-label="${escapeHTML(item.label)}" aria-valuemin="0" aria-valuemax="100" ${hidden?"":`aria-valuenow="${percentage}"`} aria-valuetext="${hidden?"Valores ocultos":`${percentage.toLocaleString("pt-BR",{maximumFractionDigits:1})}%` }"><span class="${over?"over-budget":""}" style="width:${hidden?0:percentage}%"></span></div></div>`;
  }).join("");
  const progressNote=result
    ?`Dados reais de ${result.partial?"um mês em andamento":"um mês encerrado"}. A margem de segurança é uma estimativa do saldo bancário após compromissos do mês seguinte; não é uma conta separada.`
    :"Os indicadores de resultado serão preenchidos quando este mês começar.";
  text("financialPlanProgressNote",hidden?"Valores ocultos.":progressNote);
  const messages=[];
  if(result){
    if(result.income>0){
      if(hidden)messages.push("Há ganhos registrados neste período; os valores estão ocultos.");
      else{
        const savedRate=result.netSaved/result.income*100;
        messages.push(`Transferência líquida para o saldo guardado: ${savedRate.toLocaleString("pt-BR",{maximumFractionDigits:1})}% da renda registrada.`);
      }
    }
    if(result.nonessential<=selectedRecommendations.nonessentialLimit)
      messages.push("Os gastos não essenciais estão dentro do limite planejado.");
    else messages.push(hidden?"Os gastos não essenciais ultrapassaram o limite planejado."
      :`Os gastos não essenciais ultrapassaram o limite em ${money(result.nonessential-selectedRecommendations.nonessentialLimit)}.`);
    const previous=financialPlanActuals(previousMonth(selectedMonth));
    if(previous&&previous.income+previous.fixed+previous.necessary+previous.gas+previous.nonessential>0){
      const totalExpense=result.fixed+result.necessary+result.gas+result.nonessential;
      const previousExpense=previous.fixed+previous.necessary+previous.gas+previous.nonessential;
      if(totalExpense>previousExpense)messages.push(hidden?"As despesas registradas aumentaram em relação ao mês anterior."
        :`As despesas registradas aumentaram ${money(totalExpense-previousExpense)} em relação ao mês anterior.`);
      else if(totalExpense<previousExpense)messages.push(hidden?"As despesas registradas diminuíram em relação ao mês anterior."
        :`As despesas registradas diminuíram ${money(previousExpense-totalExpense)} em relação ao mês anterior.`);
      if(result.patrimonyGrowth!==null)messages.push(hidden?"O patrimônio teve uma variação apurada neste período."
        :`Variação real do patrimônio no período: ${money(result.patrimonyGrowth)}.`);
    }
  }
  if(recommendations.unallocatedRemainder>0)messages.push(hidden
    ?"Há uma sobra projetada além das metas; parte foi sugerida como economia adicional."
    :`Há uma sobra projetada de ${money(recommendations.unallocatedRemainder)} além das metas; metade dela foi sugerida como economia adicional.`);
  $("financialPlanEvolution").innerHTML=messages.length?messages.map(message=>`<p>${escapeHTML(message)}</p>`).join("")
    :'<p class="muted small">Ainda não há dados suficientes para avaliar a evolução financeira deste período.</p>';
}
function render(){
  const t=monthTotals(selectedMonth), entries=monthEntries().sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt);
  const transfers=state.transfers.filter(transfer=>monthKey(transfer.date)===selectedMonth);
  $("storageWarning").hidden=!storageWarning;
  $("storageWarning").textContent=storageWarning;
  $("monthLabel").textContent=formatMonth(selectedMonth);
  $("monthlyExpenses").textContent=displayMoney("monthlyExpenses",t.expense);
  $("monthlyIncome").textContent=displayMoney("monthlyIncome",t.income);
  const currentMonth=monthKey(todayISO()),historical=selectedMonth<currentMonth;
  const cutoffDate=historical?endOfMonth(selectedMonth):todayISO();
  const bankBalance=historical&&!state.balanceReferenceConfirmed?null:accountBalanceAt(cutoffDate);
  const savedBalance=savingsAt(cutoffDate);
  const selectedPatrimony=combinePatrimony(bankBalance,savedBalance);
  $("bankBalanceLabel").textContent=historical?`Fechamento da conta (${formatMonth(selectedMonth)})`:"Saldo atual da conta";
  $("currentBalance").textContent=displayMoney("currentBalance",bankBalance);
  $("savedAmount").textContent=displayMoney("savedAmount",savedBalance);
  $("totalAmount").textContent=displayMoney("totalAmount",selectedPatrimony);
  let balanceMessage="";
  if(historical&&!state.balanceReferenceConfirmed)balanceMessage="Fechamento indisponível: confirme a data de referência do saldo inicial para validar o histórico.";
  else if(bankBalance===null)balanceMessage=`Saldo inicial posterior ao período selecionado (${formatISODate(state.balanceReferenceDate)}).`;
  else if(historical&&savedBalance===null)balanceMessage=`Sem histórico do dinheiro guardado até ${formatISODate(cutoffDate)}; o total desse período não pode ser calculado.`;
  else if(historical)balanceMessage=`Fechamento calculado até ${formatISODate(cutoffDate)}.`;
  $("balanceMessage").textContent=balanceMessage;
  const recordCount=entries.length+transfers.length;
  $("transactionCount").textContent=`${recordCount} ${recordCount===1?"registro":"registros"}`;
  renderComparison();
  renderPatrimonyComparison();
  renderAverages();
  renderAlerts();
  renderCategories();
  renderTransactions(entries,transfers);
  renderBills();
  renderSmartBudget();
  renderFinancialPlan();
  renderGoals(selectedPatrimony);
  bindEyeButtons();
}
function renderComparison(){
  const previous=previousMonth(selectedMonth), currentTotals=monthTotals(selectedMonth), previousTotals=monthTotals(previous);
  $("incomeCurrentLabel").textContent=formatMonth(selectedMonth);
  $("incomePreviousLabel").textContent=formatMonth(previous);
  $("expenseCurrentLabel").textContent=formatMonth(selectedMonth);
  $("expensePreviousLabel").textContent=formatMonth(previous);
  renderComparisonMetric("income",currentTotals.income,previousTotals.income);
  renderComparisonMetric("expense",currentTotals.expense,previousTotals.expense);
}
function renderComparisonMetric(prefix,current,previous){
  $(`${prefix}CurrentValue`).textContent=displayMoney(`${prefix}CurrentValue`,current);
  $(`${prefix}PreviousValue`).textContent=displayMoney(`${prefix}PreviousValue`,previous);
  const difference=current-previous;
  const change=previous?`${((difference/previous)*100).toLocaleString("pt-BR",{maximumFractionDigits:1})}%`:current===0?"0%":"sem base para %";
  $(`${prefix}Difference`).textContent=state.hiddenValues[`${prefix}Difference`]?"R$ ****":`${difference>0?"+":""}${money(difference)} (${change})`;
  const max=Math.max(current,previous);
  $(`${prefix}CurrentBar`).style.width=max?`${current/max*100}%`:"0%";
  $(`${prefix}PreviousBar`).style.width=max?`${previous/max*100}%`:"0%";
}
function patrimonyAtMonth(key){
  const currentMonth=monthKey(todayISO());
  if(key>currentMonth)return null;
  const historical=key<currentMonth;
  if(historical&&!state.balanceReferenceConfirmed)return null;
  const cutoff=historical?endOfMonth(key):todayISO();
  return patrimonyAtDate(cutoff);
}
function renderPatrimonyComparison(){
  const previous=previousMonth(selectedMonth);
  const currentValue=patrimonyAtMonth(selectedMonth),previousValue=patrimonyAtMonth(previous);
  $("patrimonyCurrentLabel").textContent=formatMonth(selectedMonth);
  $("patrimonyPreviousLabel").textContent=formatMonth(previous);
  $("patrimonyCurrentValue").textContent=displayMoney("patrimonyCurrentValue",currentValue);
  $("patrimonyPreviousValue").textContent=displayMoney("patrimonyPreviousValue",previousValue);
  let note="";
  if(currentValue===null||previousValue===null){
    $("patrimonyDifference").textContent=state.hiddenValues.patrimonyDifference?"R$ ****":"Indisponível";
    note="Comparação indisponível: falta histórico confiável de saldo bancário ou dinheiro guardado para um dos períodos.";
  }else{
    const difference=roundMoney(currentValue-previousValue);
    const percentage=previousValue===0?(difference===0?"0%":"sem base para %"):`${(difference/Math.abs(previousValue)*100).toLocaleString("pt-BR",{maximumFractionDigits:1})}%`;
    $("patrimonyDifference").textContent=state.hiddenValues.patrimonyDifference?"R$ ****":`${difference>0?"+":""}${money(difference)} (${percentage})`;
    note=`${difference>0?"Crescimento":difference<0?"Queda":"Sem variação"} em relação ao mês anterior.`;
  }
  $("patrimonyNote").textContent=note;
  const max=Math.max(Math.abs(currentValue||0),Math.abs(previousValue||0));
  $("patrimonyCurrentBar").style.width=max&&currentValue!==null?`${Math.abs(currentValue)/max*100}%`:"0%";
  $("patrimonyPreviousBar").style.width=max&&previousValue!==null?`${Math.abs(previousValue)/max*100}%`:"0%";
  const currentMonth=monthKey(todayISO()),lastCompleteMonth=previousMonth(currentMonth);
  const firstSnapshot=state.savingsHistory.map(item=>item.date).filter(isValidISODate).sort()[0];
  const knownStart=firstSnapshot&&firstSnapshot>state.balanceReferenceDate?firstSnapshot:state.balanceReferenceDate;
  const firstMonth=monthKey(knownStart);
  let count=0,totalChange=0;
  if(state.balanceReferenceConfirmed&&firstSnapshot){
    for(let month=monthAfter(firstMonth,1);month<=lastCompleteMonth;month=monthAfter(month,1)){
      const before=patrimonyAtMonth(monthAfter(month,-1)),after=patrimonyAtMonth(month);
      if(before===null||after===null)continue;
      totalChange+=after-before;count++;
    }
  }
  $("averagePatrimonyGrowth").textContent=count?displayMoney("averagePatrimonyGrowth",totalChange/count):"—";
  $("averagePatrimonyGrowth").classList.toggle("positive",count>0&&totalChange/count>=0);
  $("averagePatrimonyGrowth").classList.toggle("expense-value",count>0&&totalChange/count<0);
  $("patrimonyGrowthNote").textContent=count
    ?`Média de variação em ${count} ${count===1?"mês completo":"meses completos"}; o mês atual não foi incluído.`
    :"Histórico insuficiente para calcular uma média mensal de crescimento confiável.";
}
function renderAverages(){
  const averages=historicalAverages();
  $("averageMonths").textContent=averages.count?`${averages.count} ${averages.count===1?"mês utilizado":"meses utilizados"}`:"Histórico insuficiente";
  $("averageIncome").textContent=averages.count?displayMoney("averageIncome",averages.income):"—";
  $("averageExpenses").textContent=averages.count?displayMoney("averageExpenses",averages.expense):"—";
  $("averageNote").textContent=averages.count
    ?"Média dos meses anteriores com lançamentos; o mês atual não entra no cálculo."
    :"Ainda não há meses anteriores com lançamentos suficientes para calcular uma média.";
}
function renderAlerts(){
  const averages=historicalAverages(), current=monthTotals(monthKey(todayISO())), alerts=[];
  if(averages.count){
    if(current.expense>averages.expense)alerts.push({type:"warning",text:"Atenção: seus gastos estão acima da média"});
    if(current.income<averages.income)alerts.push({type:"warning",text:"Seus ganhos estão abaixo da média dos meses anteriores"});
  }
  if(state.monthlyLimit!==null&&current.expense>state.monthlyLimit){
    alerts.push({type:"warning",text:"Você ultrapassou o limite mensal de gastos configurado."});
  }
  if(!alerts.length){
    if(averages.count)alerts.push({type:"positive",text:"Tudo bem: seus gastos e ganhos estão dentro da média dos meses anteriores."});
    else if(state.monthlyLimit!==null)alerts.push({type:"positive",text:"Seus gastos estão dentro do limite mensal configurado."});
    else alerts.push({type:"neutral",text:"Ainda não há histórico suficiente para avaliar seus gastos e ganhos."});
  }
  $("smartAlerts").innerHTML=alerts.map(alert=>`<p class="alert-message ${alert.type}">${escapeHTML(alert.text)}</p>`).join("");
  const limitText=state.monthlyLimit===null
    ?"Nenhum limite mensal configurado."
    :`Limite mensal: ${money(state.monthlyLimit)} · Gastos atuais: ${money(current.expense)}`;
  $("limitStatus").textContent=state.hiddenValues.limitStatus?"R$ ****":limitText;
}
function renderCategories(){
  const groups={}; monthEntries().filter(e=>e.type==="expense").forEach(e=>groups[e.category]=(groups[e.category]||0)+e.amount);
  const list=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  if(!list.length){$("categoryBreakdown").innerHTML='<div class="empty-state">Seus gastos por categoria vão aparecer aqui.</div>';return;}
  const max=list[0][1];
  $("categoryBreakdown").innerHTML=list.map(([name,value])=>`<div class="category-row"><span class="category-name">${escapeHTML(categoryIcon(name))} ${escapeHTML(name)}</span><div class="money-with-eye"><strong class="category-value">${displayMoney(`category:${name}`,value)}</strong>${eyeButton(`category:${name}`,`gasto em ${name}`)}</div><div class="bar"><span style="width:${Math.max(3,value/max*100)}%"></span></div></div>`).join("");
}
function renderTransactions(entries,transfers){
  const list=$("transactions"),scrollTop=list.scrollTop;
  if(!entries.length&&!transfers.length){list.innerHTML='<div class="empty-state">Ainda não há lançamentos ou transferências neste mês.</div>';list.style.maxHeight="";return;}
  const records=[
    ...entries.map(entry=>({...entry,recordType:"entry"})),
    ...transfers.map(transfer=>({...transfer,recordType:"transfer"}))
  ].sort((a,b)=>b.date.localeCompare(a.date)||(Number(b.createdAt)||0)-(Number(a.createdAt)||0));
  list.innerHTML=records.map(record=>{
    if(record.recordType==="transfer"){
      const direction=record.direction==="save"?"Guardar dinheiro":"Resgatar dinheiro";
      const path=record.direction==="save"?"Banco → Guardado":"Guardado → Banco";
      return `<div class="transaction transfer-transaction"><div class="transaction-icon">↔</div><div class="transaction-info"><strong>${direction}${record.description?` · ${escapeHTML(record.description)}`:""}</strong><span>${formatISODate(record.date)} · ${path}</span></div><div class="transaction-amount transfer-amount">${state.hiddenValues[`transfer:${record.id}`]?"R$ ****":money(record.amount)}</div><div class="transaction-actions">${eyeButton(`transfer:${record.id}`,`transferência ${direction.toLowerCase()}`)}<button class="transaction-edit" data-edit-transfer="${escapeHTML(record.id)}">Editar</button><button class="transaction-delete" data-delete-transfer="${escapeHTML(record.id)}">Excluir</button></div></div>`;
    }
    const budgetGroup=record.type==="expense"?expenseGroupLabels[expenseGroups.includes(record.expenseGroup)?record.expenseGroup:defaultExpenseGroup(record.category)]:"";
    return `<div class="transaction"><div class="transaction-icon">${escapeHTML(categoryIcon(record.category))}</div><div class="transaction-info"><strong>${escapeHTML(record.category)}${record.note?` · ${escapeHTML(record.note)}`:""}</strong><span>${formatISODate(record.date)}${budgetGroup?` · ${escapeHTML(budgetGroup)}`:""}</span></div><div class="transaction-amount ${record.type}">${state.hiddenValues[`entry:${record.id}`]?"R$ ****":`${record.type==="income"?"+":"−"} ${money(record.amount)}`}</div><div class="transaction-actions">${eyeButton(`entry:${record.id}`,`lançamento ${record.category}`)}<button class="transaction-edit" data-edit="${escapeHTML(record.id)}">Editar</button><button class="transaction-delete" data-delete="${escapeHTML(record.id)}">Excluir</button></div></div>`;
  }).join("");
  list.scrollTop=scrollTop;
  sizeTransactionHistory();
  document.querySelectorAll("[data-edit]").forEach(btn=>btn.addEventListener("click",()=>openEditEntry(btn.dataset.edit)));
  document.querySelectorAll("[data-edit-transfer]").forEach(btn=>btn.addEventListener("click",()=>openTransferEdit(btn.dataset.editTransfer)));
  document.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{pendingDelete={type:"entry",id:btn.dataset.delete};$("confirmDialog").showModal();}));
  document.querySelectorAll("[data-delete-transfer]").forEach(btn=>btn.addEventListener("click",()=>{pendingDelete={type:"transfer",id:btn.dataset.deleteTransfer};$("confirmDialog").showModal();}));
}
function sizeTransactionHistory(){
  const list=$("transactions"),items=Array.from(list.children).filter(item=>item.classList.contains("transaction"));
  if(items.length<=6){list.style.maxHeight="";return;}
  const gap=parseFloat(getComputedStyle(list).rowGap)||0;
  const visibleHeight=items.slice(0,6).reduce((total,item)=>total+item.getBoundingClientRect().height,0)+gap*5;
  list.style.maxHeight=`${visibleHeight}px`;
}
window.addEventListener("resize",sizeTransactionHistory);
function goalVersionAt(goal,month){
  let version=null;
  for(const candidate of goal.versions){
    if(candidate.month===null||candidate.month<=month)version=candidate;
    else break;
  }
  return version;
}
function renderGoals(patrimony){
  const list=$("goalsList");
  const goals=state.goals.map(goal=>({goal,version:goalVersionAt(goal,selectedMonth)})).filter(item=>item.version);
  if(!goals.length){list.innerHTML='<div class="empty-state">Suas metas financeiras aparecerão aqui.</div>';return;}
  const hidden=Boolean(state.hiddenValues.goalValues);
  list.innerHTML=goals.map(({goal,version})=>{
    const percentage=patrimony===null?null:Math.min(100,Math.max(0,patrimony/version.targetAmount*100));
    const barWidth=percentage===null||hidden?0:percentage;
    const remaining=patrimony===null?null:Math.max(0,version.targetAmount-patrimony);
    const progressLabel=hidden?"***% alcançado":percentage===null?"Progresso indisponível":`${percentage.toLocaleString("pt-BR",{maximumFractionDigits:1})}% alcançado`;
    const patrimonyLabel=hidden?"R$ ****":patrimony===null?"Indisponível":money(patrimony);
    const targetLabel=hidden?"R$ ****":money(version.targetAmount);
    const remainingLabel=hidden?"R$ ****":remaining===null?"Indisponível":money(remaining);
    const progressValue=hidden?"":`aria-valuenow="${barWidth}"`;
    const progressText=hidden?"Valores ocultos":progressLabel;
    return `<article class="stat-card goal-card"><div class="goal-heading"><strong>${escapeHTML(version.name)}</strong><div class="goal-actions"><button class="transaction-edit" data-edit-goal="${escapeHTML(goal.id)}" aria-label="Editar meta ${escapeHTML(version.name)}">Editar</button><button class="transaction-delete" data-delete-goal="${escapeHTML(goal.id)}" aria-label="Excluir meta ${escapeHTML(version.name)}">Excluir</button></div></div><div class="goal-progress-line"><span>Patrimônio no mês selecionado: ${patrimonyLabel}</span><strong>Meta: ${targetLabel}</strong></div><div class="bar goal-progress" role="progressbar" aria-label="Progresso da meta ${escapeHTML(version.name)}" aria-valuemin="0" aria-valuemax="100" ${progressValue} aria-valuetext="${progressText}"><span style="width:${barWidth}%"></span></div><div class="goal-progress-line"><span>${progressLabel}</span></div><p class="goal-remaining">Faltam <strong>${remainingLabel}</strong></p></article>`;
  }).join("");
  document.querySelectorAll("[data-edit-goal]").forEach(button=>button.addEventListener("click",()=>openGoalForm(button.dataset.editGoal)));
  document.querySelectorAll("[data-delete-goal]").forEach(button=>button.addEventListener("click",()=>{pendingGoalDeleteId=button.dataset.deleteGoal;$("goalDeleteDialog").showModal();}));
}
function openGoalForm(id=null){
  const goal=id===null?null:state.goals.find(item=>String(item.id)===String(id));
  if(id!==null&&!goal){toast("Esta meta não foi encontrada.");return;}
  const version=goal?goalVersionAt(goal,selectedMonth):null;
  if(goal&&!version){toast("Esta meta não está disponível no mês selecionado.");return;}
  editGoalId=goal?String(goal.id):null;
  $("goalFormTitle").textContent=goal?"Editar meta":"Adicionar meta";
  $("goalName").value=version?version.name:"";
  $("goalTarget").value=version?version.targetAmount:"";
  $("goalSubmit").textContent=goal?"Salvar alterações":"Salvar meta";
  $("goalDialog").showModal();
}
$("addGoal").addEventListener("click",()=>openGoalForm());
$("goalForm").addEventListener("submit",event=>{
  event.preventDefault();
  const name=$("goalName").value.trim();
  const targetAmount=roundMoney($("goalTarget").value);
  if(!name||!Number.isFinite(targetAmount)||targetAmount<=0){
    toast("Informe um nome e um valor desejado válido para a meta.");return;
  }
  const index=editGoalId===null?-1:state.goals.findIndex(goal=>String(goal.id)===editGoalId);
  if(editGoalId!==null&&index<0){toast("Esta meta não foi encontrada.");return;}
  const previous=index<0?null:state.goals[index];
  const versions=previous?previous.versions.slice():[];
  const monthVersion={month:selectedMonth,name,targetAmount};
  const currentVersion=versions.findIndex(version=>version.month===selectedMonth);
  if(currentVersion<0)versions.push(monthVersion);
  else versions[currentVersion]=monthVersion;
  versions.sort((a,b)=>{
    if(a.month===null)return b.month===null?0:-1;
    if(b.month===null)return 1;
    return a.month.localeCompare(b.month);
  });
  const goal={id:previous?previous.id:makeId(),versions};
  if(index<0)state.goals.push(goal);
  else state.goals[index]=goal;
  saveState();$("goalDialog").close();editGoalId=null;render();
  toast(previous?"Meta atualizada.":"Meta cadastrada.");
});
$("confirmGoalDelete").addEventListener("click",()=>{
  const exists=state.goals.some(goal=>String(goal.id)===String(pendingGoalDeleteId));
  if(!exists)toast("Esta meta não foi encontrada.");
  else{state.goals=state.goals.filter(goal=>String(goal.id)!==String(pendingGoalDeleteId));saveState();render();toast("Meta excluída.");}
  $("goalDeleteDialog").close();pendingGoalDeleteId=null;
});
function monthAfter(key,offset){
  const [year,month]=key.split("-").map(Number),date=new Date(year,month-1+offset,1);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
}
function dateForMonthDay(key,day){
  const [year,month]=key.split("-").map(Number),preferred=Math.min(Math.max(Number(day)||1,1),31);
  const lastDay=new Date(year,month,0).getDate();
  return `${year}-${String(month).padStart(2,"0")}-${String(Math.min(preferred,lastDay)).padStart(2,"0")}`;
}
function installmentDueDate(series,installmentIndex){
  if(series.frequency==="monthly")
    return dateForMonthDay(monthAfter(monthKey(series.firstDueDate),installmentIndex),Number(series.firstDueDate.slice(8,10)));
  const date=new Date(`${series.firstDueDate}T12:00:00`);
  date.setDate(date.getDate()+(series.frequency==="biweekly"?14:7)*installmentIndex);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function installmentAmount(series,number){
  const totalCents=Math.round(Number(series.totalAmount)*100),count=Number(series.installmentCount);
  const base=Math.floor(totalCents/count),remainder=totalCents%count;
  return (base+(number<=remainder?1:0))/100;
}
function createBillOccurrence(series,dueDate,number=null){
  const fixed=series.kind==="fixed";
  return {
    id:makeId(),name:series.name,amount:fixed?Number(series.amount):installmentAmount(series,number),
    dueDate,category:series.category,description:series.description||"",
    recurringMonthly:fixed,recurringGroupId:fixed?series.id:null,recurringDay:fixed?Number(series.dueDay):null,
    seriesId:series.id,seriesKind:series.kind,
    occurrenceKey:fixed?monthKey(dueDate):String(number),
    installmentNumber:fixed?null:number,installmentCount:fixed?null:Number(series.installmentCount),
    frequency:series.frequency||"monthly",status:"pending",paidAt:null,paymentEntryId:null
  };
}
function ensureBillOccurrences(){
  let changed=false;
  const currentMonth=monthKey(todayISO()),horizon=monthAfter(currentMonth,24);
  const targetMonth=selectedMonth>horizon?selectedMonth:horizon;
  state.billSeries.forEach(series=>{
    if(series.kind==="fixed"&&series.active&&isValidISODate(series.startDate)){
      for(let month=monthKey(series.startDate);month<=targetMonth;month=monthAfter(month,1)){
        if(state.bills.some(bill=>String(bill.seriesId)===series.id&&bill.occurrenceKey===month))continue;
        const dueDate=dateForMonthDay(month,series.dueDay);
        state.bills.push(createBillOccurrence(series,dueDate));
        changed=true;
      }
    }else if(series.kind==="installment"&&isValidISODate(series.firstDueDate)){
      for(let number=1;number<=Number(series.installmentCount);number++){
        if(state.bills.some(bill=>String(bill.seriesId)===series.id&&Number(bill.installmentNumber)===number))continue;
        state.bills.push(createBillOccurrence(series,installmentDueDate(series,number-1),number));
        changed=true;
      }
    }
  });
  if(changed)saveState();
}
function billStatus(bill){
  if(bill.status==="paid"||bill.paidAt)return "paid";
  return bill.dueDate<todayISO()?"overdue":"pending";
}
function billForEntry(entry){
  return state.bills.find(bill=>String(bill.id)===String(entry.sourceBillId)
    ||bill.paymentEntryId!=null&&String(bill.paymentEntryId)===String(entry.id))||null;
}
function billPaymentEntry(bill){
  return state.entries.find(entry=>entry.type==="expense"&&String(entry.sourceBillId)===String(bill.id))
    ||state.entries.find(entry=>entry.type==="expense"&&bill.paymentEntryId!=null&&String(entry.id)===String(bill.paymentEntryId))
    ||null;
}
function renderBills(){
  const list=$("billsList"),scrollTop=list.scrollTop;
  ensureBillOccurrences();
  const bills=state.bills.filter(bill=>!bill.cancelled&&monthKey(bill.dueDate)===selectedMonth).slice().sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const monthTotal=roundMoney(bills.reduce((sum,bill)=>sum+(Number(bill.amount)||0),0));
  const monthPaid=roundMoney(bills.filter(bill=>billStatus(bill)==="paid").reduce((sum,bill)=>sum+(Number(bill.amount)||0),0));
  const monthRemaining=roundMoney(Math.max(0,monthTotal-monthPaid));
  const paidPercent=monthTotal>0?Math.min(100,monthPaid/monthTotal*100):0;
  $("billMonthSummary").innerHTML=`<div class="bill-month-summary-heading"><strong>Estimativa de contas · ${escapeHTML(formatMonth(selectedMonth))}</strong><div class="money-with-eye"><strong>${displayMoney("billsMonthTotal",monthTotal)}</strong>${eyeButton("billsMonthTotal","estimativa de contas do mês")}</div></div><div class="comparison-track bill-month-track" role="progressbar" aria-label="Contas pagas no mês" aria-valuemin="0" aria-valuemax="100" ${state.hiddenValues.billsMonthTotal?"":"aria-valuenow=\""+paidPercent+"\""}><span style="width:${state.hiddenValues.billsMonthTotal?0:paidPercent}%"></span></div><div class="bill-month-meta"><span>Pago: ${displayMoney("billsMonthTotal",monthPaid)}</span><span>Em aberto: ${displayMoney("billsMonthTotal",monthRemaining)}</span></div>`;
  if(!bills.length)list.innerHTML='<div class="empty-state">Nenhuma conta para este mês.</div>';
  else list.innerHTML=bills.map(bill=>{
    const status=billStatus(bill);
    const statusLabel=status==="paid"?"Paga":status==="overdue"?"Vencida":"Pendente";
    const series=state.billSeries.find(item=>String(item.id)===String(bill.seriesId));
    const actions=status==="paid"
      ?`<span class="bill-paid-date">Paga em ${formatISODate(bill.paidAt||bill.dueDate)}</span><button class="bill-edit" data-edit-bill="${escapeHTML(bill.id)}">Editar</button><button class="bill-delete" data-delete-bill="${escapeHTML(bill.id)}" aria-label="Excluir ${escapeHTML(bill.name)}">×</button>`
      :`<button class="bill-pay" data-pay-bill="${escapeHTML(bill.id)}">Marcar paga</button><button class="bill-edit" data-edit-bill="${escapeHTML(bill.id)}">Editar</button><button class="bill-delete" data-delete-bill="${escapeHTML(bill.id)}" aria-label="Excluir ${escapeHTML(bill.name)}">×</button>${bill.seriesKind==="fixed"&&series&&series.active&&selectedMonth>=monthKey(todayISO())?`<button class="bill-cancel" data-cancel-series="${escapeHTML(series.id)}">Cancelar fixa</button>`:""}`;
    const installment=bill.seriesKind==="installment"?`<span>Parcela ${bill.installmentNumber}/${bill.installmentCount}</span>`:"";
    const recurrence=bill.seriesKind==="fixed"?"Fixa mensal":bill.seriesKind==="installment"?bill.frequency==="monthly"?"Parcelada · mensal":bill.frequency==="biweekly"?"Parcelada · quinzenal":"Parcelada · semanal":"";
    return `<article class="bill-row"><div class="bill-main"><div class="bill-title-line"><strong>${escapeHTML(bill.name)}</strong><span class="bill-status ${status}">${statusLabel}</span></div><div class="bill-details"><span>Vence ${formatISODate(bill.dueDate)}</span><span>${escapeHTML(bill.category)}</span>${recurrence?`<span>${recurrence}</span>`:""}${installment}</div>${bill.description?`<p class="bill-description">${escapeHTML(bill.description)}</p>`:""}</div><div class="bill-amount">${displayMoney(`bill:${bill.id}`,Number(bill.amount)||0)}${eyeButton(`bill:${bill.id}`,`valor da conta ${bill.name}`)}</div><div class="bill-actions">${actions}</div></article>`;
  }).join("");
  list.scrollTop=scrollTop;
  document.querySelectorAll("[data-pay-bill]").forEach(button=>button.addEventListener("click",()=>openBillPayment(button.dataset.payBill)));
  document.querySelectorAll("[data-edit-bill]").forEach(button=>button.addEventListener("click",()=>openBillEdit(button.dataset.editBill)));
  document.querySelectorAll("[data-delete-bill]").forEach(button=>button.addEventListener("click",()=>{
    pendingBillDeleteId=button.dataset.deleteBill;
    $("billDeleteDialog").showModal();
  }));
  document.querySelectorAll("[data-cancel-series]").forEach(button=>button.addEventListener("click",()=>{
    pendingBillCancelSeriesId=button.dataset.cancelSeries;
    pendingBillCancelMonth=selectedMonth;
    $("billCancelMessage").textContent=`Escolha se deseja cancelar a ocorrência de ${formatMonth(selectedMonth)} ou essa e as próximas. Meses anteriores e pagamentos já feitos serão preservados.`;
    $("billCancelDialog").showModal();
  }));
}
function bindEyeButtons(){
  document.querySelectorAll("[data-eye]").forEach(button=>{
    const key=button.dataset.eye,hidden=Boolean(state.hiddenValues[key]);
    const buttonLabel=(button.getAttribute("aria-label")||"Valor").replace(/^(Ocultar|Mostrar) /,"");
    const action=hidden?"Mostrar":"Ocultar";
    button.classList.toggle("is-hidden",hidden);
    button.setAttribute("aria-label",`${action} ${buttonLabel}`);
    button.setAttribute("title",`${action} ${buttonLabel}`);
    button.setAttribute("aria-pressed",String(hidden));
    button.innerHTML=eyeIcon(hidden);
  });
}
document.addEventListener("click",event=>{
  const target=event.target instanceof Element?event.target:null;
  const button=target?target.closest("button[data-eye]"):null;
  if(!button)return;
  const key=button.dataset.eye;
  if(!key)return;
  state.hiddenValues[key]=!Boolean(state.hiddenValues[key]);
  saveState();render();
});
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderCategoryIconLibrary(){
  const query=categoryNameKey($("categoryIconSearch").value),groups=new Map();
  iconLibrary.forEach(item=>{
    if(query&&!categoryNameKey(`${item.topic} ${item.name}`).includes(query))return;
    if(!groups.has(item.topic))groups.set(item.topic,[]);
    groups.get(item.topic).push(item);
  });
  if(!groups.size){$("categoryIconLibrary").innerHTML='<p class="muted small">Nenhum ícone encontrado.</p>';return;}
  $("categoryIconLibrary").innerHTML=[...groups].map(([topic,items])=>`<section class="category-icon-group"><h3>${escapeHTML(topic)}</h3><div class="category-icon-options">${items.map(item=>`<button type="button" class="category-icon-option${item.icon===selectedCategoryIcon?" selected":""}" data-category-icon="${escapeHTML(item.icon)}" aria-label="${escapeHTML(item.name)}" aria-pressed="${item.icon===selectedCategoryIcon}">${escapeHTML(item.icon)}</button>`).join("")}</div></section>`).join("");
  document.querySelectorAll("[data-category-icon]").forEach(button=>button.addEventListener("click",()=>{
    selectedCategoryIcon=button.dataset.categoryIcon;
    updateSelectedCategoryIcon();
    renderCategoryIconLibrary();
  }));
}
function updateSelectedCategoryIcon(){
  const selected=iconLibrary.find(item=>item.icon===selectedCategoryIcon);
  $("categoryIconPreview").textContent=selectedCategoryIcon;
  $("categoryIconName").textContent=selected?selected.name:"Ícone selecionado";
}
function renderCategoryManager(){
  const list=$("customCategoryList"),categories=state.customCategories;
  if(!categories.length){list.innerHTML='<div class="empty-state">Nenhuma categoria personalizada ainda.</div>';return;}
  list.innerHTML=categories.map(category=>{
    const status=category.active?"Personalizada":category.archived?"Histórico preservado":"Arquivada";
    const classification=category.type==="income"?"Receita":expenseGroupLabels[category.expenseGroup];
    return `<article class="custom-category-row${category.active?"":" custom-category-archived"}"><span class="custom-category-icon" aria-hidden="true">${escapeHTML(category.icon)}</span><div class="custom-category-info"><strong>${escapeHTML(category.name)}</strong><span>${status} · ${category.type==="income"?"Receita":"Despesa · "+escapeHTML(classification)}</span></div><div class="custom-category-actions">${category.active?`<button type="button" data-edit-category="${escapeHTML(category.id)}">Editar</button>`:""}<button type="button" class="category-remove" data-delete-category="${escapeHTML(category.id)}">Excluir</button></div></article>`;
  }).join("");
  list.querySelectorAll("[data-edit-category]").forEach(button=>button.addEventListener("click",()=>openCategoryEditor(button.dataset.editCategory)));
  list.querySelectorAll("[data-delete-category]").forEach(button=>button.addEventListener("click",()=>openCategoryDelete(button.dataset.deleteCategory)));
}
function refreshOpenCategorySelectors(){
  if($("entryDialog").open){
    const type=$("entryType").value,selected=$("entryCategory").value,group=$("entryBudgetGroup").value;
    const keepSelected=categoriesForType(type,selected).some(item=>item.name===selected);
    renderEntryCategories(type,keepSelected?selected:undefined,group);
  }
  if($("billDialog").open){
    const selected=$("billCategory").value;
    const keepSelected=categoriesForType("expense",selected).some(item=>item.name===selected);
    renderBillCategories(keepSelected?selected:undefined);
  }
}
function openCategoryManager(){
  categoryReturnToEntry=$("entryDialog").open;
  renderCategoryManager();
  if(!$("categoryManagerDialog").open)$("categoryManagerDialog").showModal();
}
function openCategoryEditor(id=null,type="expense"){
  const category=id===null?null:state.customCategories.find(item=>item.id===String(id));
  if(id!==null&&!category){toast("Esta categoria não foi encontrada.");return;}
  editCategoryId=category?category.id:null;
  $("categoryFormTitle").textContent=category?"Editar categoria":"Adicionar categoria";
  $("categoryFormEyebrow").textContent=category?"EDITAR CATEGORIA":"NOVA CATEGORIA";
  $("categorySubmitBtn").textContent=category?"Salvar alterações":"Salvar categoria";
  $("categoryName").value=category?category.name:"";
  $("categoryType").value=category?category.type:type;
  $("categoryType").disabled=Boolean(category&&categoryReferences(category).total);
  $("categoryExpenseGroup").value=category&&category.type==="expense"?category.expenseGroup:"nonessential";
  selectedCategoryIcon=category?category.icon:"📌";
  $("categoryIconSearch").value="";
  $("categoryFormNote").textContent=category&&categoryReferences(category).total
    ?"Editar nome, ícone ou classificação afeta novas sugestões. Lançamentos, contas e classificações existentes permanecem intactos."
    :"A classificação da categoria será sugerida em novos lançamentos. Registros existentes preservam seus dados e classificações.";
  updateCategoryEditorType();
  updateSelectedCategoryIcon();
  renderCategoryIconLibrary();
  $("categoryEditorDialog").showModal();
  setTimeout(()=>$("categoryName").focus(),100);
}
function updateCategoryEditorType(){
  const isExpense=$("categoryType").value==="expense";
  $("categoryExpenseGroupField").hidden=!isExpense;
  $("categoryTypeNote").hidden=isExpense;
}
function openCategoryDelete(id){
  const category=state.customCategories.find(item=>item.id===String(id));
  if(!category){toast("Esta categoria não foi encontrada.");return;}
  pendingCategoryDeleteId=category.id;
  const references=categoryReferences(category),alternatives=categoriesForType(category.type).filter(item=>item.name!==category.name);
  $("categoryDeleteMessage").textContent=references.total
    ?`“${category.name}” está vinculada a ${references.entries.length} lançamento(s), ${references.bills.length} conta(s) e ${references.series.length} recorrência(s). Você pode arquivá-la no histórico ou reclassificar esses registros.`
    :`“${category.name}” não está vinculada a lançamentos nem contas e será removida.`;
  $("categoryDeleteChoices").hidden=references.total===0;
  const replacement=$("categoryReplacement"),reclassifyOption=$("categoryDeleteChoices").querySelector('[value="reclassify"]');
  replacement.innerHTML=alternatives.map(item=>`<option value="${escapeHTML(item.name)}">${escapeHTML(item.icon)} ${escapeHTML(item.name)}</option>`).join("");
  reclassifyOption.closest("label").hidden=alternatives.length===0;
  replacement.disabled=alternatives.length===0;
  $("categoryDeleteChoices").querySelector('[value="archive"]').checked=true;
  $("categoryDeleteChoices").querySelector('[value="reclassify"]').disabled=alternatives.length===0;
  if(!$("categoryDeleteDialog").open)$("categoryDeleteDialog").showModal();
}
function reclassifyCategoryReferences(category,replacement){
  categoryReferences(category).entries.forEach(entry=>{
    entry.category=replacement.name;
    if(entry.type==="expense"){
      const linkedBill=billForEntry(entry);
      entry.expenseGroup=linkedBill&&linkedBill.seriesKind==="fixed"?"fixed":defaultExpenseGroup(replacement.name);
    }
  });
  state.bills.forEach(bill=>{if(bill.category===category.name)bill.category=replacement.name;});
  state.billSeries.forEach(series=>{if(series.category===category.name)series.category=replacement.name;});
}
function openEntry(type){
  editEntryId=null;
  $("entryTypeField").hidden=true;
  $("entryType").value=type;$("formTitle").textContent=type==="income"?"Adicionar ganho":"Adicionar gasto";
  $("formEyebrow").textContent=type==="income"?"NOVA ENTRADA":"NOVO GASTO";
  renderEntryCategories(type);
  $("entryForm").querySelector('[type="submit"]').textContent="Salvar lançamento";
  $("entryDate").value=todayISO();$("entryAmount").value="";$("entryNote").value="";
  $("entryDialog").showModal();setTimeout(()=>$("entryAmount").focus(),100);
}
function renderEntryCategories(type,selectedCategory,selectedGroup){
  const categories=categoriesForType(type,selectedCategory);
  $("entryCategory").innerHTML=categories.map(category=>`<option value="${escapeHTML(category.name)}">${escapeHTML(category.icon)} ${escapeHTML(category.name)}</option>`).join("");
  if(selectedCategory&&categories.some(category=>category.name===selectedCategory))$("entryCategory").value=selectedCategory;
  $("entryBudgetGroupField").hidden=type!=="expense";
  if(type==="expense"){
    const group=expenseGroups.includes(selectedGroup)?selectedGroup:defaultExpenseGroup($("entryCategory").value);
    $("entryBudgetGroup").value=group;
  }
}
function openEditEntry(id){
  const entry=state.entries.find(item=>String(item.id)===String(id));
  if(!entry){toast("Este lançamento não foi encontrado.");return;}
  editEntryId=String(entry.id);
  $("entryTypeField").hidden=false;
  $("entryType").value=entry.type;
  $("formTitle").textContent="Editar lançamento";
  $("formEyebrow").textContent="EDITAR LANÇAMENTO";
  renderEntryCategories(entry.type,entry.category,entry.expenseGroup);
  $("entryDate").value=entry.date;
  $("entryAmount").value=entry.amount;
  $("entryNote").value=entry.note||"";
  $("entryForm").querySelector('[type="submit"]').textContent="Salvar alterações";
  $("entryDialog").showModal();
  setTimeout(()=>$("entryAmount").focus(),100);
}
function syncTransferDirection(){
  const direction=$("transferDirection").value;
  $("transferTitle").textContent=direction==="save"?"Guardar dinheiro":"Resgatar dinheiro";
}
function openTransferForm(direction,transferId=null){
  const transfer=transferId===null?null:state.transfers.find(item=>String(item.id)===String(transferId));
  if(transferId!==null&&!transfer){toast("Esta transferência não foi encontrada.");return;}
  editTransferId=transfer?String(transfer.id):null;
  $("transferEyebrow").textContent=transfer?"EDITAR TRANSFERÊNCIA":"NOVA TRANSFERÊNCIA";
  $("transferDirection").value=transfer?transfer.direction:direction;
  syncTransferDirection();
  $("transferSubmit").textContent=transfer?"Salvar alterações":"Salvar transferência";
  $("transferAmount").value=transfer?transfer.amount:"";
  $("transferDate").value=transfer?transfer.date:todayISO();
  $("transferDate").max=todayISO();
  $("transferDescription").value=transfer?transfer.description||"":"";
  $("transferDialog").showModal();
}
function openTransferEdit(id){openTransferForm(null,id);}
$("addCategoryBtn").addEventListener("click",()=>{
  categoryReturnToEntry=true;
  openCategoryEditor(null,$("entryType").value);
});
$("manageCategoriesBtn").addEventListener("click",openCategoryManager);
$("managerAddCategoryBtn").addEventListener("click",()=>{
  openCategoryEditor(null,$("entryDialog").open?$("entryType").value:"expense");
});
$("categoryType").addEventListener("change",updateCategoryEditorType);
$("categoryIconSearch").addEventListener("input",renderCategoryIconLibrary);
$("categoryForm").addEventListener("submit",event=>{
  event.preventDefault();
  const name=$("categoryName").value.trim(),type=$("categoryType").value;
  if(!name||!["income","expense"].includes(type)){toast("Informe um nome e tipo de categoria válidos.");return;}
  if(categoryNameExists(name,editCategoryId)){toast("Já existe uma categoria com esse nome.");return;}
  const existing=editCategoryId===null?null:state.customCategories.find(item=>item.id===editCategoryId);
  if(editCategoryId!==null&&!existing){toast("Esta categoria não foi encontrada.");return;}
  const references=existing?categoryReferences(existing):{total:0};
  if(existing&&references.total&&existing.type!==type){toast("Não é possível alterar o tipo de uma categoria já utilizada.");return;}
  const oldName=existing?existing.name:"";
  if(existing&&name!==oldName&&references.total){
    state.customCategories.push({...existing,id:makeId(),active:false,archived:true});
  }
  const savedCategory={
    id:existing?existing.id:makeId(),name,type,icon:selectedCategoryIcon,
    expenseGroup:type==="expense"?$("categoryExpenseGroup").value:null,active:true,archived:false
  };
  if(existing)Object.assign(existing,savedCategory);
  else state.customCategories.push(savedCategory);
  saveState();
  $("categoryEditorDialog").close();editCategoryId=null;
  render();renderCategoryManager();
  if($("entryDialog").open&&type===$("entryType").value
    &&(categoryReturnToEntry||$("entryCategory").value===oldName)){
    renderEntryCategories(type,savedCategory.name,savedCategory.expenseGroup);
    if(type==="expense")$("entryBudgetGroup").value=savedCategory.expenseGroup;
  }
  refreshOpenCategorySelectors();
  toast(existing?"Categoria atualizada.":"Categoria criada.");
});
$("categoryDeleteChoices").addEventListener("change",()=>{
  const mode=$("categoryDeleteChoices").querySelector('[name="categoryDeleteMode"]:checked').value;
  $("categoryReplacement").disabled=mode!=="reclassify"||!$("categoryReplacement").options.length;
});
$("confirmCategoryDelete").addEventListener("click",()=>{
  const category=state.customCategories.find(item=>item.id===pendingCategoryDeleteId);
  if(!category){$("categoryDeleteDialog").close();pendingCategoryDeleteId=null;toast("Esta categoria não foi encontrada.");return;}
  const references=categoryReferences(category),mode=$("categoryDeleteChoices").querySelector('[name="categoryDeleteMode"]:checked').value;
  if(references.total&&mode==="reclassify"){
    const replacement=categoriesForType(category.type).find(item=>item.name===$("categoryReplacement").value);
    if(!replacement){toast("Selecione uma categoria de destino válida.");return;}
    reclassifyCategoryReferences(category,replacement);
    state.customCategories=state.customCategories.filter(item=>item.id!==category.id);
  }else if(references.total){
    category.active=false;category.archived=true;
  }else{
    state.customCategories=state.customCategories.filter(item=>item.id!==category.id);
  }
  saveState();pendingCategoryDeleteId=null;$("categoryDeleteDialog").close();
  render();renderCategoryManager();refreshOpenCategorySelectors();
  toast(references.total&&mode!=="reclassify"?"Categoria arquivada; o histórico foi preservado.":"Categoria excluída.");
});
$("entryType").addEventListener("change",()=>renderEntryCategories($("entryType").value));
$("entryCategory").addEventListener("change",()=>{
  if($("entryType").value==="expense")
    $("entryBudgetGroup").value=defaultExpenseGroup($("entryCategory").value);
});
$("addIncome").addEventListener("click",()=>openEntry("income"));
$("addExpense").addEventListener("click",()=>openEntry("expense"));
$("entryForm").addEventListener("submit",e=>{
  e.preventDefault();const amount=Number($("entryAmount").value);
  if(!Number.isFinite(amount)||amount<=0){toast("Digite um valor válido.");return;}
  const type=$("entryType").value;
  const updatedFields={type,amount:Math.round(amount*100)/100,category:$("entryCategory").value,
    expenseGroup:type==="expense"?$("entryBudgetGroup").value:null,
    date:$("entryDate").value,note:$("entryNote").value.trim()};
  if(editEntryId!==null){
    const index=state.entries.findIndex(entry=>String(entry.id)===editEntryId);
    if(index<0){toast("Este lançamento não foi encontrado.");return;}
    const original=state.entries[index],linkedBill=billForEntry(original),updatedEntry={...original,...updatedFields};
    if(linkedBill&&type==="expense"){
      updatedEntry.sourceBillId=linkedBill.id;
      updatedEntry.expenseGroup=linkedBill.seriesKind==="fixed"||defaultExpenseGroup(updatedFields.category)==="fixed"
        ?"fixed":updatedFields.expenseGroup;
      Object.assign(linkedBill,{amount:updatedFields.amount,category:updatedFields.category,status:"paid",
        paidAt:updatedFields.date,paymentEntryId:original.id});
    }else if(linkedBill){
      delete updatedEntry.sourceBillId;
      Object.assign(linkedBill,{status:"pending",paidAt:null,paymentEntryId:null});
    }
    state.entries[index]=updatedEntry;
    saveState();$("entryDialog").close();editEntryId=null;render();toast("Lançamento atualizado!");
    return;
  }
  state.entries.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),...updatedFields,createdAt:Date.now()});
  saveState();$("entryDialog").close();render();toast("Lançamento salvo!");
});
$("addSavingTransfer").addEventListener("click",()=>openTransferForm("save"));
$("addWithdrawalTransfer").addEventListener("click",()=>openTransferForm("withdraw"));
$("transferDirection").addEventListener("change",syncTransferDirection);
$("transferForm").addEventListener("submit",e=>{
  e.preventDefault();
  const amount=roundMoney(Number($("transferAmount").value)),date=$("transferDate").value,direction=$("transferDirection").value;
  if(!Number.isFinite(amount)||amount<=0||!isValidISODate(date)||date>todayISO()||!["save","withdraw"].includes(direction)){
    toast("Informe tipo, valor e data válidos para a transferência.");return;
  }
  const previous=editTransferId===null?null:state.transfers.find(item=>String(item.id)===editTransferId);
  if(editTransferId!==null&&!previous){toast("Esta transferência não foi encontrada.");return;}
  const transfer={
    id:previous?previous.id:makeId(),direction,amount,date,
    description:$("transferDescription").value.trim(),createdAt:nextRecordTime()
  };
  const nextTransfers=state.transfers.filter(item=>String(item.id)!==String(transfer.id));
  nextTransfers.push(transfer);
  const error=transferSequenceError(nextTransfers);
  if(error){toast(error);return;}
  state.transfers=nextTransfers;
  const currentSavings=savingsAt(todayISO());
  if(currentSavings!==null)state.savings=currentSavings;
  saveState();$("transferDialog").close();editTransferId=null;render();
  toast(previous?"Transferência atualizada!":"Transferência registrada!");
});
$("editSavings").addEventListener("click",()=>{
  const currentSavings=savingsAt(todayISO());
  $("savingsInput").value=(currentSavings===null?state.savings:currentSavings).toFixed(2);
  $("savingsDateInput").value=todayISO();
  $("savingsDateInput").max=todayISO();
  $("savingsDialog").showModal();
});
$("savingsForm").addEventListener("submit",e=>{
  e.preventDefault();
  const amount=Number($("savingsInput").value),date=$("savingsDateInput").value;
  if(!Number.isFinite(amount)||amount<0||!isValidISODate(date)||date>todayISO()){toast("Informe um valor e uma data válidos.");return;}
  const recordedAt=nextRecordTime(),includedTransfers={};
  state.transfers.forEach(transfer=>{
    if(eventBefore(transfer.date,transfer.createdAt,date,recordedAt))includedTransfers[transfer.id]=transferSavingsDelta(transfer);
  });
  const snapshot={date,amount:roundMoney(amount),recordedAt,includedTransfers};
  const nextHistory=state.savingsHistory.filter(item=>item.date!==date);
  nextHistory.push(snapshot);
  nextHistory.sort((a,b)=>a.date.localeCompare(b.date)||a.recordedAt-b.recordedAt);
  const previousHistory=state.savingsHistory;
  state.savingsHistory=nextHistory;
  const error=transferSequenceError(state.transfers,nextHistory);
  if(error){state.savingsHistory=previousHistory;toast(error);return;}
  const latest=savingsAt(todayISO());
  if(latest!==null)state.savings=latest;
  saveState();$("savingsDialog").close();render();toast("Histórico do dinheiro guardado atualizado!");
});
$("editInitialBalance").addEventListener("click",()=>{
  $("initialBalanceInput").value=state.initialBalance.toFixed(2);
  $("balanceReferenceDateInput").value=state.balanceReferenceDate;
  $("balanceReferenceDateInput").max=todayISO();
  $("initialBalanceDialog").showModal();
});
$("initialBalanceForm").addEventListener("submit",e=>{
  e.preventDefault();const n=Number($("initialBalanceInput").value);
  const date=$("balanceReferenceDateInput").value;
  if(!Number.isFinite(n)||!isValidISODate(date)||date>todayISO()){toast("Informe um saldo e uma data de referência válidos.");return;}
  const previousBalance=state.initialBalance,previousDate=state.balanceReferenceDate;
  state.initialBalance=Math.round(n*100)/100;
  state.balanceReferenceDate=date;
  const transferError=transferSequenceError(state.transfers);
  if(transferError){state.initialBalance=previousBalance;state.balanceReferenceDate=previousDate;toast(transferError);return;}
  state.balanceReferenceConfirmed=true;
  saveState();$("initialBalanceDialog").close();render();toast("Saldo inicial e data de referência atualizados!");
});
$("editMonthlyLimit").addEventListener("click",()=>{$("monthlyLimitInput").value=state.monthlyLimit===null?"":state.monthlyLimit.toFixed(2);$("monthlyLimitDialog").showModal();});
$("monthlyLimitForm").addEventListener("submit",e=>{
  e.preventDefault();const value=$("monthlyLimitInput").value.trim();
  if(value==="")state.monthlyLimit=null;
  else{
    const n=Number(value);
    if(!Number.isFinite(n)||n<0){toast("Digite um limite mensal válido.");return;}
    state.monthlyLimit=Math.round(n*100)/100;
  }
  saveState();$("monthlyLimitDialog").close();render();toast(state.monthlyLimit===null?"Limite mensal removido.":"Limite mensal atualizado!");
});
$("editSmartBudget").addEventListener("click",()=>{
  const budget=ensureSmartBudget(selectedMonth);
  $("smartBudgetDialogTitle").textContent=`Orçamento de ${formatMonth(selectedMonth)}`;
  $("smartBudgetDialogRecommended").textContent=money(budget.recommended);
  $("smartBudgetManualInput").value=budget.manualLimit===null?"":budget.manualLimit.toFixed(2);
  $("smartBudgetSafetyReserveInput").value=budget.safetyReserve.toFixed(2);
  $("smartBudgetDialog").showModal();
});
$("smartBudgetForm").addEventListener("submit",event=>{
  event.preventDefault();
  const value=$("smartBudgetManualInput").value.trim();
  const reserveValue=$("smartBudgetSafetyReserveInput").value.trim();
  let manualLimit=null;
  if(value!==""){
    const amount=Number(value);
    if(!Number.isFinite(amount)||amount<0){toast("Informe um limite igual ou maior que zero.");return;}
    manualLimit=roundMoney(amount);
  }
  const safetyReserve=Number(reserveValue);
  if(!Number.isFinite(safetyReserve)||safetyReserve<0){toast("Informe uma reserva de segurança igual ou maior que zero.");return;}
  const calculated=calculateSmartBudget(selectedMonth,safetyReserve);
  state.smartBudgets[selectedMonth]={...calculated,manualLimit,safetyReserve:roundMoney(safetyReserve)};
  saveState();$("smartBudgetDialog").close();render();
  toast(manualLimit===null?"Limite recomendado restaurado.":"Limite manual salvo para este mês.");
});
function renderBillCategories(selectedCategory){
  const categories=categoriesForType("expense",selectedCategory);
  $("billCategory").innerHTML=categories.map(category=>`<option value="${escapeHTML(category.name)}">${escapeHTML(category.icon)} ${escapeHTML(category.name)}</option>`).join("");
  if(selectedCategory&&categories.some(category=>category.name===selectedCategory))$("billCategory").value=selectedCategory;
}
function updateBillFormFields(){
  const bill=editBillId===null?null:state.bills.find(item=>String(item.id)===editBillId);
  const type=bill?bill.seriesKind||"single":$("billType").value;
  const creating=editBillId===null;
  const fixed=type==="fixed",installment=type==="installment";
  $("billTypeField").hidden=!creating;
  $("billDueDayField").hidden=!creating||!fixed;
  $("billInstallmentFields").hidden=!creating||!installment;
  $("billDueDateField").hidden=creating&&fixed;
  $("billDueDate").required=!(creating&&fixed);
  $("billDueDay").required=creating&&fixed;
  $("billInstallmentCount").required=creating&&installment;
  $("billFrequency").required=creating&&installment;
  $("billEditScopeField").hidden=!(bill&&billStatus(bill)!=="paid"&&bill.seriesKind==="fixed"&&state.billSeries.some(series=>String(series.id)===String(bill.seriesId)&&series.active));
  $("billAmountLabel").textContent=creating&&installment?"Valor total da compra (R$)":bill&&bill.seriesKind==="installment"?"Valor desta parcela (R$)":"Valor (R$)";
  $("billDueDateLabel").textContent=creating&&installment?"Primeiro vencimento":"Data de vencimento";
}
function firstMonthlyDueDate(day){
  const today=todayISO(),currentMonth=monthKey(today);
  return dateForMonthDay(Number(today.slice(8,10))<=day?currentMonth:monthAfter(currentMonth,1),day);
}
function openBillForm(){
  editBillId=null;
  $("billFormTitle").textContent="Adicionar conta";
  $("billFormEyebrow").textContent="NOVA CONTA";
  $("billType").value="single";
  $("billName").value="";
  $("billAmount").value="";
  $("billDueDate").value=todayISO();
  $("billDueDay").value=String(Number(todayISO().slice(8,10)));
  $("billInstallmentCount").value="3";
  $("billFrequency").value="monthly";
  $("billEditScope").value="occurrence";
  $("billCategory").value="";
  renderBillCategories("Contas");
  $("billDescription").value="";
  $("billSubmit").textContent="Salvar conta";
  updateBillFormFields();
  $("billDialog").showModal();
}
function openBillEdit(id){
  const bill=state.bills.find(item=>String(item.id)===String(id));
  if(!bill){toast("Esta conta não foi encontrada.");return;}
  editBillId=String(bill.id);
  $("billFormTitle").textContent="Editar conta";
  $("billFormEyebrow").textContent="EDITAR CONTA";
  $("billType").value=bill.seriesKind||"single";
  $("billName").value=bill.name;
  $("billAmount").value=bill.amount;
  $("billDueDate").value=bill.dueDate;
  $("billDueDay").value=String(bill.recurringDay||Number(bill.dueDate.slice(8,10)));
  $("billInstallmentCount").value=String(bill.installmentCount||3);
  $("billFrequency").value=bill.frequency||"monthly";
  $("billEditScope").value="occurrence";
  renderBillCategories(bill.category);
  $("billDescription").value=bill.description||"";
  $("billSubmit").textContent="Salvar alterações";
  updateBillFormFields();
  $("billDialog").showModal();
}
$("addBill").addEventListener("click",openBillForm);
$("billType").addEventListener("change",updateBillFormFields);
$("billForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("billName").value.trim(),inputAmount=Number($("billAmount").value);
  const type=editBillId===null?$("billType").value:(state.bills.find(bill=>String(bill.id)===editBillId)||{}).seriesKind||"single";
  const description=$("billDescription").value.trim(),category=$("billCategory").value;
  const fixed=type==="fixed",installment=type==="installment";
  if(!name||!Number.isFinite(inputAmount)||inputAmount<=0||!["single","fixed","installment"].includes(type)){
    toast("Preencha nome e valor válidos.");return;
  }
  const dueDay=fixed&&editBillId===null?Number($("billDueDay").value):null;
  const dueDate=fixed&&editBillId===null?firstMonthlyDueDate(dueDay):$("billDueDate").value;
  if(!isValidISODate(dueDate)||fixed&&editBillId===null&&(!Number.isInteger(dueDay)||dueDay<1||dueDay>31)){
    toast("Informe uma data ou dia de vencimento válido.");return;
  }
  const amount=roundMoney(inputAmount);
  const installmentCount=Number($("billInstallmentCount").value),frequency=$("billFrequency").value;
  if(installment&&editBillId===null&&(!Number.isInteger(installmentCount)||installmentCount<1||installmentCount>120||!["monthly","biweekly","weekly"].includes(frequency)||Math.round(amount*100)<installmentCount)){
    toast("Informe parcelas válidas; cada parcela precisa ter pelo menos R$ 0,01.");return;
  }
  const index=editBillId===null?-1:state.bills.findIndex(bill=>String(bill.id)===editBillId);
  if(editBillId!==null&&index<0){toast("Esta conta não foi encontrada.");return;}
  const current=index<0?null:state.bills[index];
  if(current&&current.seriesKind==="fixed"&&monthKey(dueDate)!==monthKey(current.dueDate)){
    toast("Para manter a recorrência sem duplicar vencimentos, escolha uma data no mesmo mês.");return;
  }
  const fields={name,amount,category,description};
  let paidEntryMissing=false;
  if(current){
    const paidEntry=billStatus(current)==="paid"?billPaymentEntry(current):null;
    paidEntryMissing=billStatus(current)==="paid"&&!paidEntry;
    if(current.seriesKind==="fixed"&&billStatus(current)!=="paid"&&$("billEditScope").value==="future"){
      const series=state.billSeries.find(item=>String(item.id)===String(current.seriesId));
      if(!series||!series.active){toast("Esta recorrência não está ativa.");return;}
      const newDay=$("billDueDate").value===current.dueDate
        ?Number(current.recurringDay)||Number(dueDate.slice(8,10))
        :Number(dueDate.slice(8,10));
      Object.assign(series,{name,amount,category,description,dueDay:newDay});
      state.bills.forEach(bill=>{
        if(String(bill.seriesId)!==String(series.id)||bill.cancelled||billStatus(bill)==="paid"||bill.dueDate<current.dueDate)return;
        Object.assign(bill,fields,{dueDate:dateForMonthDay(monthKey(bill.dueDate),newDay),recurringDay:newDay});
      });
    }else{
      Object.assign(current,fields,{dueDate});
    }
    if(paidEntry){
      paidEntry.amount=amount;
      paidEntry.category=category;
      paidEntry.expenseGroup=current.seriesKind==="fixed"?"fixed":defaultExpenseGroup(category);
      paidEntry.note=`${name}${description?` - ${description}`:""}`.slice(0,70);
    }
  }else if(fixed){
    const seriesId=makeId();
    state.billSeries.push({id:seriesId,kind:"fixed",...fields,startDate:dueDate,dueDay,frequency:"monthly",active:true});
  }else if(installment){
    const seriesId=makeId();
    state.billSeries.push({id:seriesId,kind:"installment",...fields,totalAmount:amount,firstDueDate:dueDate,installmentCount,frequency,active:true});
  }else{
    state.bills.push({
      id:makeId(),...fields,dueDate,recurringMonthly:false,recurringGroupId:null,recurringDay:null,
      seriesId:null,seriesKind:null,occurrenceKey:null,installmentNumber:null,installmentCount:null,
      status:"pending",paidAt:null,paymentEntryId:null
    });
  }
  selectedMonth=monthKey(dueDate);
  saveState();$("billDialog").close();editBillId=null;render();
  toast(current?(paidEntryMissing?"Conta atualizada, mas a despesa vinculada não foi encontrada.":"Conta atualizada."):"Conta cadastrada.");
});
function openBillPayment(id){
  const bill=state.bills.find(item=>String(item.id)===String(id));
  if(!bill){toast("Esta conta não foi encontrada.");return;}
  const existing=state.entries.find(entry=>String(entry.sourceBillId)===String(bill.id));
  if(billStatus(bill)==="paid"||bill.paymentEntryId||existing){
    if(existing){bill.status="paid";bill.paidAt=existing.date;bill.paymentEntryId=existing.id;saveState();render();}
    toast("Este pagamento já foi registrado.");
    return;
  }
  pendingBillPaymentId=String(bill.id);
  const amount=state.hiddenValues[`bill:${bill.id}`]?"R$ ****":money(bill.amount);
  $("billPaymentMessage").textContent=`“${bill.name}” (${amount}) será registrada como despesa na data de hoje.`;
  $("billPaymentDialog").showModal();
}
$("confirmBillPayment").addEventListener("click",()=>{
  if(pendingBillPaymentId===null){$("billPaymentDialog").close();return;}
  state=loadState();
  const bill=state.bills.find(item=>String(item.id)===String(pendingBillPaymentId));
  if(!bill){$("billPaymentDialog").close();pendingBillPaymentId=null;toast("Esta conta não foi encontrada.");return;}
  const existing=state.entries.find(entry=>String(entry.sourceBillId)===String(bill.id));
  if(billStatus(bill)==="paid"||bill.paymentEntryId||existing){
    if(existing){bill.status="paid";bill.paidAt=existing.date;bill.paymentEntryId=existing.id;saveState();}
    $("billPaymentDialog").close();pendingBillPaymentId=null;render();toast("Este pagamento já foi registrado.");return;
  }
  const paymentDate=todayISO(),entry={
    id:makeId(),type:"expense",amount:Number(bill.amount),category:bill.category,
    expenseGroup:bill.seriesKind==="fixed"?"fixed":defaultExpenseGroup(bill.category),
    date:paymentDate,note:`${bill.name}${bill.description?` - ${bill.description}`:""}`.slice(0,70),
    createdAt:Date.now(),sourceBillId:bill.id
  };
  state.entries.push(entry);
  bill.status="paid";bill.paidAt=paymentDate;bill.paymentEntryId=entry.id;
  selectedMonth=monthKey(paymentDate);
  saveState();$("billPaymentDialog").close();pendingBillPaymentId=null;render();toast("Pagamento registrado como despesa.");
});
$("confirmBillDelete").addEventListener("click",()=>{
  const bill=state.bills.find(item=>String(item.id)===String(pendingBillDeleteId));
  if(!bill){toast("Esta conta não foi encontrada.");}
  else{
    const wasPaid=billStatus(bill)==="paid";
    let paymentFound=false;
    if(wasPaid){
      const payment=billPaymentEntry(bill);
      if(payment){state.entries=state.entries.filter(entry=>String(entry.id)!==String(payment.id));paymentFound=true;}
    }
    if(bill.seriesId)bill.cancelled=true;
    else state.bills=state.bills.filter(item=>String(item.id)!==String(pendingBillDeleteId));
    saveState();render();
    toast(wasPaid?(paymentFound?"Conta e despesa associada excluídas.":"Conta paga excluída; não havia despesa vinculada.")
      :bill.seriesId?"Ocorrência excluída.":"Conta excluída.");
  }
  $("billDeleteDialog").close();pendingBillDeleteId=null;
});
function cancelFixedSeries(scope){
  const series=state.billSeries.find(item=>String(item.id)===String(pendingBillCancelSeriesId)&&item.kind==="fixed");
  const currentMonth=monthKey(todayISO()),startMonth=pendingBillCancelMonth;
  if(!series||!startMonth){toast("Esta recorrência não foi encontrada.");}
  else if(startMonth<currentMonth){toast("Recorrências passadas não podem ser alteradas.");}
  else if(scope==="month"){
    const occurrence=state.bills.find(bill=>String(bill.seriesId)===String(series.id)&&bill.occurrenceKey===startMonth);
    if(!occurrence||billStatus(occurrence)==="paid")toast("A conta deste mês não pode ser cancelada.");
    else{occurrence.cancelled=true;saveState();render();toast(`Conta de ${formatMonth(startMonth)} cancelada; os meses seguintes foram mantidos.`);}
  }else{
    series.active=false;
    state.bills.forEach(bill=>{
      if(String(bill.seriesId)===String(series.id)&&monthKey(bill.dueDate)>=startMonth&&billStatus(bill)!=="paid")bill.cancelled=true;
    });
    saveState();render();toast(`Recorrência cancelada a partir de ${formatMonth(startMonth)}; meses anteriores e pagamentos foram mantidos.`);
  }
  $("billCancelDialog").close();pendingBillCancelSeriesId=null;pendingBillCancelMonth=null;
}
$("cancelSeriesThisMonth").addEventListener("click",()=>cancelFixedSeries("month"));
$("cancelSeriesThisAndFuture").addEventListener("click",()=>cancelFixedSeries("future"));
$("prevMonth").addEventListener("click",()=>changeMonth(-1));
$("nextMonth").addEventListener("click",()=>changeMonth(1));
function changeMonth(delta){const [y,m]=selectedMonth.split("-").map(Number);const d=new Date(y,m-1+delta,1);selectedMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;render();}
$("confirmDelete").addEventListener("click",()=>{
  if(!pendingDelete){$("confirmDialog").close();return;}
  if(pendingDelete.type==="transfer"){
    const remaining=state.transfers.filter(item=>String(item.id)!==String(pendingDelete.id));
    const transferError=transferSequenceError(remaining);
    if(transferError){pendingDelete=null;$("confirmDialog").close();toast(`Não foi possível excluir: ${transferError}`);return;}
    state.transfers=remaining;
    const currentSavings=savingsAt(todayISO());
    if(currentSavings!==null)state.savings=currentSavings;
    saveState();pendingDelete=null;$("confirmDialog").close();render();toast("Transferência excluída e saldos recalculados.");return;
  }
  const removedEntry=state.entries.find(entry=>String(entry.id)===String(pendingDelete.id));
  const linkedBill=removedEntry&&billForEntry(removedEntry);
  if(linkedBill)Object.assign(linkedBill,{status:"pending",paidAt:null,paymentEntryId:null});
  state.entries=state.entries.filter(entry=>String(entry.id)!==String(pendingDelete.id));
  pendingDelete=null;saveState();$("confirmDialog").close();render();toast("Lançamento excluído.");
});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).close()));
$("backupBtn").addEventListener("click",()=>{$("backupMessage").textContent="";$("backupDialog").showModal();});
$("exportBtn").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`backup-meu-controle-${todayISO()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$("backupMessage").textContent="Backup baixado com sucesso.";
});
$("importFile").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  try{const data=JSON.parse(await file.text());if(!Array.isArray(data.entries))throw new Error("Formato inválido");
    if(!confirm("Isso vai substituir os registros atuais. Deseja continuar?"))return;
    state=normalizeState(data);
    saveState();storageWarning="";render();$("backupMessage").textContent="Backup restaurado.";toast("Dados restaurados!");
  }catch(err){$("backupMessage").textContent="Não foi possível ler esse arquivo de backup.";}finally{e.target.value="";}
});
let toastTimer;function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200);}
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
render();
