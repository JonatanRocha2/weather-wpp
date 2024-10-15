const axios = require('axios');
const { stripIndent } = require('common-tags');
const { escape } = require('querystring');

const api_key = process.env.API_KEY;
const lang = 'pt_br';
const unit = 'metric';

function formataDados({ weather, main, name }) {
    console.log('Formatando os dados do clima...');

    if (!weather || weather.length === 0) {
        console.log('Weather não definido ou vazio.');
        return 'Dados de clima indisponíveis no momento.';
    }

    const { description } = weather[0];
    const { temp, feels_like, temp_min, temp_max, humidity } = main;

    return stripIndent`
        *${name}* (${temp}°C)
        Sensação térmica de ${feels_like}°C
        Mínima de ${temp_min}°C
        Máxima de ${temp_max}°C
        \`\`${description}\`\`
        Umidade: ${humidity}%
    `;
}

exports.handler = function (context, event, callback) {
    const twiml = new Twilio.twiml.MessagingResponse();
    console.log('Recebido o evento:', event);

    const query = escape(event.Body);
    console.log('Cidade recebida:', query);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${api_key}&lang=${lang}&units=${unit}`;
    console.log('Chamando a API com URL:', url);

    axios
        .get(url)
        .then((response) => {
            console.log('Resposta da API recebida:', response.data);
            const data = response.data;

            // Formata os dados com verificação se o dado existe
            let responseText = formataDados(data);
            responseText += `\n\n\n Obrigado por perguntar!`;

            // Envia a mensagem com o clima
            twiml.message(responseText);
            callback(null, twiml);
        })
        .catch((err) => {
            console.log('Erro ao chamar a API:', err.message);
            twiml.message('Falha ao pesquisar o clima na cidade que você pediu.');
            callback(null, twiml);
        });
};