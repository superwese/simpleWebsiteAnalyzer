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
    'use strict';
    /* globals angular */
    /* jshint browser:true */
    /**
     * This module runs the parsing.
     */
    //placing it here makes it easier for build scripts to find and change it.
    var remoteAppUrl = 'urls/';

    angular.module('WebsiteParser.Runner', [ 'WebsiteParser.Checker', 'ui.bootstrap', 'ngRoute', 'pascalprecht.translate'])
            .controller('RunnerCtrl', FormController)
            .service('RemoteService', RemoteService)
            .config(configure);


    configure.$inject = ['$translatePartialLoaderProvider', '$routeProvider'];
    function configure($translatePartialLoaderProvider, $routeProvider) {
        $translatePartialLoaderProvider.addPart('runner');
        $routeProvider.when('/run', {
            templateUrl: 'runner/form.html'
        });
    }
    /**
     * This service connects to the web API.
     */
    RemoteService.$inject = ['$http', '$window'];
    function RemoteService($http, $window) {
        var me = this;
        me.getSource = getSource;
        me.ping = ping;

        /**
         * gets the HTML source for the given URL.
         * connects the "analyze" Resource on the WebService.
         * @param {String} fromURL
         * @returns {Object} a promise.
         */
        function getSource(fromURL) {
            //http://localhost:8080/is24Example/urls/analyze/http%3A%2F%2Fwww.wese.org%2Fsample.html
            var encoded = $window.encodeURIComponent(fromURL);

            return $http.get(remoteAppUrl + 'analyze/' + encoded);
        } 
        
        
        function ping(what) {
            var encoded = $window.encodeURIComponent(what);
            return $http.get(remoteAppUrl + 'ping/' + encoded);
        }
        
        
    }

    /**
     * This controller takes care of the UI for running the parsing process
     */
    FormController.$inject = ['$document', '$location', 'RemoteService', '$window', 'CheckerProvider', '$q', 'CheckerFactory'];
    function FormController($document, $location, RemoteService, $window, CheckerProvider, $q, CheckerFactory) {
        var vm = this;
        //indicates if we are doing something:
        vm.isWorking = false;
        vm.hasError = false;
        vm.numChecks = vm.stepsToPerform = vm.stepsPerformed = 0;
        vm.request = {};
        vm.response = {};
        vm.results = {};

        //holds the url to analyze
        vm.toFetch;
        
        //declare some methods: making all methods "public should simplify testing.
        vm.performChecks = performChecks;
        vm.createLinkChecker = createLinkChecker;

        vm.fetch = function () {
            vm.isWorking = vm.isFetching = true;
            vm.hasError = false;
            vm.results = vm.response = vm.results = {};
            vm.linkChecker = createLinkChecker();
            vm.linkChecker.withFormatter(linkCheckFormatter);
            CheckerProvider.putChecker('followedLinks', vm.linkChecker);
            vm.numChecks = vm.stepsToPerform = $window.Object.keys(CheckerProvider.getCheckers()).length + 2; //muss ja auch holen und den doctype ermitteln ;-)
            RemoteService.getSource(vm.toFetch).then(function success(response) {
                vm.stepsToPerform--;
                vm.isFetching = false;
//                console.log("got source: ", response.data.source);
                vm.results.docType = ermitteleDocType(response.data.docType);
                vm.stepsToPerform--;
                performChecks(response.data).then(function (success){
                    console.debug("alle fertig; ");
                    vm.stopIndicatingWork();

                });

            }, function error(response) {
                console.warn("da ging was schief", response);
                vm.request.hasError = vm.hasError = true;
                vm.response.errormessage = response.data.errormessage || 'fatal_internal';
                vm.response.responseStatus = response.data.responseStatus || 500;
                vm.stopIndicatingWork();
            });
        };
        
        
        
        function performChecks(result) {
            var theChecks = CheckerProvider.getCheckers(),
                htmlDocument = createHTMLDocument(result),
                thePromises = {};
            //schon mal den Namen des Checks in die Liste tun:
            angular.forEach(theChecks,function(checker,name){
                vm.results[name] = '';
            });
            angular.forEach(theChecks, function(checker, name) {
                var resolver = function (resolve, reject) {
                    try {
                        checker.perform(htmlDocument);
                        resolve(checker.toString());
                    } catch(e) {
                        reject(e);
                    } finally {
                        vm.stepsToPerform--;
                    }
                };
                var aPromise = $q(resolver);
                aPromise.then(function(ergebnis){
                    vm.results[name] = ergebnis;
                }, function(fehler) {
                    vm.results[name] =  fehler;
                });
                thePromises[name] = aPromise;
            });
            console.debug("alle promises gemacht");
            return $q.all(thePromises);
        }
        
        /**
         * Der Linkcheck ist etwas besonderes, weil man die baseHref braucht und die Verbindung prüfen muss.
         * Deshalb muss auch die Nebenläufigkeit anders geregelt werden, damit nicht dieser Check fehlschlägt, nur weil eine URL nicht erreichbar war.
         * 
         * Alle links sind absoult, so kann man zuverlässig auf den hostname prüfen und #Elemente entfernen.
         * 
         * Mit RegEx den Pfad zum Ordner raten ( links ohne Slash am Ende funktionieren auf Verzeichnisse ) 
         * oder zu raten, ob ein Link extern (href="//anderer.host.com") ist, ist zu anfällig;
         * So kann man dann auch die Anzahl der request reduzieren.
         * 
         * 
         * @returns {Object} den Check
         */
        function createLinkChecker() {
            var baseHref = vm.toFetch,
                baseLink = $window.document.createElement("a");
            baseLink.href = baseHref;
            
            //console.log("the baseDir is: ", baseLink.hostname, baseLink.pathname );
            
            var linkChecker = CheckerFactory.newAttributeExtractingCheck("a[href]", "href");
            linkChecker.linksToCheck = linkChecker.linksChecked = 0;
            linkChecker.isUserEditable = false;
            
            
            /**
             * Diese Methode blockt, bis sie die effektiv zu prüfenden Links ermittelt hat.
             * Danach gibt sie eine Map zurück. die Keys sind hostname + pathname, die values das Ergebnis.
             * Die Connectprüfung wird dann asynchron hinzugefügt.
             * @param {List of Nodes} loN
             * @returns das Ergebnis;
             */
            linkChecker.action = function(loN) {
                var allPromises = [];
                var effectiveLinksToTest = {};
                var counter = 0;
                angular.forEach(loN, function(node){
                    counter++;
                    var partialResult = {},
                        link = angular.element(node).attr(this.attrName),
                        linkToTest = window.document.createElement("a");
                        linkToTest.href = link;
                    
                    partialResult.isExtern = false;  
                    var theKey = linkToTest.hostname + linkToTest.pathname;
                    if ( baseLink.hostname != linkToTest.hostname ) {
                        partialResult.isExtern = true;
                    }
                    
                    partialResult.testedLink = linkToTest.href;
                    
                    effectiveLinksToTest[theKey] = partialResult ;
                },this);
                
                linkChecker.linksToCheck = Object.keys(effectiveLinksToTest).length;
                console.log("vorher: ", counter, "nachher: ", linkChecker.linksToCheck);
                angular.forEach(effectiveLinksToTest, function(partialResult, key ){
                    var resolver = function(resolve,reject) {
                        try {
                            //Ping die URL. alle Antworten lösen nach dem responseStatus auf
                            RemoteService.ping(partialResult.testedLink).then(
                                    function(erfolg){
                                        console.log("erfolg", erfolg);
                                        var theCode = erfolg.data.responseStatus;
                                        partialResult.status = theCode;
                                        linkChecker.linksChecked++;
                                        resolve(partialResult);
                                    }, function(fehler){
                                        console.log("fehler", fehler);
                                        var theCode = fehler.data.responseStatus;
                                        partialResult.status = theCode;
                                        linkChecker.linksChecked++;
                                        resolve(partialResult);
                                    });
                        } catch(e) {
                            reject("Fehler: ", e);
                        } finally {
                            
                        }
                    };
                    var aPromise = $q(resolver);
                    
                    allPromises.push(aPromise);
                });
                var bigPromise = $q.all(allPromises);
                bigPromise.then(function(oki){
                    console.log("bigOki", oki);
                },function(nichoki){
                    console.log("nixoki", nichoki);
                });
                return bigPromise;
                //return effectiveLinksToTest;
            };
            
            linkChecker.describe = function() {
                //Hier ist dann Ende mit vererben. Die Klasse ist hier nicht bekannt, deshalb kann man hier nicht Check.prototype.describe() aufrufen.
                return 'Ich extrahiere a[href]s ermittle, ob sie intern oder extern sind und folge ihnen';
            };
            return linkChecker;
        }
        /**
         * Bekommt eine Promise auf die Ergebnisse übergeben.
         * Gibt eine Promise zurück, die auf das _formatierte_ Ergebnis resolved.
         * @param {Object} Promise ein Array von Ergebnissen pro Link.
         * @returns {Object} Promise auf das formatierte Gesamtergebnis
         */
        function xxlinkCheckFormatter(result) {
            
        }
        
        /*
         * Sammelt alle Ergebnisse, macht so Auswertung und Gibt das als eine Tabelle zuück. 
         * @param {Object} Promise auf das Ergebnis der Linkprüfung, 
         * @returns {String} eine Representation des Ergebnisses (in HTML)
         */
        function linkCheckFormatter(result) {
            var output = [],
                deferred = $q.defer();
            result.then(function(alle){
                var numIntern = 0 ,numExtern = 0,numOK = 0, numNotOK = 0,notOKs = {};
                //spätestens hier hätte man jetzt gerne Streams
                angular.forEach(alle, function(aResult){
                    aResult.isExtern ? numExtern++ : numIntern++;
                    if (aResult.status >= 200 && aResult.status < 400) {
                        numOK++;
                    } else {
                        numNotOK++;
                        notOKs[aResult.testedLink] = aResult.status;
                    }
                });
                //Und hier weiß man jetzt, dass man dafür eine directive braucht
                output.push('<pre>');
                output.push('intere Links: \t', numIntern, '\n');
                output.push('externe Links: \t', numExtern, '\n');
                output.push('Links mit Fehlern:', numNotOK, '\n');
                if ( numNotOK > 0  ) {
                    output.push('\nund zwar diese:\n');
                    angular.forEach(notOKs, function(status, link){
                        output.push('\t', link, '\t', status, '\n');
                    });
                }
                deferred.resolve( output.join('') );
            }, function(fehlgeschlagen){
                
                deferred.reject( '<pre>' + angular.toJson(fehlgeschlagen,true) + '</pre>' );
            });
            return deferred.promise;
        }
        
        /**
         * Erzeugt aus dem übergebenen Object einen String, der die HTML widerspiegeln soll.
         * Dieser wird aus piblicName, PublicID und SystemId erzeugt.
         * Ist der publicName 'html' undund gibt es keine publicId und keine systemId, so wird angenommen, das es HTML 5 ist.
         * @param {type} doctypeObj
         * @returns {doctypeObj.systemId|doctypeObj.publicId|String}
         */
        function ermitteleDocType(doctypeObj) {
            var output = 'Kein DocumentType erkannt',
                hasName = false, hasPublicId = false, hasSystemID = false;
            if ( doctypeObj.publicName ) {
                output = doctypeObj.publicName.toUpperCase();
                hasName = true;
            }
            if ( doctypeObj.publicId ) {
                output = hasName ? output + ' ' + doctypeObj.publicId : doctypeObj.publicId;
                hasPublicId = true;
            }
            if ( doctypeObj.systemId ) {
                output = (hasName || hasPublicId ) ? output + ' ' + doctypeObj.systemId : doctypeObj.systemId;
                hasSystemID = true;
            }
            
            if ( doctypeObj.publicName.toUpperCase().match('HTML') && !hasPublicId && !hasSystemID ) {
                output = 'Das ist HTML 5';
            }
            return output;
        }
        
        function createHTMLDocument(daten) {
            var htmlString = daten.source,
                documentType = daten.docType,
                root, 
                doctype,
                dom,
                allNodes;
            try {
                allNodes = $window.$.parseHTML(htmlString, null);
                doctype = $window.document.implementation.createDocumentType(documentType.publicName, documentType.publicId, documentType.systemId);
                dom = $window.document.implementation.createDocument('', 'html', doctype);
            } catch (e) {
                vm.hasError = true;
                vm.response.errormessage = e;
                throw e;
            }
            angular.forEach(allNodes, function (node) {
                dom.documentElement.appendChild(node);
            });

//            console.log("dom is ", dom, " document", dom.documentElement);
            root = angular.element(dom);
            return root;
   

        }

        vm.closeWarning = function (which) {
            vm[which].errormessage = null;
            vm.hasError = false;
        };

        vm.stopIndicatingWork = function () {
            vm.isFetching = vm.isWorking = false;
        };
        vm.tryThis = function (theEvent) {
            theEvent.preventDefault();
            var theAnchor = angular.element(theEvent.target),
                absUrl = theAnchor.prop('href');
            vm.toFetch = absUrl;
            return false;
        };
    }

    

}());
