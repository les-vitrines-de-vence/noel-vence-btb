(() => {
  'use strict';
  const root = document.getElementById('application');
  const asset = name => './assets/' + name + '.webp';
  const params = new URLSearchParams(location.search);

  // Aperçu technique utilisable pendant le contrôle, mais jamais pour modifier la date réelle.
  const preview = params.get('apercu') === '1' && /^(2026-10-(22|23|24|25)|2026-12-25)$/.test(params.get('date') || '')
    ? params.get('date') : null;
  function parisToday() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date()).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  const day = preview || parisToday();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const mailto = 'mailto:papeterie.multiservices@yahoo.fr?subject=' +
    encodeURIComponent('Demande de devis — Noël en avance — Offre BtB -50 %') +
    '&body=' + encodeURIComponent(
      'Bonjour,\n\nJe suis membre BtB et souhaite recevoir un devis pour la création de mon site internet.\n\nEntreprise :\nNom :\nTéléphone :\nMon projet :\n\nCordialement,'
    );
  const demonstration = (shop, address, title, code) => ({
    shop, address, title, code,
    description: 'Simulation uniquement : aucune remise réelle.', fictive: true
  });
  const bernard = demonstration('L’ARTISANAT AVANCE', '31 av. Marcellin Maurel · Vence', '–100 % sur ce qui n’est pas en magasin !', 'BERNARD100');
  const cadeau = demonstration('La Maison des Cadeaux', 'Commerce fictif · Vence', 'Un cadeau surprise de Noël', 'CADEAU24');
  const lumieres = demonstration('Les Lumières de Vence', 'Commerce fictif · Vence', 'Une surprise lumineuse', 'LUMIERE25');
  const fleurs = demonstration('L’Atelier des Étoiles', 'Commerce fictif · Vence', 'Une attention festive', 'ETOILE25');
  const real = {
    shop: 'Papeterie Multi-Services', address: '11 avenue Marcellin Maurel · Vence',
    title: '–50 % sur votre site internet',
    description: 'Sur l’ensemble de la prestation proposée sur le devis. Réservé aux membres BtB, sous réserve de vérification de l’adhésion ; non cumulable.',
    deadline: 'Demande de devis au plus tard le 31 décembre 2026.', fictive: false
  };
  const dayOffers = {
    '2026-10-22': [bernard],
    '2026-10-23': [real],
    '2026-10-24': [cadeau, lumieres],
    '2026-10-25': [bernard, cadeau, fleurs]
  };
  const safePages = new Set(['accueil', 'offres', 'qr', 'noel']);
  let page = safePages.has(location.hash.slice(1)) ? location.hash.slice(1) : 'accueil';

  function layout(kind, background, content) {
    return `<section class="screen ${kind}" style="--bg:url('${asset(background)}')">
      <div class="stage"><img class="poster" src="${asset(background)}" alt="" aria-hidden="true" draggable="false">${content}</div>
    </section>`;
  }
  function navigate(destination) {
    page = destination;
    history.replaceState(null, '', location.pathname + location.search + '#' + destination);
    render();
  }
  function navButton(destination, label, extraClass='') {
    return `<button type="button" data-go="${destination}" class="nav-button ${extraClass}">${label}</button>`;
  }
  function offerCard(offer, index, count) {
    const image = asset('deco' + (index % 3 + 1));
    const type = offer.fictive ? 'DÉMONSTRATION · OFFRE FICTIVE' : 'EXCLUSIVITÉ MEMBRES BtB';
    const action = offer.fictive
      ? `<button type="button" class="copy-code" data-code="${esc(offer.code)}" title="Copier un code fictif">Copier ${esc(offer.code)}</button>`
      : `<a href="${mailto}" class="email-button" title="Demander un devis par e-mail">Demander mon devis</a>`;
    return `<article class="offer-card ${offer.fictive ? 'fictive' : 'commerciale'}">
      <img class="decoration" src="${image}" alt="" aria-hidden="true" draggable="false">
      <div class="card-content">
        <span class="offer-tag">${type}</span>
        <div class="offer-shop">${esc(offer.shop)}</div>
        <h2 class="offer-title">${esc(offer.title)}</h2>
        <p class="offer-description">${esc(offer.description)}</p>
        ${offer.deadline ? `<p class="offer-deadline">${esc(offer.deadline)}</p>` : ''}
        <div class="card-bottom"><span class="offer-address">${esc(offer.address)}</span>${action}</div>
      </div>
    </article>`;
  }
  function render() {
    if (page === 'noel' || day === '2026-12-25') {
      root.innerHTML = layout('christmas-screen', 'noel', '');
      return;
    }
    if (page === 'accueil') {
      root.innerHTML = layout('home-screen', 'accueil',
        '<button type="button" class="home-hotspot" data-go="offres" aria-label="Voir les offres du jour"></button>');
      return;
    }
    if (page === 'qr') {
      // Version de présentation BtB : visuel original fourni avec cartouche libre.
      // Les mentions commerciales sont des éléments HTML, pas du texte gravé dans l’image.
      root.innerHTML = layout('qr-screen', 'qr-presentation', `
        <div class="qr-promo-ribbon" aria-label="Un QR code, plusieurs promotions">
          <strong>Un seul QR code, des offres renouvelées chaque jour !</strong>
          <span>Vos clients scannent le même QR et découvrent une nouvelle surprise.</span>
        </div>
        <div class="qr-merchant-message" aria-label="Exemple d’utilisation pour les commerçants">
          <strong>Et pour votre commerce ?</strong>
          <span>Une seule affiche sur votre vitrine ou vos flyers. Une nouvelle promotion chaque jour.</span>
          <small>Une démonstration de Papeterie Multi-Services.</small>
        </div>
        <nav class="qr-navigation" aria-label="Navigation">${navButton('offres', 'Retour aux offres')}${navButton('accueil', 'Accueil')}</nav>
      `);
      return;
    }
    const offers = dayOffers[day] || [];
    const dateLabel = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date(day + 'T12:00:00Z'));
    const cards = offers.length ? offers.map((offer, i) => offerCard(offer, i, offers.length)).join('') : `
      <article class="empty-message">
        <strong>Les surprises arrivent !</strong>
        <span>Présentation du 22 au 25 octobre 2026.</span>
        <span>La remise BtB reste valable sur demande de devis jusqu’au 31 décembre.</span>
        <a class="email-button" href="${mailto}">Demander mon devis</a>
      </article>`;
    // Une seule scène IMPRIMÉE par écran. Aucun scroll ni recalcul du fond.
    // Cartes et liens sont posés dans les zones réservées du fond fourni.
    root.innerHTML = layout('offers-screen', 'fond-offres', `
      <div class="calendar-date">${esc(dateLabel)}</div>
      <section class="card-region count-${offers.length}" aria-label="Offres du jour">${cards}</section>
      <nav class="offer-navigation" aria-label="Navigation">${navButton('accueil','Accueil')}${navButton('qr','Comment ça marche ?')}</nav>
      <span id="announce" class="visually-hidden" role="status"></span>
    `);
  }
  root.addEventListener('click', async event => {
    const nav = event.target.closest('[data-go]');
    if (nav) { navigate(nav.dataset.go); return; }
    const copy = event.target.closest('[data-code]');
    if (copy) {
      const code = copy.dataset.code;
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(code);
        else {
          const input = document.createElement('textarea');input.value=code;
          input.style.position='fixed'; input.style.opacity='0'; document.body.append(input);
          input.select(); if (!document.execCommand('copy')) throw new Error('Copie indisponible'); input.remove();
        }
        const previous=copy.textContent;copy.textContent='Copié !';
        document.getElementById('announce')?.replaceChildren(document.createTextNode('Code fictif copié'));
        setTimeout(() => { if (copy.isConnected) copy.textContent=previous; }, 1600);
      } catch { copy.textContent='Code : ' + code; }
    }
  });
  window.addEventListener('hashchange', () => {
    const next = location.hash.slice(1);
    page = safePages.has(next) ? next : 'accueil';render();
  });
  render();
})();
