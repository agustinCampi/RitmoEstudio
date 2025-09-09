/**
 * Este módulo contiene funciones para enviar notificaciones a través de webhooks.
 */

// Interfaz para el payload esperado por el webhook de actualización.
interface ClassUpdatePayload {
  className: string;
  message: string;
  schedule?: string[];
  teacherName?: string;
  studentEmails: string[];
}

// Interfaz para el payload esperado por el webhook de cancelación.
interface ClassCancelPayload {
  className: string;
  message: string;
  studentEmails: string[];
}

/**
 * Envía una notificación cuando una clase ha sido actualizada.
 * @param payload - La información a enviar al webhook.
 */
export async function sendClassUpdateNotification(payload: ClassUpdatePayload) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('MAKE_WEBHOOK_URL no está configurada. Saltando notificación de actualización.');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log(`Notificación de actualización para la clase "${payload.className}" enviada.`);
  } catch (error) {
    console.error('Error al enviar la notificación de actualización:', error);
  }
}

/**
 * Envía una notificación cuando una clase ha sido cancelada.
 * @param payload - La información a enviar al webhook.
 */
export async function sendClassCancellationNotification(payload: ClassCancelPayload) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('MAKE_WEBHOOK_URL no está configurada. Saltando notificación de cancelación.');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log(`Notificación de cancelación para la clase "${payload.className}" enviada.`);
  } catch (error) {
    console.error('Error al enviar la notificación de cancelación:', error);
  }
}
