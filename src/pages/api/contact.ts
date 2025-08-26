import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, lang }) => {
  const api_url = import.meta.env.PUBLIC_SUPABASE_URL;
  const token = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const idea = formData.get("idea");

  const data = { name, email, idea };
  if (!data.name || !data.email || !data.idea) {
    window.location.href = `/${lang}/problem`;
    return;
  }
  const res = await fetch(`${api_url}/enterprise_project`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data,
    }),
  });
  if (!res.ok) {
    window.location.href = `/${lang}/problem`;
    return;
  }
  window.location.href = `/${lang}/thanks`;
};
