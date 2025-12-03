// Variáveis Globais
const inputsContainer = document.getElementById('inputs-container');
let graficoInstancia = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    addCampo(); addCampo(); addCampo(); // Começa com 3 campos
});

// --- Navegação de Abas ---
function abrirAba(abaId) {
    const conteudos = document.querySelectorAll('.tab-content');
    conteudos.forEach(content => content.classList.remove('active'));

    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(btn => btn.classList.remove('active'));

    document.getElementById(abaId).classList.add('active');
    
    // Atualiza o visual do botão
    const botoesArray = Array.from(botoes);
    const botaoAlvo = botoesArray.find(btn => btn.getAttribute('onclick').includes(abaId));
    if(botaoAlvo) botaoAlvo.classList.add('active');
}

// --- Lógica Principal ---

function addCampo() {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
        <input type="number" placeholder="0.0" class="t" step="0.1">
        <input type="number" placeholder="0.0" class="p" step="0.1">
    `;
    inputsContainer.appendChild(row);
}

function calcular() {
    const inputsT = [...document.querySelectorAll('.t')];
    const inputsP = [...document.querySelectorAll('.p')];

    // Filtra e organiza os dados
    let dados = [];
    for (let i = 0; i < inputsT.length; i++) {
        if (inputsT[i].value !== '' && inputsP[i].value !== '') {
            dados.push({
                t: Number(inputsT[i].value),
                p: Number(inputsP[i].value)
            });
        }
    }

    dados.sort((a, b) => a.t - b.t); // Garante ordem cronológica

    if (dados.length < 2) {
        alert('Preencha pelo menos 2 pontos para calcular.');
        return;
    }

    const tempos = dados.map(d => d.t);
    const posicoes = dados.map(d => d.p);
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '';

    // --- 1. Velocidade Média (Vm) ---
    const deltaS = posicoes[posicoes.length - 1] - posicoes[0];
    const deltaT = tempos[tempos.length - 1] - tempos[0];
    let vMedia = deltaT !== 0 ? deltaS / deltaT : 0;

    resultadosDiv.innerHTML += `
        <div class='result-box'>
            <strong>Velocidade Média Global:</strong><br>
            <span style="font-size: 1.2em">Vm = ${vMedia.toFixed(2)} m/s</span>
            <div style="font-size:0.8em; color:#666">(${deltaS.toFixed(1)}m em ${deltaT.toFixed(1)}s)</div>
        </div>
    `;

    // --- 2. Velocidade Instantânea e Aceleração (Requer 3+ pontos) ---
    if (dados.length >= 3) {
        let i = Math.floor((tempos.length - 1) / 2);
        
        // V instantânea no meio (Diferença Centrada)
        const vInst = (posicoes[i+1] - posicoes[i-1]) / (tempos[i+1] - tempos[i-1]);
        
        // Estimativa de Aceleração Média
        // vInicial (entre ponto 0 e 1)
        const vIni = (posicoes[1] - posicoes[0]) / (tempos[1] - tempos[0]);
        // vFinal (entre penúltimo e último)
        const vFim = (posicoes[posicoes.length-1] - posicoes[posicoes.length-2]) / (tempos[tempos.length-1] - tempos[tempos.length-2]);
        
        // Aceleração = Variação da velocidade / Tempo total
        const aMedia = (vFim - vIni) / deltaT;

        resultadosDiv.innerHTML += `
            <div class='result-box' style="border-left-color: #3498db;">
                <strong>Análise Avançada:</strong><br>
                Velocidade Inst. (aprox. em ${tempos[i]}s): <b>${vInst.toFixed(2)} m/s</b><br>
                Aceleração Média Est.: <b>${aMedia.toFixed(2)} m/s²</b>
            </div>
        `;
    }

    gerarGrafico(tempos, posicoes);
}

// --- Função do Gráfico ---
function gerarGrafico(t, p) {
    const ctx = document.getElementById('grafico').getContext('2d');
    
    if (graficoInstancia) graficoInstancia.destroy();

    graficoInstancia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: t,
            datasets: [{
                label: 'Posição (m)',
                data: p,
                borderColor: '#2980b9',
                backgroundColor: 'rgba(41, 128, 185, 0.2)',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2980b9',
                pointRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Tempo (s)' } },
                y: { title: { display: true, text: 'Posição (m)' } }
            }
        }
    });
}

// --- Função para Baixar Imagem ---
function baixarGrafico() {
    const canvas = document.getElementById('grafico');
    if (!graficoInstancia) {
        alert("Gere o gráfico antes de baixar!");
        return;
    }
    
    // Cria um link temporário para download
    const link = document.createElement('a');
    link.download = 'radar-matematico-resultado.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}