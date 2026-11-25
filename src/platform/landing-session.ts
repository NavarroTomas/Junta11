import { platformClient } from "@/lib/platform/client";

const admin = document.querySelector<HTMLAnchorElement>("#landing-admin");
const access = document.querySelector<HTMLAnchorElement>('.menu-links a[href="/login"]');
if (admin && access) {
  platformClient().auth.onAuthStateChange((_event, session) => {
    admin.hidden = !session;
    access.href = session ? "/mis-ligas" : "/login";
    access.textContent = session ? "Administrar" : "Iniciar sesión";
  });
}
