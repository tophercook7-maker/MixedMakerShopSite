// DO NOT RE-ENABLE: Uses Topher@mixedmakershop.com as From - causes DMARC/DKIM failures.

exports.handler = async function(event) {

  const data = JSON.parse(event.body);

  const email = data.email;
  const name = data.name || "there";

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "MixedMakerShop <Topher@mixedmakershop.com>",
      to: email,
      subject: "Got it — I received your message",
      html: `
        <p>Hi ${name},</p>

        <p>Thanks for reaching out to MixedMakerShop.</p>

        <p>I received your message and will review it shortly. I usually reply within one business day.</p>

        <p>If you requested a website check, I'll take a quick look and send you a few helpful suggestions.</p>

        <p>— Topher<br>
        MixedMakerShop<br>
        Hot Springs, Arkansas</p>
      `
    })
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
