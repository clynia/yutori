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
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let actual = 0;

  const mostrar = (n, enfocar = true) => {
    actual = n;
    const final = n === total;
    pasos.forEach((p, k) => p.classList.toggle("activo", k === n));
    contador.textContent = final ? TEXTOS.listo : TEXTOS.paso(n + 1, total);
    barra.style.width = `${((final ? total : n) / total) * 100}%`;
    atras.hidden = n === 0 || final;
    sig.hidden = final;
    sig.textContent = n === total - 1 ? TEXTOS.enviar : TEXTOS.continuar;
    error.textContent = "";
    if (enfocar) {
      const foco = pasos[n].querySelector("input:not(.trampa)") || pasos[n];
      foco.focus({ preventScroll: true });
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
    if (fallo) { error.textContent = fallo; return; }
    if (actual < total - 1) mostrar(actual + 1);
    else enviar();
  };

  form.addEventListener("submit", (e) => { e.preventDefault(); avanzar(); });
  atras.addEventListener("click", () => mostrar(Math.max(0, actual - 1)));
  form.addEventListener("change", (e) => {
    if (e.target.type === "radio" && pasos[actual].contains(e.target)) setTimeout(avanzar, reducir ? 0 : 260);
  });
  mostrar(0, false);
})();
