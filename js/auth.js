/**
 * Sistema de Autenticação - BlogSocial
 * Autentica via API SQLite
 */
var AuthManager = function() {
    this.init();
};

AuthManager.prototype.init = function() {
    var self = this;
    var loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            self.realizarLogin();
        });
    }
    
    if (this.isPaginaProtegida()) {
        this.verificarAutenticacao();
    }
    
    this.exibirInfoUsuario();
};

AuthManager.prototype.isPaginaProtegida = function() {
    return window.location.pathname.indexOf('admin.html') !== -1;
};

AuthManager.prototype.realizarLogin = function() {
    var email = document.getElementById('email').value.trim();
    var senha = document.getElementById('senha').value.trim();
    var mensagemErro = document.getElementById('mensagemErro');
    
    if (!email || !senha) {
        if (mensagemErro) { mensagemErro.textContent = 'Preencha todos os campos.'; mensagemErro.style.display = 'block'; }
        return;
    }
    
    // Autenticar via API (SQLite)
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: senha })
    })
    .then(function(r) { return r.json(); })
    .then(function(autor) {
        if (autor && !autor.erro) {
            // Login bem-sucedido - salvar na sessão
            sessionStorage.setItem('adminAutenticado', 'true');
            sessionStorage.setItem('usuarioLogado', JSON.stringify({
                id: autor.id,
                nome: autor.nome,
                email: autor.email,
                isMasterAdmin: autor.isMasterAdmin || false
            }));
            console.log('✅ Login via API:', autor.nome, '(ID:', autor.id, ')');
            window.location.href = 'admin.html';
        } else {
            if (mensagemErro) { mensagemErro.textContent = 'E-mail ou senha incorretos.'; mensagemErro.style.display = 'block'; }
        }
    })
    .catch(function() {
        if (mensagemErro) { mensagemErro.textContent = 'Erro ao conectar com o servidor.'; mensagemErro.style.display = 'block'; }
    });
};

AuthManager.prototype.verificarAutenticacao = function() {
    if (!sessionStorage.getItem('adminAutenticado')) {
        window.location.href = 'login.html';
    }
};

AuthManager.prototype.exibirInfoUsuario = function() {
    var container = document.getElementById('usuarioInfo');
    if (!container) return;
    
    var dados = sessionStorage.getItem('usuarioLogado');
    if (!dados) return;
    
    try {
        var usuario = JSON.parse(dados);
        var nome = usuario.nome || 'Usuário';
        var tag = usuario.isMasterAdmin ? '👑 Admin' : '✍️ Autor';
        var foto = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nome) + '&size=40&background=6C5CE7&color=fff';
        
        container.innerHTML = '<div class="usuario-logado-info">' +
            '<img src="' + foto + '" alt="' + nome + '" class="usuario-logado-foto">' +
            '<div><strong>' + nome + '</strong><span class="usuario-logado-tag">' + tag + '</span></div></div>';
    } catch(e) {}
};

AuthManager.getUsuarioLogado = function() {
    var dados = sessionStorage.getItem('usuarioLogado');
    return dados ? JSON.parse(dados) : null;
};

AuthManager.getNomeAutorLogado = function() {
    var usuario = AuthManager.getUsuarioLogado();
    return usuario ? usuario.nome : null;
};

AuthManager.isMasterAdmin = function() {
    var usuario = AuthManager.getUsuarioLogado();
    return usuario && usuario.isMasterAdmin === true;
};

AuthManager.logout = function() {
    sessionStorage.removeItem('adminAutenticado');
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
};

document.addEventListener('DOMContentLoaded', function() {
    new AuthManager();
});