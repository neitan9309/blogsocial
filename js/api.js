/**
 * API Client - BlogSocial
 * Comunicação com o backend SQLite
 */
var API = {
    BASE_URL: window.location.origin + '/api',

    // ==========================================
    // AUTORES
    // ==========================================

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).then(function(r) { return r.json(); });
    },

    atualizarAutor: function(id, dados) {
        return fetch(this.BASE_URL + '/autores/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).then(function(r) { return r.json(); });
    },

    excluirAutor: function(id) {
        return fetch(this.BASE_URL + '/autores/' + id, {
            method: 'DELETE'
        }).then(function(r) { return r.json(); });
    },

    // ==========================================
    // ARTIGOS
    // ==========================================

    getArtigos: function() {
        return fetch(this.BASE_URL + '/artigos').then(function(r) { return r.json(); });
    },

    getArtigo: function(id) {
        return fetch(this.BASE_URL + '/artigos/' + id).then(function(r) { return r.json(); });
    },

    criarArtigo: function(dados) {
        return fetch(this.BASE_URL + '/artigos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).then(function(r) { return r.json(); });
    },

    atualizarArtigo: function(id, dados) {
        return fetch(this.BASE_URL + '/artigos/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        }).then(function(r) { return r.json(); });
    },

    excluirArtigo: function(id) {
        return fetch(this.BASE_URL + '/artigos/' + id, {
            method: 'DELETE'
        }).then(function(r) { return r.json(); });
    },

    // ==========================================
    // VOLUNTÁRIOS E NEWSLETTER
    // ==========================================

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