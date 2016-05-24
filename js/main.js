requirejs.config({
    baseUrl: './',
    paths: {
        'angular': [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.min',
            'js/lib/angular'
        ],
        'angularRoute': 'js/lib/angular-route.min',
        'jquery': [
            'https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min',
            'js/lib/jquery-1.10.2.min'
        ],
        'fabricjs': [
            'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.6.2/fabric.min',
            'js/lib/fabric' 
        ],
        'simplebar': 'js/lib/simplebar',
        'spectrum': 'js/lib/spectrum',
        'pdp' : 'js/app/pdp',
        'customjQueryScript': 'js/app/customjQueryScript',
        'action': 'js/app/action',
        'app': 'js/app',
        'undomanager': 'js/lib/undomanager',
        'PdpHistory': 'js/app/PdpHistory'
    },
    shim: {
        'angular': {
            deps: ['fabricjs','pdp'],
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
        },
        'action' : {
            deps: ['jquery', 'fabricjs', 'pdp']
        }
    },
    // kick start angular application
    deps: ['app']
});