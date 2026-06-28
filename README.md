# Contos do Vilarejo - Gerador de Personagens Web

Este é um aplicativo web interativo para criação e gerenciamento de fichas de personagens para o sistema de RPG **Contos do Vilarejo**. O aplicativo deve ser construído utilizando HTML5, CSS3 e JavaScript Vanilla (sem frameworks complexos, focado em manipulação de DOM limpa).

## 🚀 Repositório do Projeto
* **URL:** https://github.com/queirozcleiton/contos_do_vilarejo.git

---

## 📑 Regras do Sistema e Fluxo de Criação

### 1. Identificação Geral
* **Nome do Personagem:** Campo de entrada de texto.
* **História:** Campo de texto livre (textarea) para a biografia do personagem.

### 2. Seleção de Classe
O usuário deve escolher uma das 7 classes disponíveis:
* `Bibliotecário`, `Guerreiro`, `Fazendeiro`, `Domador`, `Fada`, `Bruxa`, `Sereia`.

#### 🔮 Regra de Magia (Condicional):
* Se a classe selecionada for **Fada, Bruxa ou Sereia**, o aplicativo deve exibir um campo de texto livre obrigatório para o jogador **escrever e criar seus próprios Poderes/Magias**.
* Para as demais classes, este campo deve permanecer oculto ou desabilitado.

### 3. Inventário (Seleção de Itens Estritamente Limitada)
O usuário pode escolher **exatamente 3 itens** da lista correspondente à sua classe:

* **Bibliotecário:** Livro de magia, Mapa, Café, Livro de línguas, Livro de espécies, Livro de monstros.
* **Guerreiro:** Faca pequena, Faca grande, Arma (10 tiros), Escudo, Arco (10 flechas).
* **Fazendeiro:** Grãos, Sementes, Enxada, Pá.
* **Domador:** Laço, Frutos, Cabana, Animais (Gato, Cachorro, Galinha, Vaca, Porco, Cavalo, Coelho). *(Nota: Mecânicas avançadas de slots guardadas para o futuro, focar na seleção de itens básica por enquanto)*.
* **Fada:** Flores, Farinha, Cogumelos.
* **Bruxa:** Cajado, Varinha, Poções.
* **Sereia:** Conchas, Algas, Lixo.

> ⚠️ **Validação de Interface:** O sistema deve impedir visualmente e via código que o usuário selecione mais ou menos do que 3 itens (a menos que a classe possua menos de 3 itens cadastrados, onde todos são selecionados automaticamente).

### 4. Distribuição de Estatísticas (Sistema de Pedras)
O jogador possui um total de **10 Pedras de Estatística** para distribuir entre 6 atributos.

* **Atributos:** Velocidade, Força, Equilíbrio, Furtividade, Conhecimento, Stamina.
* **Regra de Ouro 1:** O total de pedras distribuídas deve ser exatamente 10.
* **Regra de Ouro 2:** O limite máximo de pedras em uma única estatística é **3**.
* **Interface:** Fornecer botões de `+` e `-` para cada atributo, atualizando o contador de "Pedras Restantes" em tempo real e bloqueando o botão `+` caso o atributo atinja 3 ou as pedras acabem.

---

## 🛠️ Arquitetura de Arquivos Esperada

O Claude Code deve estruturar o projeto preferencialmente com os seguintes arquivos na raiz:
1. `index.html` - Estrutura semântica da página, contendo o formulário de criação (passo a passo ou painel único) e a área de exibição da ficha finalizada.
2. `style.css` - Identidade visual limpa, imersiva e responsiva (estilo fantasia aconchegante, clean).
3. `app.js` - Lógica de validação das pedras de status, controle condicional dos itens por classe, exibição do campo de magia e renderização da ficha final.

---

## 🎯 Objetivo Final do App
Ao preencher todos os dados corretamente e clicar em um botão "Gerar Ficha", o aplicativo deve validar os limites de pontos e itens, e então exibir uma versão estilizada e finalizada da ficha do personagem (com opção visual de copiar o texto da ficha ou simular uma impressão/salvamento).