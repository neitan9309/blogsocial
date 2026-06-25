/**
 * Painel Administrativo - BlogSocial (API)
 */
var AdminManager = function() {
    this.imagemBase64 = null;
    this.abaAtiva = 'publicar';
    this.isMaster = false;
    this.usuarioLogado = null;
    this.autorDados = null;
    this.modalOverlay = null;
    this.autorEmEdicao = null;
    this.init();
};

AdminManager.prototype.init = function() {
    this.verificarAutenticacao();
    this.verificarPermissao();
    this.carregarDadosUsuario();
    this.criarModal();
    this.setupForms();
    this.setupPreviewImagem();
    this.setupAbas();
    this.setupUserMenu();
    this.preencherAutorLogado();
    this.renderizarListaArtigos();
    this.renderizarConteudoAutores();
    this.exibirInfoUsuario();
    this.atualizarTextoAbas();
    console.log('✅ Admin Manager inicializado');
    console.log('👤 Usuário:', this.usuarioLogado);
    console.log('👑 Master:', this.isMaster);
};

AdminManager.prototype.verificarAutenticacao = function() {
    if (!sessionStorage.getItem('adminAutenticado')) {
        window.location.href = 'login.html';
    }
};

AdminManager.prototype.verificarPermissao = function() {
    this.isMaster = AuthManager.isMasterAdmin();
    
    // PEGAR USUÁRIO DA SESSÃO DIRETAMENTE
    var usuarioStr = sessionStorage.getItem('usuarioLogado');
    if (usuarioStr) {
        try {
            this.usuarioLogado = JSON.parse(usuarioStr);
            console.log('📋 Usuário carregado da sessão:', this.usuarioLogado);
        } catch(e) {
            console.error('❌ Erro ao parsear usuário:', e);
            this.usuarioLogado = null;
        }
    }
    
    // Se não tiver na sessão, usar AuthManager
    if (!this.usuarioLogado) {
        this.usuarioLogado = AuthManager.getUsuarioLogado();
    }
};

AdminManager.prototype.carregarDadosUsuario = function() {
    if (!this.usuarioLogado || !this.usuarioLogado.id) return;
    var self = this;
    API.getAutor(this.usuarioLogado.id).then(function(autor) {
        if (autor && !autor.erro) {
            self.autorDados = autor;
            self.exibirInfoUsuario();
            self.setupUserMenu();
        }
    }).catch(function() {
        console.warn('⚠️ Não foi possível carregar dados do autor da API');
    });
};

AdminManager.prototype.atualizarTextoAbas = function() {
    var aba = document.getElementById('abaAutoresBtn');
    if (aba) aba.textContent = this.isMaster ? '👥 Gerenciar Autores' : '👤 Minha Conta';
};

// ==========================================
// MODAL
// ==========================================

AdminManager.prototype.criarModal = function() {
    var existente = document.getElementById('modalAdmin');
    if (existente) existente.remove();
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.id = 'modalAdmin';
    this.modalOverlay.className = 'modal-overlay-admin';
    this.modalOverlay.innerHTML = '<div class="modal-container-admin">' +
        '<div class="modal-header-admin"><h2 id="modalAdminTitulo">✅ Sucesso!</h2><button class="modal-close-btn-admin" id="modalAdminCloseBtn">✕</button></div>' +
        '<div class="modal-body-admin"><div class="modal-icon-admin" id="modalAdminIcon">🎉</div><h3 id="modalAdminSubtitulo">Operação realizada!</h3><p id="modalAdminMensagem"></p><div class="modal-info-admin" id="modalAdminInfo"></div><button class="modal-confirm-btn-admin" id="modalAdminConfirmBtn">Entendido</button></div></div>';
    document.body.appendChild(this.modalOverlay);
    var self = this;
    document.getElementById('modalAdminCloseBtn').addEventListener('click', function() { self.fecharModal(); });
    document.getElementById('modalAdminConfirmBtn').addEventListener('click', function() { self.fecharModal(); });
    this.modalOverlay.addEventListener('click', function(e) { if (e.target === self.modalOverlay) self.fecharModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && self.modalOverlay.classList.contains('visivel')) self.fecharModal(); });
};

AdminManager.prototype.mostrarModal = function(titulo, subtitulo, mensagem, icone, info) {
    document.getElementById('modalAdminTitulo').textContent = titulo;
    document.getElementById('modalAdminSubtitulo').textContent = subtitulo;
    document.getElementById('modalAdminMensagem').textContent = mensagem;
    document.getElementById('modalAdminIcon').textContent = icone || '🎉';
    document.getElementById('modalAdminInfo').innerHTML = info || '';
    this.modalOverlay.classList.add('visivel');
    document.body.style.overflow = 'hidden';
};

AdminManager.prototype.fecharModal = function() {
    this.modalOverlay.classList.remove('visivel');
    document.body.style.overflow = '';
};

// ==========================================
// MENU MOBILE
// ==========================================

AdminManager.prototype.setupUserMenu = function() {
    var menuBtn = document.getElementById('adminUserMenuBtn');
    var dropdown = document.getElementById('adminUserDropdown');
    var arrow = document.getElementById('adminUserMenuArrow');
    if (!menuBtn || !dropdown) return;
    
    var nome = 'Usuário';
    var foto = 'https://ui-avatars.com/api/?name=User&size=32&background=6C5CE7&color=fff';
    var tag = 'Usuário';
    
    if (this.autorDados) {
        nome = this.autorDados.nome || nome;
        foto = this.autorDados.foto || foto;
        tag = this.isMaster ? '👑 Admin Master' : '✍️ Autor';
    } else if (this.usuarioLogado) {
        nome = this.usuarioLogado.nome || nome;
        tag = this.isMaster ? '👑 Admin Master' : '✍️ Autor';
    }
    
    document.getElementById('adminUserMenuAvatar').src = foto;
    document.getElementById('adminUserMenuName').textContent = nome.split(' ')[0];
    document.getElementById('adminDropdownAvatar').src = foto;
    document.getElementById('adminDropdownName').textContent = nome;
    document.getElementById('adminDropdownTag').textContent = tag;
    
    menuBtn.onclick = function(e) { e.stopPropagation(); dropdown.classList.toggle('visible'); arrow.classList.toggle('open'); };
    document.addEventListener('click', function(e) { if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) { dropdown.classList.remove('visible'); arrow.classList.remove('open'); } });
};

// ==========================================
// ABAS
// ==========================================

AdminManager.prototype.setupAbas = function() {
    var self = this;
    document.querySelectorAll('.admin-aba').forEach(function(aba) {
        aba.addEventListener('click', function() { self.trocarAba(this.getAttribute('data-aba')); });
    });
};

AdminManager.prototype.trocarAba = function(aba) {
    this.abaAtiva = aba;
    document.querySelectorAll('.admin-aba').forEach(function(a) { a.classList.toggle('ativa', a.getAttribute('data-aba') === aba); });
    document.getElementById('aba-publicar').style.display = 'none';
    document.getElementById('aba-autores-master').style.display = 'none';
    document.getElementById('aba-minha-conta').style.display = 'none';
    if (aba === 'publicar') document.getElementById('aba-publicar').style.display = 'block';
    else if (aba === 'autores') {
        if (this.isMaster) { document.getElementById('aba-autores-master').style.display = 'block'; this.renderizarListaAutores(); }
        else document.getElementById('aba-minha-conta').style.display = 'block';
    }
};

AdminManager.prototype.renderizarConteudoAutores = function() {
    document.getElementById('aba-autores-master').style.display = 'none';
    document.getElementById('aba-minha-conta').style.display = 'none';
};

// ==========================================
// FORMULÁRIOS
// ==========================================

AdminManager.prototype.setupForms = function() {
    var self = this;
    var formArtigo = document.getElementById('formArtigo');
    if (formArtigo) formArtigo.addEventListener('submit', function(e) { e.preventDefault(); self.publicarArtigo(); });
    var formAutor = document.getElementById('formAutor');
    if (formAutor) formAutor.addEventListener('submit', function(e) { e.preventDefault(); self.cadastrarAutor(); });
    var formMinhaConta = document.getElementById('formMinhaConta');
    if (formMinhaConta) {
        if (this.autorDados) {
            document.getElementById('minhaContaNome').value = this.autorDados.nome || '';
            document.getElementById('minhaContaEmail').value = this.autorDados.email || '';
            document.getElementById('minhaContaEspecialidade').value = this.autorDados.especialidade || '';
            document.getElementById('minhaContaBio').value = this.autorDados.bio || '';
        }
        formMinhaConta.addEventListener('submit', function(e) { e.preventDefault(); self.atualizarMinhaConta(); });
    }
};

AdminManager.prototype.setupPreviewImagem = function() {
    var self = this;
    var input = document.getElementById('imagemArquivo');
    if (input) input.addEventListener('change', function(e) { if (e.target.files && e.target.files[0]) self.processarImagem(e.target.files[0]); });
};

AdminManager.prototype.preencherAutorLogado = function() {
    var input = document.getElementById('autor');
    if (!input) return;
    var nome = AuthManager.getNomeAutorLogado();
    if (nome) { input.value = nome; input.readOnly = true; input.style.background = '#f0f0ff'; input.style.cursor = 'default'; }
};

AdminManager.prototype.exibirInfoUsuario = function() {
    var container = document.getElementById('usuarioInfo');
    if (!container) return;
    var nome = 'Usuário';
    var foto = 'https://ui-avatars.com/api/?name=User&size=40&background=6C5CE7&color=fff';
    var tag = 'Usuário';
    if (this.autorDados) {
        nome = this.autorDados.nome;
        foto = this.autorDados.foto || foto;
        tag = this.isMaster ? '👑 Admin' : '✍️ Autor';
    } else if (this.usuarioLogado) {
        nome = this.usuarioLogado.nome;
        tag = this.isMaster ? '👑 Admin' : '✍️ Autor';
    }
    container.innerHTML = '<div class="usuario-logado-info"><img src="' + foto + '" alt="' + nome + '" class="usuario-logado-foto" onerror="this.src=\'https://ui-avatars.com/api/?name=' + encodeURIComponent(nome) + '&size=40&background=6C5CE7&color=fff\'"><div><strong>' + nome + '</strong><span class="usuario-logado-tag">' + tag + '</span></div></div>';
};

AdminManager.prototype.processarImagem = function(arquivo) {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(arquivo.type)) { alert('Formato não suportado.'); return; }
    if (arquivo.size > 5 * 1024 * 1024) { alert('Máximo 5MB.'); return; }
    var self = this;
    var reader = new FileReader();
    reader.onload = function(e) { self.imagemBase64 = e.target.result; var preview = document.getElementById('previewImagem'); if (preview) { preview.innerHTML = '<img src="' + self.imagemBase64 + '" alt="Preview"><small style="display:block;text-align:center;padding:0.5rem;color:#666;">✅ Imagem carregada</small>'; preview.style.display = 'block'; } };
    reader.readAsDataURL(arquivo);
};

// ==========================================
// PUBLICAÇÃO DE ARTIGO - CORRIGIDO
// ==========================================

AdminManager.prototype.publicarArtigo = function() {
    var titulo = document.getElementById('titulo').value.trim();
    var autor = document.getElementById('autor').value.trim();
    var palavrasChave = document.getElementById('palavrasChave').value.split(',').map(function(k) { return k.trim(); }).filter(function(k) { return k; });
    var conteudo = document.getElementById('conteudo').value.trim();
    var tipoImagem = document.getElementById('tipoImagem').value;
    var imagemUrl = document.getElementById('imagemUrl');
    var imagemFile = document.getElementById('imagemArquivo');

    if (!titulo || !autor || !palavrasChave.length || !conteudo) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    var usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    var autorId = usuario ? usuario.id : 1;

    // Usar FormData para enviar arquivo + dados
    var formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    formData.append('autorId', autorId);
    formData.append('palavrasChave', JSON.stringify(palavrasChave));

    if (tipoImagem === 'arquivo' && imagemFile && imagemFile.files && imagemFile.files[0]) {
        // Upload de arquivo
        formData.append('imagemFile', imagemFile.files[0]);
    } else if (tipoImagem === 'url' && imagemUrl && imagemUrl.value.trim()) {
        // URL
        formData.append('imagemUrl', imagemUrl.value.trim());
    }
    // Se nenhum, o servidor usa placeholder

    var self = this;

    fetch('/api/artigos', {
        method: 'POST',
        body: formData  // Não usar headers Content-Type, o navegador define automaticamente com boundary
    })
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(err) {
                throw new Error(err.erro || 'Erro ' + response.status);
            });
        }
        return response.json();
    })
    .then(function(data) {
        console.log('✅ Artigo publicado! ID:', data.id, '| Imagem:', data.imagem);
        self.mostrarModal('✅ Artigo Publicado!', 'Sucesso', 'Artigo #' + data.id + ' disponível.', '📰');
        self.limparFormularioArtigo();
        self.renderizarListaArtigos();
    })
    .catch(function(error) {
        console.error('❌ Erro:', error);
        alert('Erro ao publicar: ' + error.message);
    });
};

AdminManager.prototype.excluirArtigo = function(id) {
    var self = this;
    if (confirm('Excluir este artigo permanentemente?')) {
        fetch('/api/artigos/' + id, { method: 'DELETE' })
            .then(function(r) { return r.json(); })
            .then(function() {
                self.mostrarModal('🗑️ Artigo Excluído', '', 'Removido do sistema.', '🗑️');
                self.renderizarListaArtigos();
            })
            .catch(function() { alert('Erro ao conectar com o servidor.'); });
    }
};

AdminManager.prototype.limparFormularioArtigo = function() {
    var form = document.getElementById('formArtigo');
    if (form) { form.reset(); this.preencherAutorLogado(); }
    var preview = document.getElementById('previewImagem');
    if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
    this.imagemBase64 = null;
    document.getElementById('tipoImagem').value = 'url';
    document.getElementById('grupoImagemUrl').style.display = 'block';
    document.getElementById('grupoImagemArquivo').style.display = 'none';
};

AdminManager.prototype.renderizarListaArtigos = function() {
    var container = document.getElementById('artigosExistentes');
    if (!container) return;
    var self = this;
    container.innerHTML = '<div class="sem-dados"><p>⏳ Carregando artigos...</p></div>';

    fetch('/api/artigos')
        .then(function(r) { return r.json(); })
        .then(function(artigos) {
            if (!Array.isArray(artigos) || artigos.length === 0) {
                container.innerHTML = '<div class="sem-dados"><p>📭 Nenhum artigo publicado.</p></div>';
                return;
            }

            var nomeAutorLogado = AuthManager.getNomeAutorLogado();
            var artigosFiltrados = self.isMaster ? artigos : artigos.filter(function(a) {
                return (a.autor_nome || a.autor) === nomeAutorLogado;
            });

            if (artigosFiltrados.length === 0) {
                container.innerHTML = '<div class="sem-dados"><p>📭 Nenhum artigo encontrado.</p>' + 
                    (!self.isMaster ? '<p style="font-size:0.9rem;color:#999;">Você vê apenas seus próprios artigos.</p>' : '') + '</div>';
                return;
            }

            container.innerHTML = artigosFiltrados.map(function(a) {
                var autorNome = a.autor_nome || a.autor || '';
                var podeExcluir = self.isMaster || autorNome === nomeAutorLogado;
                var palavras = a.palavrasChave || a.palavras || [];
                if (typeof palavras === 'string') palavras = palavras.split(',');
                var dataPub = a.dataPublicacao || a.data_publicacao || '';

                return '<div class="admin-item">' +
                    '<div class="admin-item-info">' +
                        '<h3>' + a.titulo + '</h3>' +
                        '<div class="admin-item-meta">' +
                            '<span>👤 ' + autorNome + '</span>' +
                            '<span>📅 ' + new Date(dataPub + 'T12:00:00').toLocaleDateString('pt-BR') + '</span>' +
                            '<span>🆔 ' + a.id + '</span>' +
                        '</div>' +
                        '<div class="palavras-chave">' + 
                            palavras.map(function(k) { return '<span class="keyword-tag">' + (typeof k === 'string' ? k.trim() : '') + '</span>'; }).join('') + 
                        '</div>' +
                    '</div>' +
                    (podeExcluir ? '<button class="btn-excluir" onclick="adminManager.excluirArtigo(' + a.id + ')">🗑️</button>' : '') +
                '</div>';
            }).join('');
        })
        .catch(function(error) {
            console.error('❌ Erro ao carregar artigos:', error);
            container.innerHTML = '<div class="sem-dados"><p>❌ Erro ao carregar. Servidor não disponível.</p></div>';
        });
};

// ==========================================
// GERENCIAR AUTORES (MASTER)
// ==========================================

AdminManager.prototype.cadastrarAutor = function() {
    if (this.autorEmEdicao) { this.salvarEdicaoAutor(); return; }
    
    var nome = document.getElementById('autorNome').value.trim();
    var email = document.getElementById('autorEmail').value.trim();
    var senha = document.getElementById('autorSenha').value.trim();
    var especialidade = document.getElementById('autorEspecialidade').value.trim();
    var bio = document.getElementById('autorBio').value.trim();
    var fotoInput = document.getElementById('autorFoto');
    
    if (!nome || !email || !senha || senha.length < 4) { 
        alert('Preencha todos os campos. Senha: mín 4 caracteres.'); return; 
    }
    
    // Usar FormData para enviar foto como arquivo
    var formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('especialidade', especialidade);
    formData.append('bio', bio);
    
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
        formData.append('fotoFile', fotoInput.files[0]);
    }
    
    var self = this;
    fetch('/api/autores', {
        method: 'POST',
        body: formData
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.erro) { alert('Erro: ' + data.erro); return; }
        self.mostrarModal('✅ Autor Cadastrado!', 'Sucesso', nome + ' já pode fazer login.', '👤');
        document.getElementById('formAutor').reset();
        self.renderizarListaAutores();
    })
    .catch(function() { alert('Erro ao conectar com o servidor.'); });
};

AdminManager.prototype.editarAutor = function(id) {
    var self = this;
    
    fetch('/api/autores/' + id)
        .then(function(r) { 
            if (!r.ok) throw new Error('Erro ' + r.status);
            return r.json(); 
        })
        .then(function(autor) {
            if (!autor || autor.erro) {
                alert('Autor não encontrado.');
                return;
            }
            
            self.autorEmEdicao = autor;
            
            // Preencher formulário
            document.getElementById('autorNome').value = autor.nome || '';
            document.getElementById('autorEmail').value = autor.email || '';
            document.getElementById('autorSenha').value = '';
            document.getElementById('autorSenha').placeholder = 'Deixe em branco para manter';
            document.getElementById('autorSenha').required = false;
            document.getElementById('autorEspecialidade').value = autor.especialidade || '';
            document.getElementById('autorBio').value = autor.bio || '';
            
            // Mudar botão
            var btn = document.querySelector('#formAutor .btn-publicar');
            if (btn) btn.textContent = '💾 Salvar Alterações';
            
            // Adicionar botão cancelar se não existir
            var formAutor = document.getElementById('formAutor');
            var cancelBtn = document.getElementById('cancelarEdicaoBtn');
            if (!cancelBtn) {
                cancelBtn = document.createElement('button');
                cancelBtn.id = 'cancelarEdicaoBtn';
                cancelBtn.type = 'button';
                cancelBtn.textContent = '❌ Cancelar';
                cancelBtn.style.cssText = 'background:#6c757d;color:white;border:none;padding:0.8rem 2rem;border-radius:50px;font-size:1rem;cursor:pointer;width:100%;margin-top:0.5rem;';
                cancelBtn.onclick = function() { adminManager.cancelarEdicao(); };
                formAutor.appendChild(cancelBtn);
            }
            
            // Destacar formulário
            formAutor.scrollIntoView({ behavior: 'smooth' });
            formAutor.style.border = '2px solid var(--primary-color)';
            formAutor.style.boxShadow = '0 0 20px rgba(108, 92, 231, 0.3)';
            
            console.log('✅ Autor carregado para edição:', autor.nome);
        })
        .catch(function(error) {
            console.error('❌ Erro ao carregar autor:', error);
            alert('Erro ao carregar autor. Verifique se o servidor está rodando.');
        });
};

AdminManager.prototype.salvarEdicaoAutor = function() {
    if (!this.autorEmEdicao) return;
    
    var nome = document.getElementById('autorNome').value.trim();
    var email = document.getElementById('autorEmail').value.trim();
    var senha = document.getElementById('autorSenha').value.trim();
    var especialidade = document.getElementById('autorEspecialidade').value.trim();
    var bio = document.getElementById('autorBio').value.trim();
    var fotoInput = document.getElementById('autorFoto');
    
    if (!nome || !email) { alert('Nome e e-mail são obrigatórios.'); return; }
    
    var formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('especialidade', especialidade);
    formData.append('bio', bio);
    if (senha && senha.length >= 4) formData.append('senha', senha);
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
        formData.append('fotoFile', fotoInput.files[0]);
    }
    
    var self = this;
    fetch('/api/autores/' + this.autorEmEdicao.id, {
        method: 'PUT',
        body: formData
    })
    .then(function(r) { return r.json(); })
    .then(function() {
        self.mostrarModal('✅ Autor Atualizado!', 'Sucesso', 'Dados salvos.', '👤');
        self.cancelarEdicao();
        document.getElementById('formAutor').reset();
        self.renderizarListaAutores();
    })
    .catch(function() { alert('Erro ao conectar.'); });
};

AdminManager.prototype.cancelarEdicao = function() { this.autorEmEdicao = null; this.resetFormAutor(); };

AdminManager.prototype.resetFormAutor = function() {
    var form = document.getElementById('formAutor');
    if (form) { form.reset(); form.style.border = ''; form.style.boxShadow = ''; }
    document.getElementById('autorSenha').placeholder = 'Senha';
    document.getElementById('autorSenha').required = true;
    var btn = document.querySelector('#formAutor .btn-publicar');
    if (btn) btn.textContent = '✅ Cadastrar Autor';
    var cancelBtn = document.getElementById('cancelarEdicaoBtn');
    if (cancelBtn) cancelBtn.remove();
};

AdminManager.prototype.excluirAutor = function(id) {
    if (!this.isMaster) { this.mostrarModal('🔒 Acesso Negado', '', 'Apenas Admin Master.', '🔒'); return; }
    if (!confirm('Remover este autor?')) return;
    var self = this;
    fetch('/api/autores/' + id, { method: 'DELETE' })
        .then(function(r) { return r.json(); })
        .then(function() { self.mostrarModal('🗑️ Autor Removido', '', 'Removido.', '🗑️'); self.renderizarListaAutores(); })
        .catch(function() { alert('Erro ao conectar.'); });
};

AdminManager.prototype.renderizarListaAutores = function() {
    var container = document.getElementById('autoresExistentes');
    if (!container) return;
    var self = this;
    container.innerHTML = '<div class="sem-dados"><p>⏳ Carregando...</p></div>';
    fetch('/api/autores')
        .then(function(r) { return r.json(); })
        .then(function(autores) {
            if (!Array.isArray(autores) || !autores.length) { container.innerHTML = '<div class="sem-dados"><p>📭 Nenhum autor.</p></div>'; return; }
            container.innerHTML = autores.map(function(a) {
                var isMasterAdmin = a.isMasterAdmin || a.is_master_admin;
                var botoes = '';
                if (!isMasterAdmin) botoes = '<div class="admin-item-actions"><button class="btn-editar" onclick="adminManager.editarAutor(' + a.id + ')">✏️ Editar</button><button class="btn-excluir" onclick="adminManager.excluirAutor(' + a.id + ')">🗑️</button></div>';
                else botoes = '<span style="color:#6C5CE7;font-weight:600;">👑 Master</span>';
                return '<div class="admin-item"><div class="admin-item-autor-info"><img src="' + (a.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(a.nome) + '&size=45&background=6C5CE7&color=fff') + '" alt="' + a.nome + '" class="admin-item-avatar" onerror="this.src=\'https://ui-avatars.com/api/?name=' + encodeURIComponent(a.nome) + '&size=45&background=6C5CE7&color=fff\'"><div class="admin-item-info"><h3>' + a.nome + ' ' + (isMasterAdmin ? '👑' : '') + '</h3><p style="font-size:0.85rem;color:#666;margin:0;">' + a.email + ' | ' + (a.especialidade || 'Sem especialidade') + '</p></div></div>' + botoes + '</div>';
            }).join('');
        })
        .catch(function() { container.innerHTML = '<div class="sem-dados"><p>❌ Erro ao carregar.</p></div>'; });
};

// ==========================================
// MINHA CONTA (AUTOR)
// ==========================================

AdminManager.prototype.atualizarMinhaConta = function() {
    if (!this.usuarioLogado || !this.usuarioLogado.id) { alert('Dados não encontrados.'); return; }
    
    var nome = document.getElementById('minhaContaNome').value.trim();
    var email = document.getElementById('minhaContaEmail').value.trim();
    var senha = document.getElementById('minhaContaSenha').value.trim();
    var especialidade = document.getElementById('minhaContaEspecialidade').value.trim();
    var bio = document.getElementById('minhaContaBio').value.trim();
    var fotoInput = document.getElementById('minhaContaFoto');
    
    if (!nome || !email) { alert('Nome e e-mail são obrigatórios.'); return; }
    
    var formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('especialidade', especialidade);
    formData.append('bio', bio);
    if (senha && senha.length >= 4) formData.append('senha', senha);
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
        formData.append('fotoFile', fotoInput.files[0]);
    }
    
    var self = this;
    fetch('/api/autores/' + this.usuarioLogado.id, {
        method: 'PUT',
        body: formData
    })
    .then(function(r) { return r.json(); })
    .then(function() {
        self.usuarioLogado.nome = nome;
        self.usuarioLogado.email = email;
        sessionStorage.setItem('usuarioLogado', JSON.stringify(self.usuarioLogado));
        self.carregarDadosUsuario();
        self.exibirInfoUsuario();
        self.setupUserMenu();
        self.preencherAutorLogado();
        self.renderizarListaArtigos();
        self.mostrarModal('✅ Conta Atualizada!', 'Sucesso', 'Dados salvos.', '👤');
    })
    .catch(function() { alert('Erro ao conectar.'); });
};

function toggleTipoImagem() {
    var tipo = document.getElementById('tipoImagem').value;
    document.getElementById('grupoImagemUrl').style.display = tipo === 'url' ? 'block' : 'none';
    document.getElementById('grupoImagemArquivo').style.display = tipo === 'arquivo' ? 'block' : 'none';
    var preview = document.getElementById('previewImagem');
    if (preview) { preview.innerHTML = ''; preview.style.display = 'none'; }
}

var adminManager;
document.addEventListener('DOMContentLoaded', function() { adminManager = new AdminManager(); });