// WellRx site — shared interactions
document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  // Flip cards: tap-to-flip on touch devices (in addition to hover on desktop)
  document.querySelectorAll('.flip-card').forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
  });

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 8) {
        header.style.boxShadow = '0 4px 16px rgba(15,23,42,0.08)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }

  // Certification badge -> full-size certificate modal
  var certModal = document.getElementById('certModal');
  if (certModal) {
    var certImageWrap = document.getElementById('certModalImage');
    var certLabelEl = document.getElementById('certModalLabel');

    // Real certificate scans, dropped into assets/img/Certificates/.
    var certFiles = {
      'api-q1': ['assets/img/Certificates/API-Q1.png'],
      'api-11d1': ['assets/img/Certificates/API-11D1.png'],
      'api-5b': ['assets/img/Certificates/API-5B.png'],
      'api-14l': ['assets/img/Certificates/API-14L.png'],
      'api-19ac': ['assets/img/Certificates/API-19AC.png']
    };

    function tryLoadSequence(candidates, i, onSuccess, onFail) {
      if (i >= candidates.length) { onFail(); return; }
      var img = new Image();
      img.onload = function () { onSuccess(img); };
      img.onerror = function () { tryLoadSequence(candidates, i + 1, onSuccess, onFail); };
      img.src = candidates[i];
    }

    function openCertModal(key, label) {
      var candidates = certFiles[key] || ['assets/img/Certificates/' + label + '.png'];
      certLabelEl.textContent = label + ' Certification';
      certModal.classList.add('open');
      tryLoadSequence(candidates, 0, function (img) {
        img.alt = label + ' certificate';
        certImageWrap.innerHTML = '';
        certImageWrap.appendChild(img);
      }, function () {
        certImageWrap.innerHTML =
          '<div class="cert-placeholder">' +
          '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 14.27l-4.8 2.49.92-5.34L4.24 7.64l5.36-.78L12 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="10" r="3.2" stroke="currentColor" stroke-width="1.4"/></svg>' +
          '<strong>' + label + '</strong>' +
          '<span>Certificate scan to be added</span>' +
          '</div>';
      });
    }

    function closeCertModal() {
      certModal.classList.remove('open');
    }

    document.querySelectorAll('.cert-badge').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openCertModal(btn.getAttribute('data-cert'), btn.getAttribute('data-label'));
      });
    });

    var closeBtn = certModal.querySelector('.cert-modal-close');
    var backdrop = certModal.querySelector('.cert-modal-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeCertModal);
    if (backdrop) backdrop.addEventListener('click', closeCertModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCertModal();
    });
  }

  // News & Updates: category filter tabs
  var filterBtns = document.querySelectorAll('.news-filter-btn');
  if (filterBtns.length) {
    var filterables = document.querySelectorAll('.news-featured, .news-card');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-filter');
        filterables.forEach(function (el) {
          el.hidden = cat !== 'all' && el.getAttribute('data-cat') !== cat;
        });
      });
    });
  }

  // News & Updates: lazy-load YouTube embed on click
  document.querySelectorAll('.video-embed').forEach(function (embed) {
    embed.addEventListener('click', function () {
      var videoId = embed.getAttribute('data-video-id');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1';
      iframe.title = 'YouTube video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      embed.innerHTML = '';
      embed.appendChild(iframe);
    });
  });

  // News & Updates: click a card to expand it, with a photo carousel for multi-image items
  var newsModal = document.getElementById('newsModal');
  if (newsModal) {
    var carouselWrap = newsModal.querySelector('.news-modal-carousel');
    var modalImage = document.getElementById('newsModalImage');
    var modalDots = document.getElementById('newsModalDots');
    var modalBadge = document.getElementById('newsModalBadge');
    var modalDate = document.getElementById('newsModalDate');
    var modalTitle = document.getElementById('newsModalTitle');
    var modalBlurb = document.getElementById('newsModalBlurb');
    var prevBtn = newsModal.querySelector('.carousel-prev');
    var nextBtn = newsModal.querySelector('.carousel-next');
    var galleryImages = [];
    var galleryIndex = 0;

    function renderDots() {
      modalDots.innerHTML = '';
      if (galleryImages.length < 2) return;
      galleryImages.forEach(function (src, i) {
        var dot = document.createElement('span');
        if (i === galleryIndex) dot.className = 'active';
        dot.addEventListener('click', function () { showImage(i); });
        modalDots.appendChild(dot);
      });
    }

    function showImage(i) {
      galleryIndex = (i + galleryImages.length) % galleryImages.length;
      modalImage.src = galleryImages[galleryIndex];
      renderDots();
    }

    function openNewsModal(card) {
      var imagesAttr = card.getAttribute('data-images') || '';
      galleryImages = imagesAttr ? imagesAttr.split(',') : [];
      galleryIndex = 0;

      carouselWrap.classList.toggle('contain', card.getAttribute('data-logo') === 'true');
      carouselWrap.classList.toggle('no-image', galleryImages.length === 0);
      var hasMultiple = galleryImages.length > 1;
      prevBtn.hidden = !hasMultiple;
      nextBtn.hidden = !hasMultiple;

      if (galleryImages.length) {
        modalImage.src = galleryImages[0];
        modalImage.alt = card.querySelector('h3').textContent;
      }
      renderDots();

      var badgeEl = card.querySelector('.badge');
      modalBadge.textContent = badgeEl.textContent;
      modalBadge.className = 'badge ' + badgeEl.className.replace('badge', '').trim();
      modalDate.textContent = card.querySelector('.news-date').textContent;
      modalTitle.textContent = card.querySelector('h3').textContent;
      modalBlurb.textContent = card.querySelector('p').textContent;

      newsModal.classList.add('open');
    }

    function closeNewsModal() {
      newsModal.classList.remove('open');
    }

    document.querySelectorAll('.news-card').forEach(function (card) {
      card.addEventListener('click', function () { openNewsModal(card); });
    });

    prevBtn.addEventListener('click', function () { showImage(galleryIndex - 1); });
    nextBtn.addEventListener('click', function () { showImage(galleryIndex + 1); });
    newsModal.querySelector('.news-modal-close').addEventListener('click', closeNewsModal);
    newsModal.querySelector('.news-modal-backdrop').addEventListener('click', closeNewsModal);
    document.addEventListener('keydown', function (e) {
      if (!newsModal.classList.contains('open')) return;
      if (e.key === 'Escape') closeNewsModal();
      if (e.key === 'ArrowLeft') showImage(galleryIndex - 1);
      if (e.key === 'ArrowRight') showImage(galleryIndex + 1);
    });
  }
});
