(function () {
  var WA_NUMBER = '5493413056402';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header compacto al hacer scroll
  var header = document.querySelector('header');
  function onScroll() { header.classList.toggle('is-scrolled', scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Aparición de secciones al entrar en pantalla
  var revealables = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Proceso: imagen con parallax suave
  var feature = document.getElementById('proceso');
  if (feature) {
    var img = feature.querySelector('.fv-img');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e, o) {
        e.forEach(function (x) { if (x.isIntersecting) { feature.classList.add('in'); o.disconnect(); } });
      }, { threshold: 0.25 }).observe(feature);
    } else feature.classList.add('in');
    if (!reduce) {
      var ticking = false;
      var update = function () {
        var r = feature.getBoundingClientRect();
        var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        img.style.setProperty('--py', (p * -40).toFixed(1) + 'px');
        ticking = false;
      };
      addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }
  }

  // Galería: duplica las fotos para el carrusel infinito
  if (!reduce) {
    document.querySelectorAll('.g-row').forEach(function (row) {
      Array.prototype.slice.call(row.children).forEach(function (li) {
        var clone = li.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelector('img').alt = '';
        row.appendChild(clone);
      });
      row.classList.add('is-looping');
    });
  }

  // Formulario -> WhatsApp
  var form = document.getElementById('quote-form');
  var status = form.querySelector('.form-status');
  var select = form.elements.solucion;

  // Las tarjetas de soluciones preseleccionan la opción
  document.querySelectorAll('[data-solution]').forEach(function (card) {
    card.addEventListener('click', function () {
      select.value = card.getAttribute('data-solution');
      setTimeout(function () { form.elements.nombre.focus({ preventScroll: true }); }, 600);
    });
  });

  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field');
    if (f) f.classList.remove('has-error');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = null;
    ['nombre', 'empresa', 'solucion'].forEach(function (name) {
      var el = form.elements[name];
      var bad = !el.value.trim();
      el.closest('.field').classList.toggle('has-error', bad);
      el.setAttribute('aria-invalid', bad);
      if (bad && !invalid) invalid = el;
    });
    if (invalid) {
      status.textContent = 'Completá nombre, empresa y qué necesitás.';
      invalid.focus();
      return;
    }

    var v = function (n) { return form.elements[n].value.trim(); };
    var lines = [
      'Hola Bordados DLM! Quiero pedir un presupuesto.',
      '',
      '*Nombre:* ' + v('nombre'),
      '*Empresa:* ' + v('empresa'),
      '*Necesito:* ' + v('solucion')
    ];
    if (v('cantidad')) lines.push('*Cantidad aprox.:* ' + v('cantidad'));
    if (v('detalle')) lines.push('*Detalle:* ' + v('detalle'));
    lines.push('', '(Enviado desde bordadosdlm.com.ar)');

    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    // Sin 'noopener' en features: con él window.open devuelve siempre null
    var win = window.open(url, '_blank');
    if (win) win.opener = null; else location.href = url;

    status.innerHTML = '';
    status.append('Abrimos WhatsApp con tu consulta. ¿No se abrió? ');
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Tocá acá';
    status.append(a, '.');

    if (typeof gtag === 'function') gtag('event', 'generate_lead', { method: 'whatsapp_form' });
  });

  // El botón flotante se oculta cuando el formulario está a la vista
  var floatBtn = document.querySelector('.wa-float');
  if (floatBtn && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      floatBtn.classList.toggle('is-hidden', e[0].isIntersecting);
    }, { threshold: 0.2 }).observe(document.getElementById('cotizar'));
  }
})();
