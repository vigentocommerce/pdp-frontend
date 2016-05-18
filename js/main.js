requirejs.config({
    baseUrl: 'js',
    paths: {
        'angular': [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.min',
            'lib/angular'
        ],
        'angularRoute': 'lib/angular-route.min',
        'jquery': [
            'https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min',
            'lib/jquery-1.10.2.min'
        ],
        'fabricjs': [
            'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.6.2/fabric.min',
            'lib/fabric' 
        ],
        'simplebar': 'lib/simplebar',
        'spectrum': 'lib/spectrum',
        'pdp' : 'app/pdp',
        'customjQueryScript': 'app/customjQueryScript',
        'app': 'app',
    },
    shim: {
        'angular': {
            deps: ['fabricjs'],
			exports: 'angular'
		},
        'jquery': {
            deps: ['fabricjs'],
		},
        'angularRoute': {
            deps: ['angular']  
        },
        'simplebar': {
            deps: ['jquery']
        },
        'spectrum': {
            deps: ['jquery']
        }
    },
    // kick start angular application
    deps: ['app']
});