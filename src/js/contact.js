/**
 * Contact form — client-side validation only.
 *
 * To make it live, replace the body of `send()` with a POST to your endpoint
 * (Formspree, Basin, a Netlify function, your own API — whatever you use).
 */

export function initContact() {
  const form = document.getElementById('contactForm');
  const done = document.getElementById('formDone');
  if (!form) return;

  const fields = [...form.querySelectorAll('input[required], textarea[required]')];

  const validate = (input) => {
    const ok = input.checkValidity() && input.value.trim().length > 0;
    input.closest('.field')?.setAttribute('data-invalid', String(!ok));
    return ok;
  };

  fields.forEach((input) => {
    input.addEventListener('blur', () => validate(input));
    input.addEventListener('input', () => {
      if (input.closest('.field')?.dataset.invalid === 'true') validate(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const results = fields.map(validate);
    if (results.includes(false)) {
      form.querySelector('.field[data-invalid="true"] input, .field[data-invalid="true"] textarea')?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const button = form.querySelector('.submit');
    const original = button.textContent;
    button.disabled = true;

    try {
      await send(data);
      form.querySelectorAll('.field').forEach((f) => f.removeAttribute('data-invalid'));
      form.reset();
      if (done) {
        done.hidden = false;
        done.focus?.();
      }
    } catch (err) {
      console.error('[contact] send failed', err);
      button.textContent = 'Une erreur est survenue — réessayez';
      setTimeout(() => (button.textContent = original), 3200);
    } finally {
      button.disabled = false;
    }
  });
}

/** Stub transport. Swap this out for a real request. */
async function send(data) {
  console.info('[contact] enquiry (demo — not sent):', data);
  await new Promise((r) => setTimeout(r, 550));
}
