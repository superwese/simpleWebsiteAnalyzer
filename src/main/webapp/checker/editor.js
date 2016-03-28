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

(function () {
    "use strict";
    /* globals angular */
    /* jshint browser:true */

    /**
     * This module cover the Controller for the "Edit" page an associated Klassen.
     */
    angular.module('WebsiteParser.CheckEdit', ['WebsiteParser.Checker', 'ui.bootstrap', 'ngRoute', 'pascalprecht.translate'])
            .config(configure)
            .controller('CheckEditorCtrl', CheckEditorController);


    configure.$inject = ['$translatePartialLoaderProvider', '$routeProvider'];
    
    function configure($translatePartialLoaderProvider, $routeProvider) {
        $translatePartialLoaderProvider.addPart('runner');
        $routeProvider.when('/edit', {
            templateUrl: 'checker/editor.html',
            controller: 'CheckEditorCtrl',
            controllerAs: 'Editor'
        });
    }

    CheckEditorController.$inject = ['CheckerProvider', 'AvailableChecks'];
    function CheckEditorController(CheckerProvider, AvailableChecks) {

        var vm = this;
        vm.activeChecks = CheckerProvider.configuredCheckers; //hold a direct Reference
        vm.availableChecks = AvailableChecks;
        
        vm.removeCheck = removeCheck;
        vm.newCheck = newCheck;
        vm.addCheck = addCheck;
        
        //functions:
        function addCheck() {
            var theConstructor, theCheck, args = vm.creatorOptions;
            try {
                theConstructor = AvailableChecks[vm.creatorOptions.typeToCreate];
                theCheck = new theConstructor(args.selector, args.additional); //wenigstens ist einmal was einfacher
                CheckerProvider.putChecker(args.name, theCheck);
            } catch (e) {
                vm.creatingError = e;
                throw e;
            }
        }
        
        
        /**
         * Selects a new Check of the desired type to be specified
         * @param {String} type
         * @returns nothing
         */
        function newCheck(type){
            vm.isCreatingNew = true;
            vm.creatorOptions = {};
            vm.creatorOptions.typeToCreate = type;
            var constructorFn = AvailableChecks[type];
            if (constructorFn.length > 1) {
                vm.creatorOptions.needsAdditionalParameter = true;
            }
        }
        function removeCheck(which) {
            CheckerProvider.deleteChecker(which);
        }
        
       

    }
    
    
    
    
}());
