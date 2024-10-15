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
        return '⚠️ Dados de clima indisponíveis no momento. Tente novamente mais tarde.';
    }

    const { description } = weather[0];
    const { temp, feels_like, temp_min, temp_max, humidity } = main;

    return stripIndent`
        🌍 *Clima em ${name}* 
        🌡️ Temperatura atual: *${temp}°C*
        🤒 Sensação térmica: *${feels_like}°C*
        📉 Mínima: *${temp_min}°C*
        📈 Máxima: *${temp_max}°C*
        💧 Umidade: *${humidity}%*
        ☁️ Condição: *${description}*

        🔍 _Fique de olho no clima e se cuide!_
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

            let responseText;
            try {
                responseText = formataDados(data);
                responseText += `\n\n🌟 Obrigado por usar nosso serviço! 😄`;
            } catch (error) {
                console.log('Erro ao formatar os dados:', error);
                responseText = 'Erro ao processar os dados do clima.';
            }

            console.log('Enviando resposta formatada:', responseText);
            twiml.message(responseText);
            callback(null, twiml);
        })
        .catch((err) => {
            console.log('Erro ao chamar a API:', err.message);
            twiml.message('🚨 Ops! Falha ao pesquisar o clima na cidade que você pediu. Tente novamente mais tarde.');
            callback(null, twiml);
        });
};