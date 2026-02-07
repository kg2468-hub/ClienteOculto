📋 Checklist Cliente Oculto - Pague Menos
Sistema web progressivo (PWA) desenvolvido para facilitar a auditoria e o acompanhamento do padrão de atendimento nas unidades Pague Menos. O foco é a avaliação rápida, geração de relatórios e exportação de dados diretamente pelo dispositivo móvel.
🚀 Funcionalidades Principais
 * Checklist Dinâmico: Organizado por seções (Salão, Balcão, Caixa e Extras).
 * Relatório Automatizado: Gera uma nota de 0 a 100% com base nos acertos.
 * Exportação Versátil:
   * 📄 PDF: Salva o relatório em formato de documento.
   * 📊 Excel (CSV): Gera planilha compatível com Excel para análise de dados.
   * 💬 WhatsApp: Botão para copiar o relatório formatado e enviar rapidamente.
 * Experiência de App (PWA): Pode ser instalado no celular e funciona offline via Service Worker.
 * Animações de Transição: Efeito visual fluido entre a tela inicial e o formulário.
 * Gestão de Cache: Função integrada para limpar arquivos temporários e atualizar o sistema.
🛠️ Tecnologias Utilizadas
 * Frontend: HTML5, CSS3 (Variáveis, Flexbox, Grid, Animações 3D).
 * Iconografia: Font Awesome 6.0.
 * PWA: Web Manifest e Service Worker para cache offline.
 * JavaScript: Vanilla JS (Manipulação de DOM, Blobs para Excel e lógica de avaliação).
📂 Estrutura de Arquivos
├── index.html        # Tela inicial (Menu e PWA)
├── checklist.html    # Tela de avaliação e resultados
├── manifest.json     # Configuração de instalação do PWA
├── sw.js             # Service Worker (Cache offline)
├── icone.png         # Ícone do aplicativo
└── PagueMenosLogo.png # Logo oficial para relatórios

⚙️ Instalação e Uso
 * Hospedagem: O sistema deve ser servido via HTTPS para que as funções de PWA e instalação funcionem.
 * Instalação: * Abra o site no navegador do celular (Chrome/Safari).
   * Clique na Engrenagem no canto superior direito.
   * Selecione "Instalar Aplicativo".
 * Atualização: Sempre que houver mudanças no código, utilize a opção "Atualizar Sistema" dentro do menu de engrenagem para forçar o download da nova versão.
⚠️ Observações Importantes
> Aviso: Este é um sistema de apoio desenvolvido de forma independente por Erik Henrique (Matrícula: 126841). Não se trata de uma ferramenta oficial corporativa, mas sim de um facilitador para o acompanhamento diário das metas de atendimento.
> 
👨‍💻 Desenvolvedor
Erik Henrique - Matrícula 126841 Foco em otimização de processos e experiência do usuário.