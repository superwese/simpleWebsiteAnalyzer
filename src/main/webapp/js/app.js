/* 
 * Copyright 2016 ikke.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * 
 * This is the "application".
 * It holds some basics, such as global configuration, Constants, Navigation.
 * It has dependencies to other modules.
 */

(function () {
    'use strict';
    /* globals angular */
    /* jshint browser:true */
    angular.module('WebsiteParser', [ 'WebsiteParser.Runner', 'WebsiteParser.CheckEdit', 'ui.bootstrap', 
                                      'ngRoute', 'ngAnimate', 'pascalprecht.translate', 'tmh.dynamicLocale', 'ngSanitize'])
            .controller('NavigationCtrl', NavigationController)
            .config(configure)
            .run(onRunning);

    /**
     * The main configuration. Sets defaults and basic configuration.
     * Sets i18n
     */
    configure.$inject = ['$routeProvider', '$compileProvider', '$translateProvider', 'tmhDynamicLocaleProvider', '$translatePartialLoaderProvider'];
    function configure($routeProvider, $compileProvider, $translateProvider, tmhDynamicLocaleProvider, $translatePartialLoaderProvider) {
        //Set routes
        $routeProvider.when('/about',
                        {templateUrl: 'readme.html'}
                )
                .otherwise({redirectTo: '/run'});

        $compileProvider.debugInfoEnabled(false);

        //i18n
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '{part}/{lang}.json'
        });

        //http://angular-translate.github.io/docs/#/guide/09_language-negotiation
        //detectpreferredLanguage() ist mir erstmal zu aufwendig
        $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
        $translateProvider.preferredLanguage('de');
        //$translateProvider.useLocalStorage();
        $translateProvider.fallbackLanguage('de');
        $translateProvider.useSanitizeValueStrategy('escapeParameters');
        $translatePartialLoaderProvider.addPart('home');

        tmhDynamicLocaleProvider.localeLocationPattern('js/libs/angular.js/i18n/angular-locale_{{locale}}.js');
        tmhDynamicLocaleProvider.defaultLocale('de');

    }

    onRunning.$inject = ['$rootScope', '$translate', 'tmhDynamicLocale'];
    function onRunning($rootScope, $translate, tmhDynamicLocale) {
        var changeListener = $rootScope.$on('$translatePartialLoaderStructureChanged', function (event, data) {
            $translate.refresh();
        });

        //Der wird auch beim Starten gefeuert:
        var translateChangeSuccessListener = $rootScope.$on('$translateChangeSuccess', function (event, data) {
            $rootScope.usersLanguage = data.language;
            tmhDynamicLocale.set(data.language);

        });

        $rootScope.$on('$destroy', function () {
            changeListener();
            translateChangeSuccessListener();
        });

    }

    /**
     * The Navigation Controller.
     * Nothing fancy here.
     * I just wanted to use bootstrap "tabs", but I also want to have
     * location changes.
     */
    NavigationController.$inject = ['$location'];
    function NavigationController($location) {
        var vm = this,
            initialPath = $location.path();

        vm.tabs = [
            {link: '#/run', label: '=Run=', path: '/run'},
            {link: '#/edit', label: '=Configure=', path: '/edit'},
            {link: '#/about', label: '=About=', path: '/about'}
        ];
        if ( initialPath ) {
            angular.forEach(vm.tabs,function(tab,i){
                if ( tab.path == initialPath ) {
                    vm.selectedTab = tab;
                }
            });
        } else {
            vm.selectedTab = vm.tabs[0];
        }    
        vm.setSelectedTab = function (tab) {
            vm.selectedTab = tab;
        };

        vm.tabClass = function (tab) {
            if (vm.selectedTab == tab) {
                return 'active';
            } else {
                return '';
            }
        };
    }

   

}());