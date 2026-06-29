/* ── Memoire Main Script ─────────────────────────────────────
   Global interactions:
   - Code copy buttons
   - Smooth anchor scrolling
   - Header scroll shadow
   ──────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // Cleanup: unregister any lingering service workers (PWA removed)
  // ═══════════════════════════════════════════════════════════
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (reg) { reg.unregister(); });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // initPage — runs on initial page load
  // ═══════════════════════════════════════════════════════════

  function initPage(container) {
    // ── Code Copy Buttons ──
    container.querySelectorAll('.code-copy').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', async () => {
        const codeBlock = btn.closest('.code-block');
        const code = codeBlock?.querySelector('code')?.textContent || '';
        try {
          await navigator.clipboard.writeText(code);
          btn.classList.add('copied');
          btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
          }, 2000);
        } catch {
          const textarea = document.createElement('textarea');
          textarea.value = code;
          textarea.style.position = 'fixed'; textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
      });
    });

    // ── Smooth anchor scroll ──
    container.querySelectorAll('a[href^="#"]').forEach(anchor => {
      if (anchor.dataset.bound) return;
      anchor.dataset.bound = '1';
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ── Dynamic relative time ──
  // Updates <time class="relative-time" data-modified="..."> elements
  // so static pages always show accurate "x天前" without a rebuild.
  function updateRelativeTimes(container) {
    container.querySelectorAll('time.relative-time[data-modified]').forEach(el => {
      const dateStr = el.getAttribute('data-modified');
      if (!dateStr) return;
      const then = new Date(dateStr);
      if (isNaN(then.getTime())) return;
      const now = new Date();
      const diffMs = now - then;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHour = Math.floor(diffMs / 3600000);
      const diffDay = Math.floor(diffMs / 86400000);
      const diffYear = Math.floor(diffDay / 365);
      let text;
      if (diffMs < 0) {
        const sameDay = then.getFullYear() === now.getFullYear() &&
          then.getMonth() === now.getMonth() &&
          then.getDate() === now.getDate();
        text = sameDay ? '今天' : `${then.getFullYear()}年${then.getMonth() + 1}月${then.getDate()}日`;
      } else if (diffYear >= 1) {
        text = `${diffYear} 年前`;
      } else if (diffDay >= 1) {
        text = `${diffDay} 天前`;
      } else if (diffHour >= 1) {
        const remainMin = diffMin % 60;
        text = remainMin > 0 ? `${diffHour} 小时 ${remainMin} 分钟前` : `${diffHour} 小时前`;
      } else {
        text = diffMin > 0 ? `${diffMin} 分钟前` : '刚刚';
      }
      el.textContent = text;
    });
  }

  // ── Run on initial load ──
  const main = document.querySelector('main');
  if (main) {
    initPage(main);
    updateRelativeTimes(main);
  }

  // ── Header scroll effect ──
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      header.style.boxShadow = currentScroll > 100
        ? '0 1px 3px rgba(61, 50, 38, 0.06)'
        : 'none';
    }, { passive: true });
  }

  // ── TOC: article table of contents (post pages only) ──
  initTOC();

  // ═══════════════════════════════════════════════════════════
  // initTOC — 文章目录：旁注风格侧栏 + 移动端抽屉
  // ═══════════════════════════════════════════════════════════
  function initTOC() {
    var postBody = document.querySelector('.post-body');
    if (!postBody) return;

    var headings = Array.from(postBody.querySelectorAll('h2.post-heading, h3.post-heading'));
    if (headings.length < 2) return;

    // Ensure each heading has an id
    headings.forEach(function(h, i) {
      if (!h.id) h.id = 'heading-' + i;
    });

    // Build TOC data — strip leading '#' from anchor element
    var tocItems = headings.map(function(h) {
      return {
        id: h.id,
        text: (h.textContent || '').trim().replace(/^#\s*/, ''),
        level: h.tagName.toLowerCase(),
        el: h
      };
    });

    // ── Render TOC items ──
    function renderItem(item) {
      var li = document.createElement('li');
      li.className = 'toc-item level-' + item.level;
      li.textContent = item.text;
      li.addEventListener('click', function() {
        item.el.scrollIntoView({ behavior: 'smooth' });
        closeMobileDrawer();
      });
      li.dataset.target = item.id;
      return li;
    }

    var tocList = document.getElementById('tocList');
    var tocMobileList = document.getElementById('tocMobileList');
    if (!tocList || !tocMobileList) return;

    tocItems.forEach(function(item) {
      tocList.appendChild(renderItem(item));
      tocMobileList.appendChild(renderItem(item));
    });

    // ── Scroll Spy ──
    var allLinks = document.querySelectorAll('.toc-item');

    function activateItem(id) {
      allLinks.forEach(function(link) {
        if (link.dataset.target === id) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          activateItem(entry.target.id);
        }
      });
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    });

    headings.forEach(function(h) { observer.observe(h); });

    // ── Sidebar visibility ──
    var sidebar = document.getElementById('tocSidebar');

    function updateSidebar() {
      if (window.innerWidth >= 1280) {
        sidebar.classList.add('visible');
      } else {
        sidebar.classList.remove('visible');
      }
    }

    updateSidebar();
    window.addEventListener('resize', updateSidebar);

    // ── Mobile drawer ──
    var mobileToggle = document.getElementById('tocMobileToggle');
    var mobileOverlay = document.getElementById('tocMobileOverlay');
    var mobileDrawer = document.getElementById('tocMobileDrawer');

    function openMobileDrawer() {
      mobileOverlay.classList.add('open');
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
      mobileOverlay.classList.remove('open');
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (mobileToggle) {
      mobileToggle.addEventListener('click', function() {
        if (mobileDrawer.classList.contains('open')) {
          closeMobileDrawer();
        } else {
          openMobileDrawer();
        }
      });
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', closeMobileDrawer);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeMobileDrawer();
      }
    });
  }

})();
