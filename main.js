/* Yutori Capital v4: cabecera y conversacion guiada de contacto. */
const CONFIG = {
  // Receptor del formulario (por ejemplo un webhook de n8n con Turnstile). Mientras este vacio,
  // el formulario prepara un correo con las respuestas para que la persona solo tenga que enviarlo.
  endpoint: "",
  destino: "f.ojeda@yutorikapital.com",
  copia: "m.santana@yutorikapital.com",
};

(() => {
  const cab = document.getElementById("cab");
  const portada = document.getElementById("inicio");
  if (cab && portada && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => cab.classList.toggle("solida", !e.isIntersecting), { rootMargin: "-84px 0px 0px 0px" }).observe(portada);
  } else if (cab) {
    cab.classList.add("solida");
  }
  const anio = document.getElementById("anio");
  if (anio) anio.textContent = String(new Date().getFullYear());

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
    contador.textContent = final ? "Listo" : `${n + 1} de ${total}`;
    barra.style.width = `${((final ? total : n) / total) * 100}%`;
    atras.hidden = n === 0 || final;
    sig.hidden = final;
    sig.textContent = n === total - 1 ? "Enviar" : "Continuar";
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
        return p.querySelector("input").value.trim().length < 2 ? "Escriba su nombre para continuar." : "";
      case "unica":
        return p.querySelector("input:checked") ? "" : "Elija una opción para continuar.";
      case "multiple":
        return p.querySelector("input:checked") ? "" : "Elija al menos una opción.";
      case "contacto": {
        const email = p.querySelector("input[type=email]").value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Revise el correo electrónico.";
        if (!p.querySelector("input[name=privacidad]").checked) return "Necesitamos su conformidad con la política de privacidad.";
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
    };
  };

  const correo = (d) => {
    const cuerpo = [
      `Nombre: ${d.nombre}`,
      `Perfil: ${d.perfil}`,
      `Qué quiere resolver: ${d.temas.join(", ")}`,
      `Patrimonio aproximado: ${d.patrimonio}`,
      `Correo: ${d.email}`,
      d.telefono ? `Teléfono: ${d.telefono}` : "",
    ].filter(Boolean).join("\n");
    return `mailto:${CONFIG.destino}?cc=${CONFIG.copia}&subject=${encodeURIComponent("Primera conversación con Yutori")}&body=${encodeURIComponent(cuerpo)}`;
  };

  const enviar = async () => {
    if (form.querySelector(".trampa").value) { mostrar(total); return; }
    const d = datos();
    document.getElementById("fin-nombre").textContent = d.nombre.split(/\s+/)[0];
    const texto = document.getElementById("fin-texto");
    if (!CONFIG.endpoint) {
      texto.textContent = `Hemos preparado su mensaje en su programa de correo: solo tiene que enviarlo. Si no se ha abierto, escríbanos a ${CONFIG.destino}.`;
      window.location.href = correo(d);
      mostrar(total);
      return;
    }
    sig.disabled = true;
    sig.textContent = "Enviando";
    try {
      const r = await fetch(CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error(String(r.status));
      texto.textContent = "Le escribiremos personalmente para buscar un momento que le venga bien.";
      mostrar(total);
    } catch (e) {
      error.textContent = "No hemos podido enviar el formulario. ";
      const enlace = document.createElement("a");
      enlace.href = correo(d);
      enlace.textContent = "Envíelo por correo";
      error.append(enlace);
    } finally {
      sig.disabled = false;
      sig.textContent = "Enviar";
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
