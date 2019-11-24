module.exports = {
	services: {
		speech: {
			service: require('./lib/speech'),
			storeType: 'service'
		}
	}
	// adapters: {
	// 	speechconsole: require('./speechconsole-adapter')
	// }
};