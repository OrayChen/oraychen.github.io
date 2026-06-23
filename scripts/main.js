/* ── Memoire Main Script ─────────────────────────────────────
   Global interactions:
   - Code copy buttons
   - Smooth anchor scrolling
   - Header scroll shadow
   ──────────────────────────────────────────────────────────── */

(function () {
  'use strict';

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

  // ── Run on initial load ──
  const main = document.querySelector('main');
  if (main) initPage(main);

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

})();
