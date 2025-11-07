// Script para validar palavras da curadoria
const words = [
  'CARRO', 'PORTA', 'JANELA', 'CADEIRA', 'PRATO', 'COPO', 'GARFO', 'FACA', 'MESA',
  'SOFA', 'CAMA', 'BANHO', 'DENTE', 'CORPO', 'BRAÇO', 'OLHOS', 'BOCA', 'NARIZ',
  'MANHA', 'TARDE', 'NOITE', 'ONTEM', 'HOJE', 'AMANHA', 'TEMPO', 'CLIMA', 'CALOR',
  'FRIO', 'CHUVA', 'VENTO', 'TERRA', 'PEDRA', 'AGUA', 'FOGO', 'PLANTA', 'FLOR',
  'ARROZ', 'FEIJAO', 'CARNE', 'PEIXE', 'FRANGO', 'LEITE', 'QUEIJO', 'OVOS', 'PAES',
  'BOLO', 'TORTA', 'DOCE', 'SUCO', 'CAFE', 'VINHO', 'CERVEJA', 'PIZZA', 'MASSA',
  'SALADA', 'SOPA', 'FRUTAS', 'BANANA', 'MACA', 'LARANJA', 'MELAO', 'LIMAO', 'ABACAXI',
  'AMIGO', 'MAMAE', 'PAPAI', 'FILHO', 'FILHA', 'IRMAO', 'IRMA', 'PRIMO', 'PRIMA',
  'GENTE', 'POVO', 'GRUPO', 'TIME', 'TURMA', 'CASAL', 'NOIVO', 'NOIVA', 'BEBE',
  'CASA', 'PRAIA', 'CAMPO', 'CIDADE', 'VILA', 'LUGAR', 'BAIRRO', 'RUA', 'PRACA',
  'ESCOLA', 'IGREJA', 'BANCO', 'LOJA', 'FEIRA', 'PARQUE', 'CLUBE', 'CINEMA', 'TEATRO',
  'HOTEL', 'POUSADA', 'SITIO', 'FAZENDA', 'PREDIO', 'PONTE', 'PORTO', 'MORRO', 'SERRA',
  'ABRIR', 'FECHAR', 'FAZER', 'COMER', 'BEBER', 'DORMIR', 'ACORDAR', 'ANDAR', 'CORRER',
  'PULAR', 'SUBIR', 'DESCER', 'ENTRAR', 'SAIR', 'FICAR', 'VOLTAR', 'CHEGAR', 'PARTIR',
  'FALAR', 'DIZER', 'OUVIR', 'VER', 'OLHAR', 'PEGAR', 'DAR', 'TRAZER', 'LEVAR',
  'PENSAR', 'LEMBRAR', 'ESQUECER', 'SABER', 'QUERER', 'PODER', 'DEVER', 'AMAR', 'ODIAR',
  'GOSTAR', 'SENTIR', 'VIVER', 'MORRER', 'NASCER', 'CRESCER', 'MUDAR', 'VIRAR', 'PARAR',
  'FELIZ', 'TRISTE', 'BRAVO', 'CALMO', 'ALEGRE', 'CHATO', 'LEGAL', 'RUIM', 'BOM',
  'GRANDE', 'PEQUENO', 'ALTO', 'BAIXO', 'LARGO', 'FINO', 'GORDO', 'MAGRO', 'FORTE',
  'FRACO', 'RAPIDO', 'LENTO', 'NOVO', 'VELHO', 'JOVEM', 'LIMPO', 'SUJO', 'CLARO',
  'ESCURO', 'CHEIO', 'VAZIO', 'ABERTO', 'FECHADO', 'QUENTE', 'GELADO', 'DOCE', 'AMARGO',
  'DURO', 'MOLE', 'LISO', 'ASPERO', 'BONITO', 'FEIO', 'RICO', 'POBRE', 'FACIL', 'DIFICIL',
  'VERDE', 'AZUL', 'BRANCO', 'PRETO', 'ROXO', 'ROSA', 'CINZA', 'BEGE', 'MARROM',
  'ZERO', 'UM', 'DOIS', 'TRES', 'QUATRO', 'CINCO', 'SEIS', 'SETE', 'OITO', 'NOVE',
  'DEZ', 'CEM', 'MIL', 'MUITO', 'POUCO', 'TUDO', 'NADA', 'ALGUM', 'NENHUM', 'TODO',
  'AMOR', 'PAZ', 'GUERRA', 'VIDA', 'MORTE', 'SONHO', 'MEDO', 'SORTE', 'AZAR',
  'IDEIA', 'PLANO', 'RAZAO', 'CULPA', 'DIREITO', 'DEVER', 'HONRA', 'ORGULHO', 'VERGONHA',
  'FORCA', 'PODER', 'MAGIA', 'SORTE', 'DESTINO', 'FUTURO', 'PASSADO', 'PRESENTE', 'VERDADE',
  'MENTIRA', 'SEGREDO', 'HISTORIA', 'CONTO', 'FATO', 'CAUSA', 'EFEITO', 'ORDEM', 'CAOS',
  'LIVRO', 'PAPEL', 'CANETA', 'LAPIS', 'BORRACHA', 'TESOURA', 'COLA', 'FITA', 'CORDA',
  'CHAVE', 'CADEADO', 'COFRE', 'BOLSA', 'MALA', 'SACOLA', 'CAIXA', 'POTE', 'VIDRO',
  'FERRO', 'OURO', 'PRATA', 'COBRE', 'BRONZE', 'PEDRA', 'CRISTAL', 'VIDRO', 'PLASTICO',
  'MADEIRA', 'TECIDO', 'COURO', 'LINHA', 'AGULHA', 'BOTAO', 'ZIPER', 'ROUPA', 'SAPATO',
  'CACHORRO', 'GATO', 'PASSARO', 'PEIXE', 'CAVALO', 'VACA', 'PORCO', 'GALINHA', 'PATO',
  'ARVORE', 'FOLHA', 'GALHO', 'RAIZ', 'TRONCO', 'FRUTO', 'SEMENTE', 'GRAMA', 'MATO',
  'PRAIA', 'MAR', 'RIO', 'LAGO', 'ILHA', 'MONTANHA', 'VALE', 'DESERTO', 'FLORESTA',
  'CÉU', 'SOL', 'LUA', 'ESTRELA', 'NUVEM', 'RAIO', 'TROVAO', 'ARCO-IRIS', 'BRISA',
  'JOGO', 'FESTA', 'DANCA', 'MUSICA', 'CANTO', 'ARTE', 'PINTURA', 'FOTO', 'FILME',
  'ESPORTE', 'FUTEBOL', 'BOLA', 'REDE', 'PLACAR', 'VITORIA', 'DERROTA', 'EMPATE', 'REGRA',
  'VIAGEM', 'PASSEIO', 'TRILHA', 'CAMINHADA', 'CORRIDA', 'PULO', 'SALTO', 'MERGULHO', 'NADO',
  'TRABALHO', 'EMPREGO', 'OFICIO', 'CARGO', 'SALARIO', 'DINHEIRO', 'GRANA', 'MOEDA', 'NOTA',
  'ESCOLA', 'AULA', 'PROVA', 'NOTA', 'ALUNO', 'PROFESSOR', 'MESTRE', 'DOUTOR', 'DIPLOMA',
  'LIVRO', 'TEXTO', 'PALAVRA', 'LETRA', 'FRASE', 'PAGINA', 'CAPITULO', 'TITULO', 'AUTOR',
  'FALAR', 'DIZER', 'CONTAR', 'AVISAR', 'PEDIR', 'MANDAR', 'ORDEM', 'PEDIDO', 'RECADO',
  'TELEFONE', 'CELULAR', 'EMAIL', 'MENSAGEM', 'CARTA', 'BILHETE', 'CONVITE', 'AVISO', 'SINAL',
  'HORA', 'DIA', 'MES', 'ANO', 'SECULO', 'EPOCA', 'ERA', 'MOMENTO', 'INSTANTE',
  'METRO', 'QUILO', 'GRAMA', 'LITRO', 'DOSE', 'PEDACO', 'FATIA', 'PARTE', 'INTEIRO',
  'TERMO', 'TESTE', 'PROVA', 'EXAME', 'RESULTADO', 'NOTA', 'MEDIA', 'TOTAL', 'SOMA',
  'AJUDA', 'APOIO', 'SOCORRO', 'FAVOR', 'SERVICO', 'DICA', 'CONSELHO', 'SUGESTAO', 'OPINIAO',
  'PROBLEMA', 'SOLUCAO', 'RESPOSTA', 'DUVIDA', 'QUESTAO', 'ASSUNTO', 'TEMA', 'TOPICO', 'PONTO',
];

// Validar
const invalid = [];
const valid = [];

words.forEach(word => {
  // Verificar comprimento
  if (word.length !== 5) {
    invalid.push({ word, reason: `${word.length} letras` });
    return;
  }

  // Verificar caracteres especiais
  if (/[^A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/i.test(word)) {
    invalid.push({ word, reason: 'caracteres especiais' });
    return;
  }

  valid.push(word);
});

console.log(`\n✅ Palavras válidas: ${valid.length}`);
console.log(`❌ Palavras inválidas: ${invalid.length}\n`);

if (invalid.length > 0) {
  console.log('Palavras inválidas:');
  invalid.forEach(({ word, reason }) => {
    console.log(`  - "${word}" (${reason})`);
  });
}

// Remove duplicatas
const unique = [...new Set(valid)];
console.log(`\n📦 Palavras únicas: ${unique.length}`);
console.log(`🔁 Duplicadas removidas: ${valid.length - unique.length}`);
