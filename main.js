/* Yutori Capital v4: cabecera, selector de idioma y conversacion guiada de contacto (espanol e ingles). */
const CONFIG = {
  // Receptor del formulario (por ejemplo un webhook de n8n con Turnstile). Mientras este vacio,
  // el formulario prepara un correo con las respuestas para que la persona solo tenga que enviarlo.
  endpoint: "",
  destino: "f.ojeda@yutorikapital.com",
  copia: "m.santana@yutorikapital.com",
};

const INGLES = document.documentElement.lang.toLowerCase().startsWith("en");

const TEXTOS = INGLES
  ? {
      nombre: "Please enter your name to continue.",
      unica: "Please choose an option to continue.",
      multiple: "Please choose at least one option.",
      correo: "Please check your email address.",
      privacidad: "Please accept the privacy policy to continue.",
      paso: (n, total) => `${n} of ${total}`,
      listo: "Done",
      enviar: "Send",
      continuar: "Continue",
      enviando: "Sending",
      asunto: "First conversation with Yutori",
      etiquetas: ["Name", "Profile", "Would like help with", "Approximate wealth", "Email", "Phone"],
      idioma: "Language: English",
      menu: "Menu",
      cerrar: "Close",
      preparado: (destino) => `We have drafted your message in your email app: all you need to do is send it. If it did not open, write to us at ${destino}.`,
      recibido: "We will write to you personally to find a time that suits you.",
      error: "We could not send the form. ",
      porCorreo: "Send it by email",
    }
  : {
      nombre: "Escriba su nombre para continuar.",
      unica: "Elija una opción para continuar.",
      multiple: "Elija al menos una opción.",
      correo: "Revise el correo electrónico.",
      privacidad: "Necesitamos su conformidad con la política de privacidad.",
      paso: (n, total) => `${n} de ${total}`,
      listo: "Listo",
      enviar: "Enviar",
      continuar: "Continuar",
      enviando: "Enviando",
      asunto: "Primera conversación con Yutori",
      etiquetas: ["Nombre", "Perfil", "Qué quiere resolver", "Patrimonio aproximado", "Correo", "Teléfono"],
      idioma: "",
      menu: "Menú",
      cerrar: "Cerrar",
      preparado: (destino) => `Hemos preparado su mensaje en su programa de correo: solo tiene que enviarlo. Si no se ha abierto, escríbanos a ${destino}.`,
      recibido: "Le escribiremos personalmente para buscar un momento que le venga bien.",
      error: "No hemos podido enviar el formulario. ",
      porCorreo: "Envíelo por correo",
    };

// Secciones equivalentes en las dos versiones, para cambiar de idioma sin perder el sitio
const SECCIONES = {
  inicio: "home",
  filosofia: "philosophy",
  manos: "many-hands",
  conservar: "preserve",
  situaciones: "sound-familiar",
  "para-quien": "who-we-serve",
  servicios: "services",
  diagnostico: "diagnosis",
  "invertir-fuera": "investing-abroad",
  oportunidades: "opportunities",
  metodo: "how-we-work",
  dinero: "your-money",
  equipo: "team",
  preguntas: "faq",
  contacto: "contact",
};

(() => {
  // al llegar con una seccion en la direccion (por ejemplo desde el selector de idioma), se va directo
  // en lugar de recorrer toda la pagina con el desplazamiento suave
  if (location.hash.length > 1) {
    const seccion = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (seccion) {
      const raiz = document.documentElement;
      raiz.style.scrollBehavior = "auto";
      seccion.scrollIntoView({ block: "start" });
      const colocada = window.scrollY;
      window.addEventListener("load", () => {
        if (Math.abs(window.scrollY - colocada) < 5) seccion.scrollIntoView({ block: "start" });
        requestAnimationFrame(() => { raiz.style.scrollBehavior = ""; });
      }, { once: true });
    }
  }

  const cab = document.getElementById("cab");
  if (cab) {
    // la cabecera se vuelve solida en cuanto se baja, para que el menu no se mezcle con la pagina
    const fijar = () => cab.classList.toggle("solida", window.scrollY > 8);
    fijar();
    window.addEventListener("scroll", fijar, { passive: true });

    // menu del telefono y la tableta: abre el mismo nav a pantalla completa y deja el resto de la pagina inerte
    const boton = cab.querySelector(".abre-menu");
    const menu = document.getElementById("menu-principal");
    if (boton && menu) {
      const inertes = [document.querySelector(".salto"), document.querySelector("main"), document.querySelector("footer.pie")].filter(Boolean);
      const abrir = (si) => {
        cab.classList.toggle("abierta", si);
        boton.setAttribute("aria-expanded", String(si));
        boton.textContent = si ? TEXTOS.cerrar : TEXTOS.menu;
        document.body.style.overflow = si ? "hidden" : "";
        inertes.forEach((el) => { el.inert = si; });
        if (si) {
          const primero = menu.querySelector("a");
          if (primero) primero.focus({ preventScroll: true });
        }
      };
      boton.addEventListener("click", () => abrir(!cab.classList.contains("abierta")));
      // cualquier enlace de la cabecera cierra el menu: los del nav y tambien la marca
      cab.addEventListener("click", (e) => { if (e.target.closest("a") && cab.classList.contains("abierta")) abrir(false); });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && cab.classList.contains("abierta")) {
          abrir(false);
          boton.focus();
        }
      });
      window.matchMedia("(min-width:1000px)").addEventListener("change", () => {
        if (cab.classList.contains("abierta")) abrir(false);
      });
    }

    // en el telefono no hay dos llamadas iguales a la vista: Hablemos se aparta mientras se ven la de la portada o el contacto
    const llamadas = [document.querySelector(".portada .acciones"), document.querySelector("section.contacto")].filter(Boolean);
    if (llamadas.length && "IntersectionObserver" in window) {
      const vistas = new Set();
      // lo que queda tapado por la cabecera fija no cuenta como visto
      const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? vistas.add(e.target) : vistas.delete(e.target)));
        cab.classList.toggle("sin-cta", vistas.size > 0);
      }, { rootMargin: `-${cab.offsetHeight}px 0px 0px 0px` });
      llamadas.forEach((el) => observador.observe(el));
    }
  }
  const anio = document.getElementById("anio");
  if (anio) anio.textContent = String(new Date().getFullYear());

  // al cambiar de idioma se abre la otra version en la seccion que se estaba leyendo
  const equivalente = (id) => {
    if (INGLES) return Object.keys(SECCIONES).find((es) => SECCIONES[es] === id);
    return SECCIONES[id];
  };
  document.querySelectorAll("[data-cambio-idioma]").forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      const secciones = [...document.querySelectorAll("main section[id]")];
      let actual = null;
      for (const s of secciones) {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) actual = s;
      }
      const destino = actual && window.scrollY > 8 ? equivalente(actual.id) : null;
      if (!destino || destino === "inicio" || destino === "home") return;
      e.preventDefault();
      window.location.href = `${enlace.getAttribute("href").split("#")[0]}#${destino}`;
    });
  });

  const form = document.getElementById("guia");
  if (!form) return;
  const pasos = [...form.querySelectorAll(".paso")];
  const total = pasos.length - 1;
  const barra = document.getElementById("guia-progreso");
  const contador = document.getElementById("guia-paso");
  const atras = document.getElementById("guia-atras");
  const sig = document.getElementById("guia-sig");
  const error = document.getElementById("guia-error");
  const pie = form.querySelector(".guia-pie");
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const telefono = window.matchMedia("(max-width:760px)");
  let actual = 0;
  // avance automatico al elegir una opcion unica: un solo temporizador pendiente
  let temporizador = 0;
  // justo despues de cambiar de paso se ignoran los toques en las opciones: un segundo toque rapido no marca nada del paso nuevo
  let calmaHasta = 0;

  const limpiarError = () => {
    error.textContent = "";
    pasos.forEach((p) => {
      p.removeAttribute("aria-describedby");
      p.querySelectorAll("[aria-invalid]").forEach((campo) => campo.removeAttribute("aria-invalid"));
    });
  };

  const mostrar = (n, enfocar = true) => {
    clearTimeout(temporizador);
    actual = n;
    const final = n === total;
    pasos.forEach((p, k) => p.classList.toggle("activo", k === n));
    limpiarError();
    contador.textContent = final ? TEXTOS.listo : TEXTOS.paso(n + 1, total);
    barra.style.width = `${((final ? total : n) / total) * 100}%`;
    atras.hidden = n === 0 || final;
    sig.hidden = final;
    sig.textContent = n === total - 1 ? TEXTOS.enviar : TEXTOS.continuar;
    if (enfocar) {
      calmaHasta = performance.now() + 350;
      const paso = pasos[n];
      let foco = paso;
      if (paso.dataset.tipo === "unica" || paso.dataset.tipo === "multiple") {
        // en los pasos de opciones se enfoca el grupo: se lee la pregunta y ninguna opcion parece elegida
        paso.tabIndex = -1;
      } else {
        foco = paso.querySelector("input:not(.trampa)") || paso;
      }
      foco.focus({ preventScroll: true });
      if (cab) {
        const arriba = form.getBoundingClientRect().top;
        const sitio = cab.offsetHeight + (parseFloat(getComputedStyle(form).scrollMarginTop) || 0);
        // en el telefono cada paso empieza arriba, bajo la cabecera, para que sus opciones no queden tapadas por la barra de botones;
        // en pantallas mayores solo se recoloca si el formulario ha quedado por encima de la cabecera
        const recolocar = telefono.matches ? Math.abs(arriba - sitio) > 24 : arriba < cab.offsetHeight;
        if (recolocar) form.scrollIntoView({ block: "start", behavior: reducir ? "auto" : "smooth" });
      }
    }
  };

  const problema = (n) => {
    const p = pasos[n];
    switch (p.dataset.tipo) {
      case "texto":
        return p.querySelector("input").value.trim().length < 2 ? TEXTOS.nombre : "";
      case "unica":
        return p.querySelector("input:checked") ? "" : TEXTOS.unica;
      case "multiple":
        return p.querySelector("input:checked") ? "" : TEXTOS.multiple;
      case "contacto": {
        const email = p.querySelector("input[type=email]").value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return TEXTOS.correo;
        if (!p.querySelector("input[name=privacidad]").checked) return TEXTOS.privacidad;
        return "";
      }
      default:
        return "";
    }
  };

  const datos = () => {
    const fd = new FormData(form);
    return {
      nombre: String(fd.get("nombre") || "").trim(),
      perfil: String(fd.get("perfil") || ""),
      temas: fd.getAll("temas").map(String),
      patrimonio: String(fd.get("patrimonio") || ""),
      email: String(fd.get("email") || "").trim(),
      telefono: String(fd.get("telefono") || "").trim(),
      idioma: INGLES ? "en" : "es",
    };
  };

  const correo = (d) => {
    const [n, p, t, pa, c, te] = TEXTOS.etiquetas;
    const cuerpo = [
      `${n}: ${d.nombre}`,
      `${p}: ${d.perfil}`,
      `${t}: ${d.temas.join(", ")}`,
      `${pa}: ${d.patrimonio}`,
      `${c}: ${d.email}`,
      d.telefono ? `${te}: ${d.telefono}` : "",
      TEXTOS.idioma,
    ].filter(Boolean).join("\n");
    return `mailto:${CONFIG.destino}?cc=${CONFIG.copia}&subject=${encodeURIComponent(TEXTOS.asunto)}&body=${encodeURIComponent(cuerpo)}`;
  };

  const enviar = async () => {
    if (form.querySelector(".trampa").value) { mostrar(total); return; }
    const d = datos();
    document.getElementById("fin-nombre").textContent = d.nombre.split(/\s+/)[0];
    const texto = document.getElementById("fin-texto");
    if (!CONFIG.endpoint) {
      texto.textContent = TEXTOS.preparado(CONFIG.destino);
      window.location.href = correo(d);
      mostrar(total);
      return;
    }
    sig.disabled = true;
    sig.textContent = TEXTOS.enviando;
    try {
      const r = await fetch(CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error(String(r.status));
      texto.textContent = TEXTOS.recibido;
      mostrar(total);
    } catch (e) {
      error.textContent = TEXTOS.error;
      const enlace = document.createElement("a");
      enlace.href = correo(d);
      enlace.textContent = TEXTOS.porCorreo;
      error.append(enlace);
    } finally {
      sig.disabled = false;
      sig.textContent = TEXTOS.enviar;
    }
  };

  const avanzar = () => {
    const fallo = problema(actual);
    if (fallo) {
      error.textContent = fallo;
      // el error queda asociado al paso y, si viene de un campo, al propio campo
      const paso = pasos[actual];
      paso.setAttribute("aria-describedby", "guia-error");
      paso.querySelectorAll("[aria-invalid]").forEach((c) => c.removeAttribute("aria-invalid"));
      const campo = paso.dataset.tipo === "texto" ? paso.querySelector("input")
        : fallo === TEXTOS.correo ? paso.querySelector("input[type=email]") : null;
      if (campo) campo.setAttribute("aria-invalid", "true");
      // el error va encima de los botones; si el pie no esta a la vista (telefono en horizontal), se trae
      const r = pie.getBoundingClientRect();
      if (r.bottom > window.innerHeight || r.top < (cab ? cab.offsetHeight : 0)) {
        pie.scrollIntoView({ block: "nearest", behavior: "instant" });
      }
      return;
    }
    if (actual < total - 1) mostrar(actual + 1);
    else enviar();
  };

  form.addEventListener("submit", (e) => { e.preventDefault(); avanzar(); });
  atras.addEventListener("click", () => mostrar(Math.max(0, actual - 1)));

  // el aviso desaparece en cuanto el paso queda bien, sin esperar a pulsar Continuar
  form.addEventListener("input", () => {
    if (error.textContent && problema(actual) !== error.textContent) limpiarError();
  });

  // solo avanza sola una opcion elegida con el dedo o el raton; con las flechas se recorren las opciones
  // y se continua con Intro o con el boton
  let conPuntero = false;
  form.addEventListener("pointerdown", () => { conPuntero = true; });
  form.addEventListener("keydown", (e) => {
    conPuntero = false;
    if (e.key === "Enter" && (e.target.type === "radio" || e.target.type === "checkbox")) {
      e.preventDefault();
      avanzar();
    }
  });
  form.addEventListener("click", (e) => {
    if (performance.now() < calmaHasta && e.target.closest(".opcion")) e.preventDefault();
  }, true);
  form.addEventListener("change", (e) => {
    if (e.target.type !== "radio" || !conPuntero || !pasos[actual].contains(e.target)) return;
    const paso = actual;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { if (actual === paso) avanzar(); }, reducir ? 0 : 260);
  });
  mostrar(0, false);
})();
