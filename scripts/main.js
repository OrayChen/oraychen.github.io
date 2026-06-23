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

})();
