/**
 * Servidor Backend - BlogSocial
 * Utiliza SQLite para armazenamento persistente
 */
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar pasta de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configurar multer para salvar imagens
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        // Nome único: timestamp + número aleatório + extensão original
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 10000) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function(req, file, cb) {
        const tipos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (tipos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato não suportado. Use JPG, PNG, GIF ou WebP.'));
        }
    }
});

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const db = new sqlite3.Database('./blogsocial.db');

// ==========================================
// CRIAÇÃO DAS TABELAS
// ==========================================

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS autores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        foto TEXT,
        bio TEXT,
        especialidade TEXT,
        is_master_admin INTEGER DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        data_cadastro TEXT DEFAULT (date('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS artigos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        conteudo TEXT NOT NULL,
        imagem TEXT,
        autor_id INTEGER NOT NULL,
        data_publicacao TEXT DEFAULT (date('now')),
        FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS palavras_chave (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        palavra TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS artigo_palavras (
        artigo_id INTEGER NOT NULL,
        palavra_id INTEGER NOT NULL,
        PRIMARY KEY (artigo_id, palavra_id),
        FOREIGN KEY (artigo_id) REFERENCES artigos(id) ON DELETE CASCADE,
        FOREIGN KEY (palavra_id) REFERENCES palavras_chave(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS voluntarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        telefone_formatado TEXT,
        tipo_telefone TEXT,
        data_registro TEXT DEFAULT (datetime('now')),
        status TEXT DEFAULT 'novo'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        data_inscricao TEXT DEFAULT (datetime('now')),
        ativo INTEGER DEFAULT 1
    )`);

    inserirDadosPadrao();
});

function inserirDadosPadrao() {
    db.get('SELECT COUNT(*) as count FROM autores', (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare('INSERT INTO autores (nome, email, senha, foto, bio, especialidade, is_master_admin) VALUES (?, ?, ?, ?, ?, ?, ?)');
            
            stmt.run('Maria Silva', 'maria.silva@blogsocial.com', 'maria123', 
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', 
                'Educadora e pesquisadora em tecnologias sustentáveis há mais de 15 anos. Mestre em Energias Renováveis pela USP, Maria dedica-se a popularizar a ciência e tornar acessível o conhecimento sobre sustentabilidade. Autora de 3 livros sobre o tema, já palestrou em mais de 20 países.', 
                'Tecnologia e Sustentabilidade', 0);
            
            stmt.run('João Santos', 'joao.santos@blogsocial.com', 'joao123', 
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', 
                'Cientista social e ativista comunitário com 12 anos de experiência em projetos de impacto social. Fundador do Instituto Comunitário Nova Era, João já impactou mais de 50 mil pessoas através de iniciativas de educação e desenvolvimento local. Prêmio Nacional de Direitos Humanos 2023.', 
                'Impacto Social e Comunidade', 0);
            
            stmt.run('Ana Costa', 'ana.costa@blogsocial.com', 'ana123', 
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', 
                'Especialista em Inteligência Artificial e Inovação Digital. Doutora em Ciência da Computação pela UNICAMP, Ana trabalha na interseção entre tecnologia e sociedade. Colunista em importantes revistas de tecnologia e consultora de grandes empresas para transformação digital.', 
                'Inovação e Tecnologia Digital', 0);
            
            stmt.run('Pedro Oliveira', 'pedro.oliveira@blogsocial.com', 'pedro123', 
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', 
                'Pedagogo e designer educacional apaixonado por metodologias inovadoras de ensino. Com mestrado em Educação pela UFMG, Pedro desenvolve projetos que unem tecnologia e pedagogia. Já capacitou mais de 2.000 professores em novas metodologias de ensino.', 
                'Educação e Métodos de Aprendizado', 0);
            
            stmt.run('Lucia Ferreira', 'lucia.ferreira@blogsocial.com', 'lucia123', 
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', 
                'Psicóloga clínica e pesquisadora em saúde mental. Doutora em Psicologia pela UFRJ, Lucia é referência nacional em bem-estar emocional e qualidade de vida. Mantém um canal no YouTube com mais de 500 mil seguidores onde aborda temas de saúde mental de forma acessível.', 
                'Saúde Mental e Bem-Estar', 0);
            
            stmt.run('Carlos Mendes', 'carlos.mendes@blogsocial.com', 'carlos123', 
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', 
                'Urbanista e ambientalista com foco em cidades inteligentes e sustentáveis. Formado em Arquitetura e Urbanismo pela UFSC, Carlos coordena projetos de revitalização urbana em 5 capitais brasileiras. Membro do Conselho Nacional de Desenvolvimento Urbano Sustentável.', 
                'Sustentabilidade Urbana', 0);
            
            stmt.run('Administrador Master', 'admin@blogsocial.com', 'admin123', 
                'https://ui-avatars.com/api/?name=Admin+Master&size=150&background=6C5CE7&color=fff&bold=true', 
                'Administrador principal do BlogSocial. Responsável pela gestão de conteúdo, autores e configurações do sistema.', 
                'Administração do Sistema', 1);
            
            stmt.finalize();
            console.log('✅ Autores padrão inseridos com biografias completas');
        }
    });

    db.get('SELECT COUNT(*) as count FROM artigos', (err, row) => {
        if (row && row.count === 0) {
            const artigos = [
                { autor_id: 1, titulo: 'Tecnologia Sustentável: O Futuro da Energia Limpa', conteudo: '<h2>O Futuro da Energia Limpa</h2><p>A tecnologia sustentável está revolucionando a forma como produzimos e consumimos energia. Com o avanço das energias renováveis, estamos cada vez mais próximos de um futuro livre de combustíveis fósseis.</p><p>Painéis solares mais eficientes, turbinas eólicas inovadoras e sistemas de armazenamento de energia estão transformando o setor energético global.</p><h3>Principais Avanços:</h3><ul><li>Baterias de estado sólido com maior capacidade</li><li>Células solares de perovskite</li><li>Hidrogênio verde como combustível</li></ul>', imagem: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', data: '2024-01-15', palavras: ['tecnologia', 'sustentabilidade', 'energia', 'renovável', 'futuro'] },
                { autor_id: 2, titulo: 'Impacto Social: Como Pequenas Ações Transformam Comunidades', conteudo: '<h2>Transformando Comunidades Através de Pequenas Ações</h2><p>O impacto social começa com pequenas iniciativas que, quando somadas, geram grandes transformações. Cada ação voluntária contribui para um mundo mais justo e solidário.</p><p>Projetos comunitários de educação, saúde e sustentabilidade têm mostrado resultados impressionantes em diversas regiões do país.</p><h3>Como Participar:</h3><ul><li>Identifique necessidades locais</li><li>Forme grupos de ação</li><li>Estabeleça parcerias</li></ul>', imagem: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800', data: '2024-01-20', palavras: ['social', 'comunidade', 'voluntariado', 'impacto', 'transformação'] },
                { autor_id: 3, titulo: 'Inovação Digital: Inteligência Artificial no Cotidiano', conteudo: '<h2>IA no Nosso Dia a Dia</h2><p>A inteligência artificial já faz parte de nossas vidas de maneiras que muitas vezes nem percebemos. Desde assistentes virtuais até sistemas de recomendação, a IA está transformando nossa rotina.</p><p>Com o avanço do machine learning e processamento de linguagem natural, as possibilidades são cada vez mais amplas e acessíveis.</p>', imagem: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', data: '2024-02-01', palavras: ['tecnologia', 'IA', 'inovação', 'digital', 'futuro'] },
                { autor_id: 4, titulo: 'Educação Transformadora: Novos Métodos de Aprendizado', conteudo: '<h2>Revolucionando a Educação</h2><p>Novos métodos de ensino estão surgindo para atender às demandas do século XXI. Aprendizagem baseada em projetos, ensino híbrido e gamificação são algumas das abordagens que estão transformando a educação.</p>', imagem: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', data: '2024-02-10', palavras: ['educação', 'aprendizado', 'métodos', 'inovação', 'ensino'] },
                { autor_id: 5, titulo: 'Saúde Mental: A Importância do Bem-Estar Emocional', conteudo: '<h2>Cuidando da Mente</h2><p>A saúde mental é tão importante quanto a saúde física. Em um mundo cada vez mais acelerado, dedicar tempo ao autocuidado emocional se torna essencial para uma vida equilibrada.</p>', imagem: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800', data: '2024-02-15', palavras: ['saúde', 'mental', 'bem-estar', 'emocional', 'psicologia'] },
                { autor_id: 6, titulo: 'Sustentabilidade Urbana: Cidades do Futuro', conteudo: '<h2>Construindo Cidades Inteligentes</h2><p>As cidades do futuro precisam ser sustentáveis, inteligentes e inclusivas. Tecnologias verdes, mobilidade urbana eficiente e planejamento participativo são fundamentais para criar espaços urbanos melhores.</p>', imagem: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', data: '2024-03-01', palavras: ['sustentabilidade', 'urbano', 'cidades', 'futuro', 'meio ambiente'] }
            ];

            const stmtArtigo = db.prepare('INSERT INTO artigos (autor_id, titulo, conteudo, imagem, data_publicacao) VALUES (?, ?, ?, ?, ?)');
            artigos.forEach((a) => {
                stmtArtigo.run(a.autor_id, a.titulo, a.conteudo, a.imagem, a.data, function() {
                    const artigoId = this.lastID;
                    a.palavras.forEach(palavra => {
                        db.run('INSERT OR IGNORE INTO palavras_chave (palavra) VALUES (?)', [palavra], function() {
                            db.get('SELECT id FROM palavras_chave WHERE palavra = ?', [palavra], (err, row) => {
                                if (row) db.run('INSERT OR IGNORE INTO artigo_palavras (artigo_id, palavra_id) VALUES (?, ?)', [artigoId, row.id]);
                            });
                        });
                    });
                });
            });
            stmtArtigo.finalize();
            console.log('✅ Artigos padrão inseridos');
        }
    });
}

// Rota para criar autor COM upload de foto
app.post('/api/autores', upload.single('fotoFile'), (req, res) => {
    const { nome, email, senha, especialidade, bio } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha' });
    }
    
    // Verificar email duplicado
    db.get('SELECT id FROM autores WHERE email = ?', [email], (err, row) => {
        if (row) return res.status(400).json({ erro: 'E-mail já cadastrado' });
        
        // Determinar foto: upload > avatar gerado
        let foto = null;
        if (req.file) {
            foto = '/uploads/' + req.file.filename;
        }
        
        db.run('INSERT INTO autores (nome, email, senha, foto, bio, especialidade) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, senha, foto, bio || null, especialidade || null], function(err) {
                if (err) return res.status(500).json({ erro: err.message });
                res.json({ id: this.lastID, nome, email, foto: foto });
            });
    });
});

// Rota para atualizar autor COM upload de foto
app.put('/api/autores/:id', upload.single('fotoFile'), (req, res) => {
    const { nome, email, senha, bio, especialidade } = req.body;
    const updates = [];
    const params = [];

    if (nome !== undefined && nome !== null) { updates.push('nome = ?'); params.push(nome); }
    if (email !== undefined && email !== null) { updates.push('email = ?'); params.push(email); }
    if (senha !== undefined && senha !== '') { updates.push('senha = ?'); params.push(senha); }
    if (bio !== undefined && bio !== null) { updates.push('bio = ?'); params.push(bio); }
    if (especialidade !== undefined && especialidade !== null) { updates.push('especialidade = ?'); params.push(especialidade); }
    
    // Se enviou foto, atualizar
    if (req.file) {
        updates.push('foto = ?');
        params.push('/uploads/' + req.file.filename);
    }

    if (updates.length === 0) return res.json({ mensagem: 'Nada para atualizar' });

    params.push(req.params.id);
    db.run(`UPDATE autores SET ${updates.join(', ')} WHERE id = ?`, params, function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        db.get('SELECT id, nome, email, foto, bio, especialidade FROM autores WHERE id = ?', [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: 'Autor atualizado', autor: row });
        });
    });
});

// ==========================================
// ROTAS - AUTENTICAÇÃO
// ==========================================

app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    db.get('SELECT id, nome, email, foto, bio, especialidade, is_master_admin FROM autores WHERE email = ? AND senha = ? AND ativo = 1', [email, senha], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (!row) return res.status(401).json({ erro: 'Credenciais inválidas' });
        res.json({
            id: row.id, nome: row.nome, email: row.email, foto: row.foto,
            bio: row.bio, especialidade: row.especialidade,
            isMasterAdmin: row.is_master_admin === 1
        });
    });
});

// ==========================================
// ROTAS - AUTORES
// ==========================================

app.get('/api/autores/:id', (req, res) => {
    db.get('SELECT id, nome, email, foto, bio, especialidade, is_master_admin FROM autores WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (!row) return res.status(404).json({ erro: 'Autor não encontrado' });
        res.json({
            id: row.id,
            nome: row.nome,
            email: row.email,
            foto: row.foto,
            bio: row.bio,
            especialidade: row.especialidade,
            isMasterAdmin: row.is_master_admin === 1,
            is_master_admin: row.is_master_admin
        });
    });
});

app.post('/api/autores', (req, res) => {
    const { nome, email, senha, foto, bio, especialidade } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha' });
    db.get('SELECT id FROM autores WHERE email = ?', [email], (err, row) => {
        if (row) return res.status(400).json({ erro: 'E-mail já cadastrado' });
        db.run('INSERT INTO autores (nome, email, senha, foto, bio, especialidade) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, email, senha, foto || null, bio || null, especialidade || null], function(err) {
                if (err) return res.status(500).json({ erro: err.message });
                res.json({ id: this.lastID, nome, email });
            });
    });
});

app.put('/api/autores/:id', (req, res) => {
    const { nome, email, senha, foto, bio, especialidade } = req.body;
    const updates = [];
    const params = [];

    if (nome !== undefined && nome !== null) { updates.push('nome = ?'); params.push(nome); }
    if (email !== undefined && email !== null) { updates.push('email = ?'); params.push(email); }
    if (senha !== undefined && senha !== '') { updates.push('senha = ?'); params.push(senha); }
    if (foto !== undefined && foto !== null) { updates.push('foto = ?'); params.push(foto); }
    if (bio !== undefined && bio !== null) { updates.push('bio = ?'); params.push(bio); }
    if (especialidade !== undefined && especialidade !== null) { updates.push('especialidade = ?'); params.push(especialidade); }

    if (updates.length === 0) return res.json({ mensagem: 'Nada para atualizar' });

    params.push(req.params.id);
    db.run(`UPDATE autores SET ${updates.join(', ')} WHERE id = ?`, params, function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        db.get('SELECT id, nome, email, foto, bio, especialidade FROM autores WHERE id = ?', [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ erro: err.message });
            console.log('✅ Autor atualizado:', row.nome, '| Bio:', (row.bio || '').substring(0, 30) + '...', '| Esp:', row.especialidade);
            res.json({ mensagem: 'Autor atualizado', autor: row });
        });
    });
});

app.delete('/api/autores/:id', (req, res) => {
    db.run('DELETE FROM autores WHERE id = ? AND is_master_admin = 0', [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Autor removido' });
    });
});

// ==========================================
// ROTAS - ARTIGOS (COM JOIN PARA DADOS ATUALIZADOS)
// ==========================================

app.get('/api/artigos', (req, res) => {
    db.all(`
        SELECT a.id, a.titulo, a.conteudo, a.imagem, a.data_publicacao, a.autor_id,
               au.nome as autor_nome, au.foto as autor_foto,
               au.bio as autor_bio, au.especialidade as autor_especialidade,
               GROUP_CONCAT(pc.palavra) as palavras
        FROM artigos a
        JOIN autores au ON a.autor_id = au.id
        LEFT JOIN artigo_palavras ap ON a.id = ap.artigo_id
        LEFT JOIN palavras_chave pc ON ap.palavra_id = pc.id
        GROUP BY a.id
        ORDER BY a.data_publicacao DESC
    `, (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows.map(r => ({
            id: r.id, titulo: r.titulo, conteudo: r.conteudo, imagem: r.imagem,
            dataPublicacao: r.data_publicacao, data_publicacao: r.data_publicacao,
            autor_id: r.autor_id, autorId: r.autor_id,
            autor_nome: r.autor_nome, autor: r.autor_nome,
            autor_foto: r.autor_foto, autorFoto: r.autor_foto,
            autor_bio: r.autor_bio || '', autorBio: r.autor_bio || '',
            autor_especialidade: r.autor_especialidade || '', autorEspecialidade: r.autor_especialidade || '',
            palavrasChave: r.palavras ? r.palavras.split(',') : [],
            palavras: r.palavras ? r.palavras.split(',') : []
        })));
    });
});

app.get('/api/artigos/:id', (req, res) => {
    db.get(`
        SELECT a.id, a.titulo, a.conteudo, a.imagem, a.data_publicacao, a.autor_id,
               au.nome as autor_nome, au.foto as autor_foto,
               au.bio as autor_bio, au.especialidade as autor_especialidade,
               GROUP_CONCAT(pc.palavra) as palavras
        FROM artigos a
        JOIN autores au ON a.autor_id = au.id
        LEFT JOIN artigo_palavras ap ON a.id = ap.artigo_id
        LEFT JOIN palavras_chave pc ON ap.palavra_id = pc.id
        WHERE a.id = ?
        GROUP BY a.id
    `, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (!row) return res.status(404).json({ erro: 'Artigo não encontrado' });
        console.log('📄 Artigo ID:', req.params.id, '| Autor:', row.autor_nome, '| Bio:', (row.autor_bio || 'VAZIA').substring(0, 30) + '...');
        res.json({
            id: row.id, titulo: row.titulo, conteudo: row.conteudo, imagem: row.imagem,
            dataPublicacao: row.data_publicacao, data_publicacao: row.data_publicacao,
            autor_id: row.autor_id, autorId: row.autor_id,
            autor_nome: row.autor_nome, autor: row.autor_nome,
            autor_foto: row.autor_foto, autorFoto: row.autor_foto,
            autor_bio: row.autor_bio || '', autorBio: row.autor_bio || '',
            autor_especialidade: row.autor_especialidade || '', autorEspecialidade: row.autor_especialidade || '',
            palavrasChave: row.palavras ? row.palavras.split(',') : [],
            palavras: row.palavras ? row.palavras.split(',') : []
        });
    });
});

// Rota para criar artigo COM upload de imagem
app.post('/api/artigos', upload.single('imagemFile'), (req, res) => {
    const { titulo, conteudo, autorId, palavrasChave, imagemUrl } = req.body;
    
    if (!titulo || !conteudo || !autorId) {
        return res.status(400).json({ erro: 'Campos obrigatórios: titulo, conteudo, autorId' });
    }
    
    // Determinar a imagem: upload > URL > placeholder
    let imagem = null;
    if (req.file) {
        // Imagem enviada por upload
        imagem = '/uploads/' + req.file.filename;
    } else if (imagemUrl && imagemUrl.trim() !== '') {
        // URL fornecida
        imagem = imagemUrl.trim();
    } else {
        // Placeholder
        imagem = 'https://via.placeholder.com/800x400?text=Sem+imagem';
    }
    
    db.run('INSERT INTO artigos (titulo, conteudo, imagem, autor_id) VALUES (?, ?, ?, ?)',
        [titulo, conteudo, imagem, autorId], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            
            const artigoId = this.lastID;
            
            // Palavras-chave
            if (palavrasChave) {
                const palavras = typeof palavrasChave === 'string' 
                    ? JSON.parse(palavrasChave) 
                    : palavrasChave;
                    
                palavras.forEach(palavra => {
                    if (palavra && palavra.trim()) {
                        db.run('INSERT OR IGNORE INTO palavras_chave (palavra) VALUES (?)', [palavra.trim()], function() {
                            db.get('SELECT id FROM palavras_chave WHERE palavra = ?', [palavra.trim()], (err, row) => {
                                if (row) db.run('INSERT INTO artigo_palavras (artigo_id, palavra_id) VALUES (?, ?)', [artigoId, row.id]);
                            });
                        });
                    }
                });
            }
            
            res.json({ 
                id: artigoId, 
                titulo, 
                imagem: imagem,
                mensagem: 'Artigo criado com sucesso' 
            });
        });
});

app.put('/api/artigos/:id', (req, res) => {
    const { titulo, conteudo, imagem, palavrasChave } = req.body;
    db.run('UPDATE artigos SET titulo = ?, conteudo = ?, imagem = ? WHERE id = ?',
        [titulo, conteudo, imagem, req.params.id], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            if (palavrasChave) {
                db.run('DELETE FROM artigo_palavras WHERE artigo_id = ?', [req.params.id]);
                palavrasChave.forEach(palavra => {
                    if (palavra && palavra.trim()) {
                        db.run('INSERT OR IGNORE INTO palavras_chave (palavra) VALUES (?)', [palavra.trim()], function() {
                            db.get('SELECT id FROM palavras_chave WHERE palavra = ?', [palavra.trim()], (err, row) => {
                                if (row) db.run('INSERT INTO artigo_palavras (artigo_id, palavra_id) VALUES (?, ?)', [req.params.id, row.id]);
                            });
                        });
                    }
                });
            }
            res.json({ mensagem: 'Artigo atualizado' });
        });
});

app.delete('/api/artigos/:id', (req, res) => {
    db.run('DELETE FROM artigos WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Artigo removido' });
    });
});

// ==========================================
// ROTAS - VOLUNTÁRIOS
// ==========================================

app.post('/api/voluntarios', (req, res) => {
    const { nome, email, telefone, telefoneFormatado, tipoTelefone } = req.body;
    if (!nome || !email || !telefone) return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, telefone' });
    db.run('INSERT INTO voluntarios (nome, email, telefone, telefone_formatado, tipo_telefone) VALUES (?, ?, ?, ?, ?)',
        [nome, email, telefone, telefoneFormatado || null, tipoTelefone || null], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ id: this.lastID, mensagem: 'Voluntário cadastrado com sucesso' });
        });
});

// ==========================================
// ROTAS - NEWSLETTER
// ==========================================

app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail é obrigatório' });
    db.run('INSERT OR IGNORE INTO newsletter (email) VALUES (?)', [email], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Inscrito na newsletter com sucesso', id: this.lastID });
    });
});

// ==========================================
// ROTAS - VOLUNTÁRIOS
// ==========================================

app.post('/api/voluntarios', (req, res) => {
    const { nome, email, telefone, telefoneFormatado, tipoTelefone } = req.body;
    if (!nome || !email || !telefone) return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, telefone' });
    db.run('INSERT INTO voluntarios (nome, email, telefone, telefone_formatado, tipo_telefone) VALUES (?, ?, ?, ?, ?)',
        [nome, email, telefone, telefoneFormatado || null, tipoTelefone || null], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ id: this.lastID, mensagem: 'Voluntário cadastrado com sucesso' });
        });
});

// ADICIONAR ESTA ROTA GET
app.get('/api/voluntarios', (req, res) => {
    db.all('SELECT * FROM voluntarios ORDER BY data_registro DESC', (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// ==========================================
// ROTAS - NEWSLETTER
// ==========================================

app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail é obrigatório' });
    db.run('INSERT OR IGNORE INTO newsletter (email) VALUES (?)', [email], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Inscrito na newsletter com sucesso', id: this.lastID });
    });
});

// ADICIONAR ESTA ROTA GET
app.get('/api/newsletter', (req, res) => {
    db.all('SELECT * FROM newsletter ORDER BY data_inscricao DESC', (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// Listar todos os autores
app.get('/api/autores', (req, res) => {
    db.all('SELECT id, nome, email, foto, bio, especialidade, is_master_admin, ativo, data_cadastro FROM autores WHERE ativo = 1 ORDER BY nome', (err, rows) => {
        if (err) {
            console.error('Erro ao buscar autores:', err);
            return res.status(500).json({ erro: err.message });
        }
        res.json(rows.map(r => ({
            id: r.id,
            nome: r.nome,
            email: r.email,
            foto: r.foto || null,
            bio: r.bio,
            especialidade: r.especialidade,
            isMasterAdmin: r.is_master_admin === 1,
            is_master_admin: r.is_master_admin,
            ativo: r.ativo,
            data_cadastro: r.data_cadastro
        })));
    });
});

// Buscar autor por ID
app.get('/api/autores/:id', (req, res) => {
    db.get('SELECT id, nome, email, foto, bio, especialidade, is_master_admin FROM autores WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (!row) return res.status(404).json({ erro: 'Autor não encontrado' });
        res.json({
            id: row.id,
            nome: row.nome,
            email: row.email,
            foto: row.foto || null,
            bio: row.bio,
            especialidade: row.especialidade,
            isMasterAdmin: row.is_master_admin === 1,
            is_master_admin: row.is_master_admin
        });
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log('🚀 Servidor rodando em http://localhost:' + PORT);
    console.log('📦 Banco de dados SQLite: blogsocial.db');
});