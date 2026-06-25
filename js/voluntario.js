/**
 * Sistema de Voluntariado - BlogSocial
 * Gerencia formulário de cadastro com validação de telefone brasileiro
 */
var VoluntarioManager = function() {
    this.form = null;
    this.telefoneInput = null;
    this.feedbackTelefone = null;
    this.telefoneValido = false;
    this.modalOverlay = null;
    this.init();
};

VoluntarioManager.prototype.init = function() {
    this.carregarElementos();
    if (!this.form || !this.telefoneInput) return;
    this.criarModal();
    this.configurarEventos();
    this.logInstrucoes();
};

VoluntarioManager.prototype.carregarElementos = function() {
    this.form = document.getElementById('formVoluntario');
    this.telefoneInput = document.getElementById('telefone');
    this.feedbackTelefone = document.getElementById('feedbackTelefone');
};

// ==========================================
// MODAL
// ==========================================

VoluntarioManager.prototype.criarModal = function() {
    var existente = document.getElementById('modalSucesso');
    if (existente) existente.remove();

    this.modalOverlay = document.createElement('div');
    this.modalOverlay.id = 'modalSucesso';
    this.modalOverlay.className = 'modal-overlay';
    this.modalOverlay.innerHTML = '<div class="modal-container">' +
        '<div class="modal-header"><h2>✅ Cadastro Realizado!</h2><button class="modal-close-btn" id="modalCloseBtn">✕</button></div>' +
        '<div class="modal-body"><div class="modal-icon">🎉</div><h3 id="modalTitulo">Obrigado por se cadastrar!</h3><p id="modalMensagem">Entraremos em contato em breve.</p><div class="modal-info" id="modalInfo"></div><button class="modal-confirm-btn" id="modalConfirmBtn">Entendido</button></div>' +
    '</div>';
    document.body.appendChild(this.modalOverlay);

    var self = this;
    document.getElementById('modalCloseBtn').addEventListener('click', function() { self.fecharModal(); });
    document.getElementById('modalConfirmBtn').addEventListener('click', function() { self.fecharModal(); });
    this.modalOverlay.addEventListener('click', function(e) { if (e.target === self.modalOverlay) self.fecharModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && self.modalOverlay.classList.contains('visivel')) self.fecharModal(); });
};

VoluntarioManager.prototype.mostrarModal = function(voluntario) {
    document.getElementById('modalTitulo').textContent = 'Obrigado, ' + voluntario.nome.split(' ')[0] + '!';
    document.getElementById('modalMensagem').textContent = 'Seu cadastro foi realizado com sucesso. Entraremos em contato em breve!';
    document.getElementById('modalInfo').innerHTML = '<div class="modal-info-item"><span class="modal-info-icon">👤</span><span><strong>Nome:</strong> ' + voluntario.nome + '</span></div>' +
        '<div class="modal-info-item"><span class="modal-info-icon">📧</span><span><strong>E-mail:</strong> ' + voluntario.email + '</span></div>' +
        '<div class="modal-info-item"><span class="modal-info-icon">📱</span><span><strong>Telefone:</strong> ' + voluntario.telefoneFormatado + '</span></div>';
    this.modalOverlay.classList.add('visivel');
    document.body.style.overflow = 'hidden';
};

VoluntarioManager.prototype.fecharModal = function() {
    this.modalOverlay.classList.remove('visivel');
    document.body.style.overflow = '';
};

// ==========================================
// FORMATAÇÃO DE TELEFONE
// ==========================================

VoluntarioManager.prototype.extrairNumeros = function(valor) {
    return valor.replace(/\D/g, '');
};

VoluntarioManager.prototype.formatarTelefone = function(valor) {
    var numeros = this.extrairNumeros(valor);
    numeros = numeros.substring(0, 11);
    if (numeros.length === 0) return '';
    if (numeros.length <= 2) return '(' + numeros;
    if (numeros.length <= 6) return '(' + numeros.substring(0, 2) + ') ' + numeros.substring(2);
    if (numeros.length <= 10) return '(' + numeros.substring(0, 2) + ') ' + numeros.substring(2, 6) + '-' + numeros.substring(6);
    return '(' + numeros.substring(0, 2) + ') ' + numeros.substring(2, 7) + '-' + numeros.substring(7);
};

VoluntarioManager.prototype.calcularPosicaoCursor = function(valorAntigo, valorNovo, cursorPosAntigo) {
    var numerosAntigos = this.extrairNumeros(valorAntigo);
    if (numerosAntigos.length === 0) return valorNovo.length;
    var caracteresFormatacaoAntes = 0;
    for (var i = 0; i < cursorPosAntigo && i < valorAntigo.length; i++) {
        if (/\D/.test(valorAntigo[i])) caracteresFormatacaoAntes++;
    }
    var posicaoNumeros = cursorPosAntigo - caracteresFormatacaoAntes;
    var posicaoAtual = 0;
    var numerosContados = 0;
    for (var i = 0; i < valorNovo.length; i++) {
        if (/\d/.test(valorNovo[i])) {
            if (numerosContados >= posicaoNumeros) break;
            numerosContados++;
        }
        posicaoAtual = i + 1;
    }
    return numerosContados < posicaoNumeros ? valorNovo.length : posicaoAtual;
};

VoluntarioManager.prototype.handleTelefoneInput = function(e) {
    var valorAntigo = e.target.value;
    var cursorPosAntigo = e.target.selectionStart;
    var numeros = this.extrairNumeros(valorAntigo);
    var valorFormatado = this.formatarTelefone(numeros);
    e.target.value = valorFormatado;
    var novaPosicao = this.calcularPosicaoCursor(valorAntigo, valorFormatado, cursorPosAntigo);
    e.target.setSelectionRange(novaPosicao, novaPosicao);
    this.atualizarFeedback(valorFormatado);
};

VoluntarioManager.prototype.handleTelefoneKeypress = function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var teclasPermitidas = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
    if (teclasPermitidas.includes(e.key)) return;
    if (!/\d/.test(e.key)) e.preventDefault();
};

VoluntarioManager.prototype.handleTelefonePaste = function(e) {
    e.preventDefault();
    var textoCopiado = (e.clipboardData || window.clipboardData).getData('text');
    var numerosColados = this.extrairNumeros(textoCopiado);
    if (numerosColados.length === 0) return;
    var cursorPos = this.telefoneInput.selectionStart;
    var valorAtual = this.telefoneInput.value;
    var numerosAntes = this.extrairNumeros(valorAtual.substring(0, cursorPos));
    var numerosDepois = this.extrairNumeros(valorAtual.substring(cursorPos));
    var novosNumeros = numerosAntes + numerosColados + numerosDepois;
    var valorFormatado = this.formatarTelefone(novosNumeros);
    this.telefoneInput.value = valorFormatado;
    var posicaoCursor = this.calcularPosicaoCursorAposColagem(valorFormatado, numerosAntes.length + numerosColados.length);
    this.telefoneInput.setSelectionRange(posicaoCursor, posicaoCursor);
    this.atualizarFeedback(valorFormatado);
};

VoluntarioManager.prototype.calcularPosicaoCursorAposColagem = function(valorFormatado, posicaoNumeros) {
    var contadorNumeros = 0;
    for (var i = 0; i < valorFormatado.length; i++) {
        if (/\d/.test(valorFormatado[i])) {
            if (contadorNumeros >= posicaoNumeros) return i;
            contadorNumeros++;
        }
    }
    return valorFormatado.length;
};

// ==========================================
// VALIDAÇÃO
// ==========================================

VoluntarioManager.prototype.validarTelefone = function(numeroLimpo) {
    if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
        return { valido: false, mensagem: 'Telefone deve ter 10 ou 11 dígitos.', tipo: 'erro' };
    }
    var ddd = parseInt(numeroLimpo.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
        return { valido: false, mensagem: 'DDD inválido.', tipo: 'erro' };
    }
    if (numeroLimpo.length === 10) {
        if (numeroLimpo[2] === '9') return { valido: false, mensagem: 'Fixo não deve começar com 9.', tipo: 'erro' };
        return { valido: true, mensagem: '✅ Telefone fixo válido', tipo: 'sucesso', formatado: '(' + numeroLimpo.substring(0, 2) + ') ' + numeroLimpo.substring(2, 6) + '-' + numeroLimpo.substring(6), tipoTelefone: 'fixo' };
    }
    if (numeroLimpo[2] !== '9') return { valido: false, mensagem: 'Celular deve começar com 9.', tipo: 'erro' };
    return { valido: true, mensagem: '✅ Celular válido', tipo: 'sucesso', formatado: '(' + numeroLimpo.substring(0, 2) + ') ' + numeroLimpo.substring(2, 3) + ' ' + numeroLimpo.substring(3, 7) + '-' + numeroLimpo.substring(7), tipoTelefone: 'celular' };
};

VoluntarioManager.prototype.atualizarFeedback = function(valorFormatado) {
    var numerosLimpos = this.extrairNumeros(valorFormatado);
    this.telefoneInput.classList.remove('valido', 'invalido');
    this.feedbackTelefone.className = 'feedback-telefone';
    if (numerosLimpos.length === 0) { this.feedbackTelefone.textContent = ''; this.telefoneValido = false; }
    else if (numerosLimpos.length < 10) {
        var faltam = 10 - numerosLimpos.length;
        this.feedbackTelefone.textContent = '⚠️ Digite mais ' + faltam + ' dígito' + (faltam > 1 ? 's' : '');
        this.feedbackTelefone.className = 'feedback-telefone erro';
        this.telefoneInput.classList.add('invalido');
        this.telefoneValido = false;
    } else {
        var validacao = this.validarTelefone(numerosLimpos);
        if (validacao.valido) {
            this.feedbackTelefone.textContent = validacao.mensagem + ' - ' + validacao.tipoTelefone;
            this.feedbackTelefone.className = 'feedback-telefone sucesso';
            this.telefoneInput.classList.add('valido');
            this.telefoneValido = true;
        } else {
            this.feedbackTelefone.textContent = '❌ ' + validacao.mensagem;
            this.feedbackTelefone.className = 'feedback-telefone erro';
            this.telefoneInput.classList.add('invalido');
            this.telefoneValido = false;
        }
    }
};

// ==========================================
// CONFIGURAÇÃO DE EVENTOS
// ==========================================

VoluntarioManager.prototype.configurarEventos = function() {
    var self = this;
    this.telefoneInput.addEventListener('input', function(e) { self.handleTelefoneInput(e); });
    this.telefoneInput.addEventListener('keypress', function(e) { self.handleTelefoneKeypress(e); });
    this.telefoneInput.addEventListener('paste', function(e) { self.handleTelefonePaste(e); });
    this.form.addEventListener('submit', function(e) { self.handleSubmit(e); });
};

// ==========================================
// SUBMISSÃO
// ==========================================

VoluntarioManager.prototype.handleSubmit = function(e) {
    e.preventDefault();
    var nome = document.getElementById('nome').value.trim();
    var email = document.getElementById('email').value.trim();
    var telefoneFormatado = this.telefoneInput.value;
    var telefoneNumeros = this.extrairNumeros(telefoneFormatado);

    if (!nome || nome.length < 3) { alert('Nome completo (mínimo 3 caracteres).'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('E-mail válido.'); return; }
    var validacaoTel = this.validarTelefone(telefoneNumeros);
    if (!validacaoTel.valido) { alert('Telefone inválido.\n\n' + validacaoTel.mensagem); return; }

    var voluntario = {
        nome: nome,
        email: email,
        telefone: telefoneNumeros,
        telefoneFormatado: validacaoTel.formatado,
        tipoTelefone: validacaoTel.tipoTelefone,
        dataRegistro: new Date().toISOString()
    };

    this.salvarVoluntario(voluntario);
    this.mostrarModal(voluntario);
    this.resetarFormulario();
};

VoluntarioManager.prototype.salvarVoluntario = function(voluntario) {
    console.group('🌟 Novo Voluntário');
    console.log('📋 Dados:', voluntario);

    // Tentar salvar via API
    try {
        fetch('/api/voluntarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voluntario)
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            console.log('✅ Salvo no servidor:', data);
        })
        .catch(function(error) {
            console.warn('⚠️ Servidor não disponível, salvando localmente');
            // Fallback: localStorage
            var voluntarios = JSON.parse(localStorage.getItem('voluntarios') || '[]');
            voluntarios.push(voluntario);
            localStorage.setItem('voluntarios', JSON.stringify(voluntarios));
            console.log('💾 Salvo localmente');
        });
    } catch (error) {
        console.warn('⚠️ Erro, salvando localmente');
        var voluntariosLocal = JSON.parse(localStorage.getItem('voluntarios') || '[]');
        voluntariosLocal.push(voluntario);
        localStorage.setItem('voluntarios', JSON.stringify(voluntariosLocal));
    }

    console.log('📊 Total:', JSON.parse(localStorage.getItem('voluntarios') || '[]').length);
    console.groupEnd();
};

VoluntarioManager.prototype.resetarFormulario = function() {
    this.form.reset();
    this.telefoneInput.classList.remove('valido', 'invalido');
    this.feedbackTelefone.textContent = '';
    this.feedbackTelefone.className = 'feedback-telefone';
    this.telefoneValido = false;
};

VoluntarioManager.prototype.logInstrucoes = function() {
    console.log('📱 Voluntariado - BlogSocial');
    console.log('💡 Digite apenas números no telefone');
    console.log('✅ Pronto!');
};

document.addEventListener('DOMContentLoaded', function() {
    window.voluntarioManager = new VoluntarioManager();
});