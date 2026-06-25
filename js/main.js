/**
 * Utilitários compartilhados entre todas as páginas do BlogSocial
 */
var BlogUtils = {
    /**
     * Gera o HTML de um card de artigo para listagem
     */
    criarCardArtigo: function(artigo) {
        return '<article class="artigo-card" onclick="window.location.href=\'artigo.html?id=' + artigo.id + '\'">' +
            '<div class="artigo-imagem">' +
                '<img src="' + artigo.imagem + '" alt="' + artigo.titulo + '" loading="lazy" onerror="this.src=\'https://via.placeholder.com/400x200?text=Sem+imagem\'">' +
            '</div>' +
            '<div class="artigo-info">' +
                '<h3>' + artigo.titulo + '</h3>' +
                '<div class="palavras-chave">' +
                    artigo.palavrasChave.map(function(k) { return '<span class="keyword-tag">' + k + '</span>'; }).join('') +
                '</div>' +
                '<div class="artigo-meta">' +
                    '<span>' + new Date(artigo.dataPublicacao + 'T12:00:00').toLocaleDateString('pt-BR') + '</span>' +
                    '<span>' + artigo.autor + '</span>' +
                '</div>' +
            '</div>' +
        '</article>';
    },

    /**
     * Configura o menu mobile
     */
    setupMobileMenu: function() {
        var mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        var navLinks = document.querySelector('.nav-links');
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });
        }
    },

    /**
     * Configura os formulários de newsletter no footer
     */
    setupNewsletter: function() {
        var newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var emailInput = form.querySelector('input[type="email"]');
                var email = emailInput.value.trim();

                if (!email) {
                    alert('Por favor, insira seu e-mail.');
                    return;
                }

                // Tentar salvar via API (servidor Node.js)
                try {
                    fetch('http://localhost:3000/api/newsletter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email })
                    })
                    .then(function(response) { return response.json(); })
                    .then(function(data) {
                        console.log('✅ Newsletter:', data);
                        alert('Obrigado por se inscrever! Você receberá nossas atualizações.');
                        form.reset();
                    })
                    .catch(function(error) {
                        console.warn('⚠️ Servidor não disponível, salvando localmente');
                        // Fallback: salvar no localStorage
                        var inscritos = JSON.parse(localStorage.getItem('newsletter') || '[]');
                        inscritos.push({ email: email, data: new Date().toISOString() });
                        localStorage.setItem('newsletter', JSON.stringify(inscritos));
                        console.log('📧 Newsletter (local):', email);
                        alert('Obrigado por se inscrever! Você receberá nossas atualizações.');
                        form.reset();
                    });
                } catch (error) {
                    console.error('❌ Erro:', error);
                    // Fallback: salvar no localStorage
                    var inscritosLocal = JSON.parse(localStorage.getItem('newsletter') || '[]');
                    inscritosLocal.push({ email: email, data: new Date().toISOString() });
                    localStorage.setItem('newsletter', JSON.stringify(inscritosLocal));
                    alert('Obrigado por se inscrever! Você receberá nossas atualizações.');
                    form.reset();
                }
            });
        });
    }
};

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    BlogUtils.setupMobileMenu();
    BlogUtils.setupNewsletter();
});