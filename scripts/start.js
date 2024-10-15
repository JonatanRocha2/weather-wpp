const axios = require('axios');
const { stripIndent } = require('common-tags');
const { escape } = require('querystring');

const api_key = process.env.API_KEY;
const lang = 'pt_br';
const unit = 'metric';

exports.handler = function(context, event, callback) {
	const twiml = new Twilio.twiml.MessagingResponse();
	
	const query = escape(event.Body);
	// Correção: uso de template literal (crase) para interpolação das variáveis
	const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${api_key}&lang=${lang}&units=${unit}`;
	
	axios
        .get(url)
        .then((data) => {
            console.log('resposta', data.data.name);
            return 'ta funcionando...';
        })
        .catch((err) => {
            console.log(err);
            return('Falha ao pesquisar o clima na cidade que você pediu.');
        })
	.then((response) => {
    	twiml.message("Hello Weather");
	    callback(null, twiml);
	});
};
