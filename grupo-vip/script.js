// Ano dinâmico no rodapé
document.getElementById("ano").textContent = new Date().getFullYear();

// Revelar elementos ao rolar a página (respeita prefers-reduced-motion via CSS)
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}

// Barra fixa de CTA (mobile): aparece só depois que o herói sai da tela
const stickyCta = document.getElementById("stickyCta");
const hero = document.querySelector(".hero");
if (stickyCta && hero && "IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      stickyCta.classList.toggle("visible", !entry.isIntersecting);
    },
    { threshold: 0 }
  );
  heroObserver.observe(hero);
}
