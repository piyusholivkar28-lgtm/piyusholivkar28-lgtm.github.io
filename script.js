
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const eq = document.querySelector('.animated-equation');
if (eq) {
  const items = JSON.parse(eq.dataset.equations || '[]');
  let i = 0;
  if (items.length > 1) {
    setInterval(() => {
      i = (i + 1) % items.length;
      eq.animate(
        [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-5px)' }],
        { duration: 260, fill: 'forwards' }
      ).onfinish = () => {
        eq.textContent = items[i];
        eq.animate(
          [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 320, fill: 'forwards' }
        );
      };
    }, 4200);
  }
}

document.getElementById('year').textContent = new Date().getFullYear();
