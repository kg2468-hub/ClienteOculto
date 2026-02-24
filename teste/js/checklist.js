// --- DADOS DO CHECKLIST (AGORA COM PONTOS) ---
// Altere o valor de "pontos" para a nota real de cada pergunta. Use 0 para perguntas que não pontuam.
const perguntas = {
    "SALÃO": [
        { texto: "Abordou cliente no salão?", pontos: 3 },
        { texto: "O colaborador interrompeu as atividades administrativas para priorizar o atendimento ao cliente?", pontos: 3 },
        { texto: "Colaborador se apresentou pelo nome?", pontos: 3 },
        { texto: "O colaborador foi atencioso, empático e cordial?", pontos: 3 },
        { texto: "Buscou entender a necessidade do cliente?", pontos: 2 },
        { texto: "Acompanhou o cliente até a seção?", pontos: 2 }
    ],
    "BALCÃO": [
        { texto: "O colaborador se apresentou pelo nome?", pontos: 2 },
        { texto: "Solicitou o cadastro?", pontos: 3 },
        { texto: "Atualizou cadastro?", pontos: 1 },
        { texto: "Chamou o cliente pelo nome?", pontos: 3 },
        { texto: "Destacou descontos e vantagens, como promoções e/ou parcerias?", pontos: 3 },
        { texto: "Entregou cupom DSM explicando o que se tratava?", pontos: 2 },
        { texto: "Informou sobre programa de fidelidade?", pontos: 2 },
        { texto: "Informou Medalha do cliente?", pontos: 1 },
        { texto: "Ofertou Clinicfarma?", pontos: 0 },
        { texto: "Soube responder questionamento sobre medicamento/produto?", pontos: 2 },
        { texto: "Colaborador foi atencioso, empático e cordial?", pontos: 3 }
    ],
    "CAIXA": [
        { texto: "Solicitou CPF ou bipou cupom impresso no balcão?", pontos: 3 },
        { texto: "Solicitou a avaliação do Atendômetro?", pontos: 1 },
        { texto: "Destacou desconto da compra?", pontos: 3 },
        { texto: "Perguntou as formas de pagamento? (PIX, DINHEIRO OU DÉBITO)", pontos: 1 },
        { texto: "Ofereceu Super Troco? (DOAÇÃO)", pontos: 0 },
        { texto: "Ofertou envio do cupom por e-mail?", pontos: 1 },
        { texto: "Pagamento ocorreu sem trava/lentidão?", pontos: 1 },
        { texto: "Finalizou com CONTE SEMPRE COM A PAGUE MENOS ?", pontos: 3 },
        { texto: "O colaborador foi atencioso, empático e cordial?", pontos: 3 },
        { texto: "Acompanhou o cliente até a saída ou saiu da área do caixa para entregar as compras?", pontos: 1 }
    ],
    "PERGUNTAS EXTRAS": [
        { texto: "Saudação Seja bem-vindo à Pague Menos", pontos: 0 },
        { texto: "Ofertou produto Foco?", pontos: 0 },
        { texto: "Ofertou aumento UVC (Cliente crônico)", pontos: 0 },
        { texto: "Ofertou produtos do Super Descontos?", pontos: 0 },
        { texto: "Organizou a fila de atendimento?", pontos: 0 }
    ]
};

let respostas = {};
let horaInicio = "";
let itemPendente = { id: null, valor: null };
let relatorioObj = null;
let elementoFocoPendente = null; // Guarda onde a tela deve rolar
let totalPerguntasGeral = 0;     // Guarda o total de perguntas

function montar() {
    const agora = new Date();
    horaInicio = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const area = document.getElementById('checklist-area');
    let html = '';
    totalPerguntasGeral = 0;

    for (let secao in perguntas) {
        html += `<div class="card"><div class="section-title">${secao}</div>`;
        perguntas[secao].forEach((p, i) => {
            totalPerguntasGeral++;
            const id = secao + "-" + i;

            // Etiqueta de pontos
            const badgeHTML = p.pontos > 0 ? `<span class="badge-pontos">${p.pontos} pts</span>` : ``;

            html += `<div class="item" id="item-${id}">
            <div id="text-${id}" style="font-size:15px; margin-bottom:12px; font-weight:500;">
                ${p.texto} ${badgeHTML}
            </div>
            <div class="btns">
                <button class="btn" id="y-${id}" onclick="tentarMarcar('${id}', 1)">SIM ✅</button>
                <button class="btn" id="n-${id}" onclick="tentarMarcar('${id}', 0)">NÃO ❌</button>
            </div>
        </div>`;
        });
        html += `</div>`;
    }
    area.innerHTML = html;
}

function tentarMarcar(id, valor) {
    if (respostas[id] === valor) return;
    if (respostas[id] !== undefined) {
        itemPendente = { id, valor };
        document.getElementById('modal-new-choice').innerText = valor === 1 ? "SIM ✅" : "NÃO ❌";
        // Extrai o texto limpo sem o HTML do badge
        let textoLimpo = document.getElementById('text-' + id).innerText;
        document.getElementById('modal-question-text').innerText = textoLimpo;
        document.getElementById('modal-confirm').style.display = 'flex';
    } else {
        executarMarcacao(id, valor);
    }
}

function fecharModalConfirm(confirmado) {
    if (confirmado) executarMarcacao(itemPendente.id, itemPendente.valor);
    document.getElementById('modal-confirm').style.display = 'none';
}

function executarMarcacao(id, valor) {
    respostas[id] = valor;
    const itemDiv = document.getElementById("item-" + id);
    document.getElementById("y-" + id).className = "btn";
    document.getElementById("n-" + id).className = "btn";
    itemDiv.classList.remove("resp-sim", "resp-nao", "respondido");
    void itemDiv.offsetWidth;
    itemDiv.classList.add("respondido");
    if (valor === 1) {
        document.getElementById("y-" + id).classList.add("active-yes");
        itemDiv.classList.add("resp-sim");
    } else {
        document.getElementById("n-" + id).classList.add("active-no");
        itemDiv.classList.add("resp-nao");
    }

    // Se respondeu a última pergunta, rola para o botão de finalizar
    if (Object.keys(respostas).length === totalPerguntasGeral) {
        setTimeout(() => {
            document.getElementById('btn-gerar-relatorio').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
    }
}

function showAlert(msg) {
    document.getElementById('alert-msg').innerText = msg;
    document.getElementById('modal-alert').style.display = 'flex';
}

function fecharAlerta() {
    document.getElementById('modal-alert').style.display = 'none';

    // Se houver algo pendente gravado, rola até ele
    if (elementoFocoPendente) {
        setTimeout(() => {
            elementoFocoPendente.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Se for campo de texto (Nome/Matrícula), já abre o teclado
            if (elementoFocoPendente.tagName === 'INPUT') {
                elementoFocoPendente.focus();
            }
            elementoFocoPendente = null;
        }, 300);
    }
}

function finalizar() {
    const inputNome = document.getElementById('nome');
    const inputMatri = document.getElementById('matri');
    const nome = inputNome.value.trim();
    const matri = inputMatri.value.trim();
    const respondidas = Object.keys(respostas).length;

    if (!nome) {
        elementoFocoPendente = inputNome;
        return showAlert("Informe o nome do colaborador.");
    }

    if (!matri) {
        elementoFocoPendente = inputMatri;
        return showAlert("Informe a matrícula.");
    }

    if (respondidas < totalPerguntasGeral) {
        for (let secao in perguntas) {
            for (let i = 0; i < perguntas[secao].length; i++) {
                const id = secao + "-" + i;
                if (respostas[id] === undefined) {
                    elementoFocoPendente = document.getElementById('item-' + id);
                    return showAlert(`Responda as ${totalPerguntasGeral - respondidas} perguntas restantes.`);
                }
            }
        }
    }

    const agora = new Date();
    let acertosDeSim = 0;

    // ==========================================
    // ⚙️ CONFIGURAÇÃO DOS PONTOS OCULTOS
    // ==========================================
    // Defina aqui a pontuação das perguntas que NÃO estão no checklist
    let pontosOcultosPossiveis = 45; // Quantos pontos as perguntas ocultas valem no total
    let pontosOcultosObtidos = 45;   // Quantos pontos o colaborador ganha automaticamente nelas

    // Iniciamos a contagem já com os pontos ocultos
    let pontosObtidos = pontosOcultosObtidos;
    let totalPontosPossiveis = pontosOcultosPossiveis;
    // ==========================================

    let rel = "*AVALIAÇÃO CLIENTE OCULTO - PAGUE MENOS*\n--------------------------------\n";
    rel += `👤 *Colaborador:* ${nome}\n🆔 *Matrícula:* ${matri}\n📅 *Data:* ${agora.toLocaleDateString('pt-BR')}\n⏰ *Início:* ${horaInicio} | *Fim:* ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n--------------------------------\n`;

    for (let secao in perguntas) {
        rel += `\n🔹 *${secao}*`;
        perguntas[secao].forEach((p, i) => {
            const r = respostas[secao + "-" + i] === 1;
            totalPontosPossiveis += p.pontos;

            if (r) {
                acertosDeSim++;
                pontosObtidos += p.pontos;
            }

            // Formata o texto para WhatsApp mostrando os pontos
            let txtPontos = p.pontos > 0 ? ` (${p.pontos} pts)` : "";
            rel += `\n${r ? "✅" : "❌"} ${p.texto}${txtPontos}`;
        });
        rel += "\n";
    }

    // Garante que os pontos obtidos nunca ultrapassem o total possível
    pontosObtidos = Math.min(pontosObtidos, totalPontosPossiveis);

    // Cálculos Finais
    const porcentagemSim = ((acertosDeSim / totalPerguntasGeral) * 100).toFixed(0);
    let notaCalculada = totalPontosPossiveis > 0 ? ((pontosObtidos / totalPontosPossiveis) * 100) : 0;

    // Trava a nota máxima em 100%
    const notaClienteOculto = Math.min(notaCalculada, 100).toFixed(0);
    rel += `\n--------------------------------\n🏆 *NOTA CLIENTE OCULTO: ${notaClienteOculto}%* (${pontosObtidos}/${totalPontosPossiveis} pts)\n📊 *TAXA DE ACERTOS (SIM): ${porcentagemSim}%*\n--------------------------------\n_Gerado Por Erik Henrique - 126841_`;

    document.getElementById('relatorio').innerText = rel;
    document.getElementById('score').innerText = `NOTA: ${notaClienteOculto}% | ACERTOS: ${porcentagemSim}%`;
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    // ===== OBJETO BASE DO RELATÓRIO (PDF / EXCEL) =====
    relatorioObj = {
        colaborador: nome,
        matricula: matri,
        data: agora.toLocaleDateString('pt-BR'),
        inicio: horaInicio,
        fim: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        nota: notaClienteOculto,
        porcentagemSim: porcentagemSim,
        secoes: []
    };

    for (let secao in perguntas) {
        const itens = perguntas[secao].map((p, i) => ({
            // Passa os pontos para o PDF também
            pergunta: p.pontos > 0 ? `${p.texto} (${p.pontos} pts)` : p.texto,
            resposta: respostas[secao + "-" + i] === 1 ? "SIM" : "NÃO"
        }));
        relatorioObj.secoes.push({ nome: secao, itens });
    }

    // --- SALVAMENTO NO HISTÓRICO PERSISTENTE ---
    let historicoLocal = JSON.parse(localStorage.getItem('checklist_history')) || [];
    historicoLocal.unshift(relatorioObj); // Adiciona a nova avaliação no topo da lista
    localStorage.setItem('checklist_history', JSON.stringify(historicoLocal));

    if (typeof showToast === "function") showToast("Avaliação salva no histórico!");
}

function copiar() {
    navigator.clipboard.writeText(document.getElementById('relatorio').innerText);
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = "📋 Relatório copiado!";
        toast.style.display = "block";
        setTimeout(() => toast.style.display = "none", 2000);
    }
}

function gerarPDF() {
    if (!relatorioObj) {
        alert("Gere o relatório antes de salvar o PDF.");
        return;
    }

    const logo = new Image();
    logo.src = "assets/images/PagueMenosLogo.png";

    logo.onload = function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const marginX = 10;
        const topMargin = 10;
        const bottomMargin = 10;

        const usableWidth = pageWidth - marginX * 2;
        const usableHeight = pageHeight - topMargin - bottomMargin;

        let baseFont = 8.5;
        let lineHeight = 3.6;

        function calcularAltura(fontSize) {
            doc.setFontSize(fontSize);
            let h = 0;

            h += 12; // cabeçalho
            h += 16; // identificação
            h += 9;  // nota

            relatorioObj.secoes.forEach(secao => {
                h += 7;
                secao.itens.forEach(item => {
                    const linhas = doc.splitTextToSize(item.pergunta, usableWidth - 24);
                    h += linhas.length * (fontSize * 0.42) + 2;
                });
                h += 3;
            });

            return h;
        }

        while (calcularAltura(baseFont) > usableHeight && baseFont > 6.5) {
            baseFont -= 0.3;
        }

        doc.setFontSize(baseFont);
        lineHeight = baseFont * 0.42;

        let y = topMargin;

        /* ================= CABEÇALHO ================= */
        doc.setFillColor(0, 74, 153);
        doc.rect(marginX, y, usableWidth, 10, "F");

        doc.setTextColor(255);
        doc.setFontSize(baseFont + 4);
        doc.setFont(undefined, "bold");
        doc.text("RELATÓRIO DE AVALIAÇÃO - CLIENTE OCULTO", pageWidth / 2, y + 7, { align: "center" });

        y += 13;
        doc.setTextColor(0);
        doc.setFontSize(baseFont);
        doc.setFont(undefined, "normal");

        /* ================= IDENTIFICAÇÃO COM LOGO ================= */
        const boxHeight = 16;
        doc.rect(marginX, y, usableWidth, boxHeight);

        doc.setFont(undefined, "bold");
        doc.text(`Colaborador: ${relatorioObj.colaborador}`, marginX + 2, y + 6);
        doc.text(`Matrícula: ${relatorioObj.matricula}`, marginX + 2, y + 11);

        doc.setFont(undefined, "normal");
        doc.text(`Data: ${relatorioObj.data}`, marginX + 80, y + 6);
        doc.text(`Horário: ${relatorioObj.inicio} às ${relatorioObj.fim}`, marginX + 80, y + 11);

        const logoWidth = 24;
        const logoHeight = 10;
        const logoX = marginX + usableWidth - logoWidth - 3;
        const logoY = y + (boxHeight - logoHeight) / 2;

        doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);

        y += boxHeight + 4;

        /* ================= NOTA FINAL ================= */
        doc.setFillColor(240, 244, 248);
        doc.rect(marginX, y, usableWidth, 9, "F");
        doc.rect(marginX, y, usableWidth, 9);

        doc.setFontSize(baseFont + 1);
        doc.setFont(undefined, "bold");
        doc.text(
            `NOTA CLIENTE OCULTO: ${relatorioObj.nota}%  |  TAXA DE ACERTOS: ${relatorioObj.porcentagemSim}%`,
            pageWidth / 2,
            y + 6,
            { align: "center" }
        );

        y += 12;
        doc.setFontSize(baseFont);
        doc.setFont(undefined, "normal");

        /* ================= SEÇÕES ================= */
        relatorioObj.secoes.forEach(secao => {
            doc.setFillColor(230, 236, 242);
            doc.rect(marginX, y, usableWidth, 6, "F");
            doc.rect(marginX, y, usableWidth, 6);

            doc.setFont(undefined, "bold");
            doc.setTextColor(0);
            doc.text(secao.nome, marginX + 2, y + 4.5);

            y += 8;
            doc.setFont(undefined, "normal");

            secao.itens.forEach(item => {
                const linhas = doc.splitTextToSize(item.pergunta, usableWidth - 24);
                const altura = linhas.length * lineHeight + 2;
                const isNao = item.resposta === "NÃO";

                if (isNao) {
                    doc.setFillColor(40, 40, 40);
                    doc.setDrawColor(255, 255, 255);
                    doc.rect(marginX, y, usableWidth, altura, "FD");
                    doc.setTextColor(255);
                } else {
                    doc.setDrawColor(0);
                    doc.setFillColor(255, 255, 255);
                    doc.rect(marginX, y, usableWidth, altura);
                    doc.setTextColor(0);
                }

                doc.text(linhas, marginX + 2, y + lineHeight);
                doc.setFont(undefined, "bold");
                doc.text(item.resposta, pageWidth - marginX - 2, y + lineHeight, { align: "right" });
                doc.setFont(undefined, "normal");

                y += altura;
            });

            y += 3;
        });

        /* ================= RODAPÉ ================= */
        doc.setFontSize(7);
        doc.setTextColor(0);
        doc.text("Sistema não oficial • Gerado por Erik Henrique - 126841", pageWidth / 2, pageHeight - 6, { align: "center" });

        doc.save(`Checklist_${relatorioObj.colaborador}.pdf`);
    };
}

function gerarExcel() {
    const nome = document.getElementById('nome').value || "relatorio";
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Pergunta;Resposta\r\n";

    for (let secao in perguntas) {
        csvContent += `--- ${secao} ---;\r\n`;
        perguntas[secao].forEach((p, i) => {
            const r = respostas[secao + "-" + i] === 1 ? "SIM" : "NAO";
            // Mostra os pontos no Excel também
            const perguntaFormatada = p.pontos > 0 ? `${p.texto} (${p.pontos} pts)` : p.texto;
            csvContent += `${perguntaFormatada};${r}\r\n`;
        });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Checklist_${nome}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/* --- LÓGICA DE CARREGAMENTO ROBUSTA --- */

async function inicializarAppCompleto() {
    // 1. Aguarda os recursos estáticos (HTML, CSS e as bibliotecas jsPDF/Excel)
    const aguardarEstatico = new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });

    // 2. Requisição dinâmica do servidor (centralizada em pwa-utils.js)
    try {
        await aguardarEstatico;
        montar(); // Cria o formulário na tela
    } catch (erro) {
        console.error("Erro durante o carregamento da tela de checklist:", erro);
    } finally {
        // Remove o tela azul apenas quando tudo estiver pronto
        if (window.PWAUtils) window.PWAUtils.hideLoader();
    }
}

// Inicia o processo
inicializarAppCompleto();

// Funções auxiliares mantidas para compatibilidade ou chamadas no onload
window.voltarInicio = function () {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
};

window.addEventListener('pageshow', function (event) {
    if (document.body.classList.contains('page-exit')) document.body.classList.remove('page-exit');
});

window.voltar = window.voltarInicio;

function showToast(message) {
    // Implementar se necessário ou usar o global
    console.log("Toast:", message);
}
