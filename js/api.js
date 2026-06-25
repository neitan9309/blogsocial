var API = {
    BASE_URL: '/api',

    login: function(email, senha) {
        return fetch(this.BASE_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, senha: senha })
        }).then(function(r) { return r.json(); });
    },

    getAutores: function() {
        return fetch(this.BASE_URL + '/autores').then(function(r) { return r.json(); });
    },

    getAutor: function(id) {
        return fetch(this.BASE_URL + '/autores/' + id).then(function(r) { return r.json(); });
    },

    criarAutor: function(dados) {
        return fetch(this.BASE_URL + '/autores', {
            method: 'POST',
            body: dados  // FormData
        }).then(function(r) { return r.json(); });
    },

    atualizarAutor: function(id, dados) {
        return fetch(this.BASE_URL + '/autores/' + id, {
            method: 'PUT',
            body: dados  // FormData
        }).then(function(r) { return r.json(); });
    },

    excluirAutor: function(id) {
        return fetch(this.BASE_URL + '/autores/' + id, { method: 'DELETE' }).then(function(r) { return r.json(); });
    },

    getArtigos: function() {
        return fetch(this.BASE_URL + '/artigos').then(function(r) { return r.json(); });
    },

    getArtigo: function(id) {
        return fetch(this.BASE_URL + '/artigos/' + id).then(function(r) { return r.json(); });
    },

    criarArtigo: function(dados) {
        return fetch(this.BASE_URL + '/artigos', {
            method: 'POST',
            body: dados  // FormData
        }).then(function(r) { return r.json(); });
    },

    excluirArtigo: function(id) {
        return fetch(this.BASE_URL + '/artigos/' + id, { method: 'DELETE' }).then(function(r) { return r.json(); });
    },

    cadastrarVoluntario: function(dados) {
        return fetch(this.BASE_URL + '/voluntarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).then(function(r) { return r.json(); });
    },

    inscreverNewsletter: function(email) {
        return fetch(this.BASE_URL + '/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        }).then(function(r) { return r.json(); });
    }
};